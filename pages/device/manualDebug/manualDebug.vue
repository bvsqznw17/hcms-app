<template>
  <view class="app">
    <!-- 空白区域用于放置组合秤图片 -->
    <DouImage
      ref="douImage"
      :zzjState="zzjState"
      @boxClicked="boxClicked"
      :followDouStatus="false"
      @zzClicked="zzClicked"
      :showWeightLabel="showWeightLabel"
    ></DouImage>
    <!-- :doustatus="doustatus" -->

    <!-- 调试按钮区域 -->
    <view class="middle-section">
      <view class="debug-button-area" v-show="showDebugBtn">
        <view class="button-area">
          <!-- 包含 单次运行、连续运行、主振机、线振机、进料斗、称重斗、集料斗、强排导管、禁止斗、斗重量按钮-->
          <button
            class="action-btn"
            v-for="(btn, idx) in btns_1"
            :key="idx"
            :class="{ 'btn-checked': btn.checked }"
            :disabled="btn.disabled"
            @click="funClick(idx)"
          >
            {{ btn.name }}
          </button>
        </view>
      </view>

      <view class="debug-button-area" v-show="!showDebugBtn">
        <view class="button-area">
          <!-- 包含 采样测试、开关斗测试、振动测试、摄像头 按钮 -->
          <button
            class="action-btn"
            v-for="(btn, idx) in btns_2"
            :key="idx + 10"
            :class="{ 'btn-checked': btn.checked }"
            :disabled="btn.disabled"
            @click="funClick(idx + 10)"
          >
            {{ btn.name }}
          </button>
        </view>
      </view>
    </view>

    <!-- 添加分隔区域 -->
    <!-- <view class="separator"></view> -->

    <!-- 底部 -->
    <view class="footer">
      <!-- 左侧按钮 -->
      <button class="footer-btn" @click="switchBtns(true)">调试一</button>

      <!-- 右侧按钮 -->
      <button class="footer-btn" @click="switchBtns(false)">调试二</button>
    </view>

    <!-- 最底部 -->
    <view class="bottom">
      <!-- 左侧按钮 -->
      <button class="bottom-btn" @click="backMain()">返回主界面</button>

      <!-- 程序信息显示区域: 一个方框中有两项基本程序参数：程序号和产品名称 -->
      <view class="program-info">
        <view class="program-info-item">
          <span class="program-info-label">程序号：</span>
          <span class="program-info-value">{{ programNum }}</span>
        </view>
        <view class="program-info-item">
          <span class="program-info-label">产品名称：</span>
          <span class="program-info-value">{{ productName }}</span>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  writeCmd,
  readParam,
  readParams,
  getCmdResult,
  refreshCache,
} from "@/api/device/business.js";
import { ctrlno } from "@/utils/devConstant.js";
import DouImage from "@/components/douImage/douImage.vue";

// 变量
var fun, cmd;

// 常量
const Fun_Once = 0;
const Fun_CONTINUE = 1;
const Fun_ZZJ = 2;
const Fun_XZJ = 3;
const Fun_HCD = 4;
const Fun_CZD = 5;
const Fun_JYD = 6;
const Fun_JLD = 7;
const Fun_DouDis = 8;
const Fun_DouWeight = 9;
const Fun_TestSamp = 10;
const Fun_TestKG = 11;
const Fun_TestZD = 12;
const Fun_Camera = 13;

const WAIT_CMD =
  cmd === ctrlno.CTL_MANUAL_ONCE ||
  cmd === ctrlno.CTL_MANUAL_CONTINUE ||
  cmd === ctrlno.CTL_MANUAL_ZZJ;
const WAIT_FUN = fun === Fun_Once || fun === Fun_CONTINUE || fun === Fun_ZZJ;

export default {
  components: {
    DouImage,
  },
  computed: {
    btns_1() {
      return this.btns.slice(0, 10); // 第一组前10个按钮
    },
    btns_2() {
      return this.btns.slice(10); // 第二组剩余按钮
    },
  },

  data() {
    return {
      programNum: "01",
      productName: "产品名称",
      showDebugBtn: true,
      currentBtn: 0,
      showWeightLabel: false, // 显示斗重量
      doustatus: [], // 给定一组斗状态
      zzjState: 0, // 主振机状态
      curseldn: -1, // 选中的斗
      btns: [
        { name: "单次运行", checked: false, disabled: false },
        { name: "连续运行", checked: false, disabled: false },
        { name: "主振机", checked: false, disabled: false },
        { name: "线振机", checked: false, disabled: false },
        { name: "进料斗", checked: false, disabled: false },
        { name: "称重斗", checked: false, disabled: false },
        { name: "集料斗", checked: false, disabled: false },
        { name: "强排导管", checked: false, disabled: false },
        { name: "禁止斗", checked: false, disabled: false },
        { name: "斗重量", checked: false, disabled: false },
        { name: "采样测试", checked: false, disabled: false },
        { name: "开关斗测试", checked: false, disabled: false },
        { name: "振动测试", checked: false, disabled: false },
        { name: "摄像头", checked: false, disabled: true },
      ],
      fun: -1,
      lastCheckedFun: -1, // 上次选中的功能
      intervalId: null,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.setBoxColor(0);
      this.initBtns();
      this.getDouStatus();
    });
  },
  onShow() {
    if (this.intervalId == null) {
      // 启动刷新器
      this.startReader(1000);
    }
  },
  onHide() {
    this.stopReader();
    console.log("页面隐藏");
  },
  beforeDestroy() {
    this.stopReader();
  },
  methods: {
    // 获取斗状态
    getDouStatus() {
      readParam({
        devId: uni.getStorageSync("devId"),
        paramKey: "cmb_DouStatus",
      }).then((res) => {
        this.doustatus = res.data.cmb_DouStatus;
        let idxs = this.$refs.douImage.decodeDouStatus(this.doustatus);
        console.log("状态", idxs, idxs.length);
        // 然后把其他值不等于15的idx设置为颜色为0
        const irr2 = idxs
          .map((element, index) => ({ value: element, index }))
          .filter((obj) => obj.value !== 15)
          .map((obj) => obj.index);
        this.$refs.douImage.setBoxColor(irr2, 0);
        // 提取idxs中值为15的index并设置颜色
        const irr = idxs
          .map((element, index) => ({ value: element, index }))
          .filter((obj) => obj.value === 15)
          .map((obj) => obj.index);
        this.$refs.douImage.setBoxColor(irr, 15);
      });
    },
    // 向设备发送指令
    sendCmd(cmd, cmdParam) {
      // this.setBtnCtrl();
      uni.showLoading({
        title: "调试中...",
        mask: true,
      });
      writeCmd({
        devId: uni.getStorageSync("devId"),
        cmd: cmd,
        cmdParam: cmdParam,
      }).then((res) => {
        console.log(res);
        if (res.code !== 200) {
          uni.showToast({
            title: "指令下发失败",
          });
          uni.hideLoading();
        }
        // 获取命令执行的结果
        getCmdResult({
          devId: uni.getStorageSync("devId"),
        }).then((resp) => {
          console.log(resp);
          this.getDouStatus();
          uni.hideLoading();
        });
      });
    },
    funClick(key) {
      this.lastCheckedFun = fun != undefined ? fun : key;
      fun = key;
      this.zzjState = 0;
      this.showWeightLabel = false;
      // 取消之前的checked
      this.$set(this.btns[this.lastCheckedFun], "checked", false);
      this.$set(this.btns[fun], "checked", true);
      switch (fun) {
        case Fun_Once:
        case Fun_CONTINUE:
        case Fun_XZJ:
        case Fun_HCD:
        case Fun_CZD:
        case Fun_JYD:
          this.setBoxColor(0);
          break;
        case Fun_JLD:
          break;
        case Fun_ZZJ:
          this.setBoxColor(15);
          break;
        case Fun_DouWeight:
          this.zzjState = 1;
          this.setBoxColor(0);
          this.showWeightLabel = true;
          break;
        case Fun_DouDis:
          this.zzjState = 1;
          break;
        case Fun_TestSamp:
        case Fun_TestKG:
        case Fun_TestZD:
          this.InDeveloping();
          this.zzjState = 1;
          break;
        case Fun_Camera:
          this.InDeveloping();
          break;
        default:
          break;
      }
    },
    boxClicked(index) {
      const douNumber = index + 1;
      this.sendCmdToDou(douNumber);
      this.getDouStatus();
    },
    zzClicked() {
      console.log("zz");
      this.sendCmdToDou(0);
      this.getDouStatus();
    },
    sendCmdToDou(douNumber) {
      switch (fun) {
        // case 1-9 对应 sendCmd
        case Fun_Once:
          this.sendCmd(ctrlno.CTL_MANUAL_ONCE, douNumber);
          break;
        case Fun_CONTINUE:
          this.sendCmd(ctrlno.CTL_MANUAL_CONTINUE, douNumber);
          break;
        case Fun_ZZJ:
          this.sendCmd(ctrlno.CTL_MANUAL_ZZJ, douNumber);
          break;
        case Fun_XZJ:
          this.sendCmd(ctrlno.CTL_MANUAL_XZJ, douNumber);
          break;
        case Fun_HCD:
          this.sendCmd(ctrlno.CTL_MANUAL_HCD, douNumber);
          break;
        case Fun_CZD:
          this.sendCmd(ctrlno.CTL_MANUAL_CZD, douNumber);
          break;
        case Fun_JYD:
          this.sendCmd(ctrlno.CTL_MANUAL_JYD, douNumber);
          break;
        case Fun_JLD:
          this.sendCmd(ctrlno.CTL_MANUAL_JLD, douNumber);
          break;
        case Fun_DouDis:
          this.sendCmd(ctrlno.CTL_DOU_PROHIBIT, douNumber);
          break;
        case Fun_DouWeight:
          this.sendCmd(ctrlno.CTL_SEZ, douNumber);
          break;
        case Fun_TestSamp:
          this.showSamp(douNumber);
          break;
        case Fun_TestKG:
          this.showKaiMen(douNumber);
          break;
        case Fun_TestZD:
          this.showZhenDong(douNumber);
          break;
        case Fun_Camera:
          this.showCamera();
          break;
        default:
          break;
      }
    },
    switchBtns(flag) {
      // 切换调试按钮
      this.showDebugBtn = flag;
    },
    // 返回主界面按钮的操作方法
    backMain() {
      uni.navigateBack({
        delta: 1,
      });
    },
    // 提示正在开发中
    InDeveloping() {
      uni.showToast({
        title: "正在开发中",
        icon: "none",
      });
    },
    // 采样测试
    showSamp(douNumber) {
      this.InDeveloping();
    },
    // 开关斗测试
    showKaiMen(douNumber) {
      this.InDeveloping();
    },
    // 振动测试
    showZhenDong(douNumber) {
      this.InDeveloping();
    },
    // 摄像头测试
    showCamera() {
      this.InDeveloping();
    },
    // 设置按钮使用
    setBtnCtrl() {
      // 禁用除指定按钮以外的所有按钮
      this.showDebugBtn = false;
    },
    // 设置小方格颜色
    setBoxColor(ckey) {
      this.$refs.douImage.setBoxColor(
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
        ckey
      );
    },
    initBtns() {
      console.log(!uni.getStorageSync("sys_VibrationSen"));
      console.log(!uni.getStorageSync("sys_QPDGSel"));
      console.log(!uni.getStorageSync("sys_JLD_state"));
      this.btns[Fun_TestZD].disabled = !uni.getStorageSync("sys_VibrationSen");
      this.btns[Fun_JYD].disabled = !uni.getStorageSync("sys_QPDGSel");
      this.btns[Fun_JLD].disabled = !uni.getStorageSync("sys_JLD_state");
    },
    startReader(interval) {
      this.intervalId = setInterval(() => {
        refreshCache({
          devId: uni.getStorageSync("devId"),
        }).then((res) => {
          console.log("刷新", res);
          this.$refs.douImage.getDouWeight();
        });
      }, interval);
    },
    stopReader() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },
  },
};
</script>

<style>
.app {
  /* 整体样式 */
}

.middle-section {
  /* 中部样式 */
  /* border-bottom: 1px solid #ccc; */
  padding-bottom: 10px;
}

.button-area {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 10px;
}

.button-area + .button-area {
  margin-top: 10px;
}

.action-btn {
  flex: 0 0 30%; /* 根据实际容器宽度和间距调整此值 */
  min-width: 0;
  margin-top: 10px;
  background-color: #fff;
  color: #333;
}

.action-btn:hover {
  background-color: #569bc6;
}

.action-btn:active {
  background-color: #569bc6;
}

.footer-btn {
  flex: 1;
  min-width: 0;
  background-color: #fff;
  color: #333;
}

.footer-btn:hover {
  background-color: #549af5;
}

.bottom-btn {
  flex: 1;
  min-width: 0;
  margin-right: 10px;
  background-color: #fff;
  color: #333;
}

.separator {
  /* 分隔区域样式 */
  height: 1px;
  background-color: #ccc;
  margin: 10px 0;
}

.footer {
  /* 底部样式 */
  position: fixed;
  bottom: 60px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  /* padding: 10px; */
  background-color: #f5f5f5;
  /* Adjust the background color as per your design */
  border-top: 1px solid #ccc;
}

.bottom {
  /* 最底部样式 */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f5f5f5;
  /* Adjust the background color as per your design */
  border-top: 1px solid #ccc;
}

.program-info {
  /* 程序信息显示区域样式 */
  display: flex;
  flex: 1;
  /* align-items: center; */
  margin-left: auto;
  flex-direction: column;
}

.program-info-item {
  /* 每个信息项样式 */
  display: flex;
}

.btn-checked {
  background-color: #569bc6;
  color: white;
}
</style>
