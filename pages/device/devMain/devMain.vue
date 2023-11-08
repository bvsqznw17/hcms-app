<template>
  <view class="app">
    <view class="top-section">
      <view class="device-info">
        <!-- 设备名称、IP、型号 -->
        <text class="device-info-item">设备型号: {{ deviceModel }}</text>
        <text class="device-info-item">设备名称：{{ devName }}</text>
        <text class="device-info-item">IP: {{ deviceIP }}</text>
      </view>
    </view>

    <!-- 顶部 -->
    <view class="top-panel">
      <!-- 组合秤参数展示 -->
      <view class="grid-container">
        <!-- 使用 v-for 渲染参数项 -->
        <view v-for="(param, index) in parameters" :key="index" class="param-item">
          <span class="param-label">{{ param.label }}:</span>
          <span class="param-value">{{ param.value }}</span>
        </view>
      </view>

      <!-- 实时重量 -->
      <view class="weight">
        <view class="weight-value-container">
          <span class="weight-value">{{ realtimeWeight }}</span>
          <span class="weight-unit">{{ weight_unit }}</span>
        </view>
      </view>
    </view>

    <!-- 空白区域用于放置组合秤图片 -->
    <view class="image-section">
      <!-- 使用 v-for 渲染小方格 -->
      <view class="small-box-container">
        <view v-for="(weight, index) in weightValues" :key="index" class="small-box">
          <span class="box-number">{{ index + 1 }}</span>
          <span class="box-weight">{{ weight }}</span>
        </view>
      </view>
    </view>

    <!-- 底部 -->
    <view class="bottom-section" v-show="showBuiltInBtn">
      <!-- 第一行按钮 -->
      <view class="button-area">
        <!-- 置零按钮 -->
        <button class="action-btn" @click="skipTo('zeroOper')" :disabled="btnCtrl['zero']">
          置零
        </button>

        <!-- 组合按钮 -->
        <button class="action-btn" @click="combine()" :disabled="btnCtrl['combine']">
          组合
        </button>

        <!-- 统计按钮 -->
        <button class="action-btn" @click="skipTo('statistic')" :disabled="btnCtrl['statistic']">
          统计
        </button>
      </view>

      <!-- 第二行按钮 -->
      <view class="button-area">
        <!-- 参数调整按钮 -->
        <button class="action-btn" @click="skipTo('zjSetting')" :disabled="btnCtrl['zjSetting']">
          参数调整
        </button>

        <!-- 时间调整按钮 -->
        <button class="action-btn" @click="skipTo('timeSetting')" :disabled="btnCtrl['timeSetting']">
          时间调整
        </button>

        <!-- 摄像头按钮 -->
        <button class="action-btn" @click="skipTo('camera')" :disabled="btnCtrl['camera']">
          摄像头
        </button>
      </view>
    </view>

    <!-- 添加分隔区域 -->
    <!-- <view class="separator"></view> -->

    <!-- 菜单按钮 -->
    <view class="bottom-section" v-show="showMenuBtn">
      <!-- 第一行按钮 -->
      <view class="button-area">
        <!-- 程序设置 -->
        <button class="action-btn" @click="skipTo('programSetting')">程序设置</button>

        <!-- 高级设置 -->
        <button class="action-btn" @click="skipTo('advancedSetting')">高级设置</button>

        <!-- 输入输出 -->
        <button class="action-btn" @click="skipTo('InOut')">输入输出</button>
      </view>

      <!-- 第二行按钮 -->
      <view class="button-area">
        <!-- 手动调试 -->
        <button class="action-btn" @click="skipTo('manualDebug')">手动调试</button>

        <!-- 校准 -->
        <button class="action-btn" @click="skipTo('calibration')">校准</button>

        <!-- 软件升级 -->
        <button class="action-btn" @click="skipTo('upgrade')">软件升级</button>
      </view>
    </view>

    <!-- 添加分隔区域 -->
    <view class="separator"></view>

    <!-- 中部 -->
    <view class="middle-section" v-show="showOperateBtn">
      <!-- 内置按钮区域 -->
      <!-- 多个按钮放在容器中，使用 v-show 控制显示与隐藏 -->
      <view class="button-area">
        <button class="action-btn" @click="mainOper('run')" :disabled="btnCtrl['run']">
          运行
        </button>
        <button class="action-btn" @click="mainOper('stop')" :disabled="btnCtrl['stop']">
          停止
        </button>
        <button class="action-btn" @click="mainOper('lack_stop')" :disabled="btnCtrl['lack_stop']">
          缺料停机
        </button>
      </view>
    </view>

    <!-- 最底部 -->
    <view class="footer">

      <!-- 菜单按钮 -->
      <button class="action-btn right-btn" @click="showMenuBtns()" :disabled="btnCtrl['menu']">
        菜单
      </button>
    </view>
  </view>
</template>

<script>
import {
  writeCmd,
  getPanelData,
  readParam,
  getRunStatus,
  getSysConfig,
} from "@/api/device/business.js";
import { ctrlno } from "@/utils/devConstant.js";
export default {
  data() {
    return {
      devName: "设备名称",
      deviceIP: "121.199.30.10",
      deviceModel: "CBM5",
      parameters: [
        { label: "程序号", value: "01" },
        { label: "目标值", value: "100" },
        { label: "平均斗数", value: "5" },
        { label: "产品名称", value: "产品A" },
        { label: "上限值", value: "200" },
        { label: "设置速度", value: "5" },
        { label: "单位重量", value: "10" },
        { label: "下限值", value: "50" },
        { label: "实际速度", value: "4" },
      ],
      // 其他组件数据和方法
      realtimeWeight: "0.5", // 实时重量
      weight_unit: "g", // 重量单位
      afc: "afc", // afc模式
      weightValues: [
        "1.1",
        "2.2",
        "3.3",
        "4.4",
        "5.5",
        "6.6",
        "7.7",
        "8.8",
        "9.9",
        "10.0",
        "11.1",
        "12.2",
        "13.3",
        "14.4",
      ],
      showBuiltInBtn: true, // 控制是否显示内置按钮
      showOperateBtn: true, // 控制是否显示操作按钮
      showMenuBtn: false, // 控制是否显示菜单按钮
      inDevelopPageList: ["camera", "statistic"],
      panelParamKeys: [
        "sys_prm_ids",
        "prm_SetWeight",
        "prm_SetWeight1",
        "prm_SetWeight2",
        "prm_name",
        "cmb_speed",
        "cmb_Dww",
        "prm_speed",
        "sys_Unit",
        "prm_AFCMode",
        "cmb_cbtype",
        "cmb_Weight",
      ],
      btnCtrl: {
        // 控制按钮是否禁用
        run: false,
        stop: false,
        lack_stop: false,
        menu: false,
        zero: false,
        combine: false,
        statistic: false,
        zjSetting: false,
        timeSetting: false,
        camera: false,
      },
      sysConfig: {}, // 系统配置
      runStatus: {}, // 设备运行状态
    };
  },
  onLoad() {
    // 获取devName等信息
    this.devName = uni.getStorageSync("devName");

    // 获取系统信息并存储到缓存中
    this.getDeviceInfoAndStore();

    setTimeout(() => {
      // 获取并构建组合秤重量显示数据
      this.getDouWeight();

      // // 设置按钮的可用状态
      // this.setBtnCtrl();
      this.getDevRunstatus();

      // 获取面板的数据
      this.getPanel();
    }, 2000);
  },
  onShow() {},
  // 其他组件生命周期钩子和方法
  methods: {
    // 向设备发送指令
    sendCmd(cmd, cmdParam) {
      // 设置按钮禁用状态
      this.setBtnCtrl();
      // 向设备发送指令
      writeCmd({
        devName: this.devName,
        cmd: cmd,
        cmdParam: cmdParam,
      }).then((res) => {
        console.log(res);
        if (res.code == 200) {
          uni.showToast({
            title: "指令下发成功",
          });
        } else {
          uni.showToast({
            title: "指令下发失败",
          });
        }
      });
    },
    // 获取设备运行状态
    getDevRunstatus() {
      getRunStatus({
        devId: uni.getStorageSync("devId"),
      }).then((res) => {
        console.log(res);
        this.runStatus = res.data;
      });
    },
    // 获取并构建组合秤重量显示数据
    getDouWeight() {
      readParam({
        devName: this.devName,
        paramKey: "doustatus",
      }).then((res) => {
        console.log(res);
        this.weightValues = JSON.parse(res.data.doustatus);
        console.log(this.weightValues);
        // 显示14个即可
        let douNum = 14;
        let startPosition = Math.floor((douNum + 1) / 2);
        this.weightValues = this.weightValues.slice(
          startPosition,
          startPosition + douNum
        );
        // 补足精度的0
        for (let i = 0; i < this.weightValues.length; i++) {
          // if (this.weightValues[i] == null) {
          //   this.weightValues[i] = "0.0";
          // }
          this.weightValues[i] = this.weightValues[i].toFixed(
            this.sysConfig["sys_dot_num"]
          );
        }
      });
    },
    // 获取面板的数据
    getPanel() {
      getPanelData({
        devId: uni.getStorageSync("devId"),
      }).then((res) => {
        console.log(res);
        this.realtimeWeight = res.data.weight == null ? 0 : res.data.weight;
        console.log("小数位数：", this.sysConfig["sys_dot_num"]);
        this.realtimeWeight = this.realtimeWeight.toFixed(
          this.sysConfig["sys_dot_num"]
        );
        this.weight_unit = res.data.sys_unit;
        this.afc = res.data.afc;
        // 处理数据：获取得到的数据res.data是一个字典类型，需要转为parameters的格式，把它的key转为label,value转为value
        const tempParameters = Object.keys(res.data).map((key) => {
          return { label: key, value: res.data[key] };
        });
        console.log(tempParameters);
        // 我们只需要前9个参数
        const parameters_ = JSON.parse(
          JSON.stringify(tempParameters.slice(0, 9))
        );
        this.parameters = parameters_;
        console.log(this.parameters);
      });
    },
    // 按钮显示重置
    btnReset() {
      this.showOperateBtns = true;
      this.showResetBtn = false;
    },
    // 置零
    reset() {
      this.showResetBtns();
    },
    // 组合
    combine() {
      this.btnReset();
    },
    // 显示或隐藏内置按钮
    showBuiltInBtns() {
      this.showBuiltInBtn = !this.showBuiltInBtn;
    },
    // 显示或隐藏操作按钮
    showOperateBtns() {
      this.showOperateBtn = !this.showOperateBtn;
    },
    // 显示或隐藏菜单按钮
    showMenuBtns() {
      this.showBuiltInBtns();
      this.showMenuBtn = !this.showMenuBtn;
    },
    // 显示隐藏置零按钮
    showResetBtns() {
      this.showResetBtn = !this.showResetBtn;
    },
    // 基本操作按钮
    mainOper(type) {
      // this.InDeveloping();
      // return;
      if (type === "run") {
        this.sendCmd((0x02 << 8) | ctrlno.CTRL_RUN, (0x00 << 8) | 0x00);
      } else if (type === "stop") {
        this.sendCmd((0x00 << 8) | ctrlno.CTRL_RUN, (0x00 << 8) | 0x00);
      } else if (type === "lack_stop") {
        this.sendCmd((0x00 << 8) | ctrlno.CTL_QLTJ, (0x00 << 8) | 0x00);
      }
    },
    // 跳转到页面
    skipTo(pageName) {
      console.log(pageName);
      // 如果属于inDevelopPageList列表中的页面，提示正在开发中
      if (this.inDevelopPageList.includes(pageName)) {
        this.InDeveloping();
        return;
      }
      // 如果是参数调整和时间调整，需要加深一级页面，它们都在programSetting目录下
      if (pageName === "zjSetting" || pageName === "timeSetting") {
        this.$tab.navigateTo(
          "/pages/device/programSetting/" + pageName + "/" + pageName
        );
      } else {
        this.$tab.navigateTo("/pages/device/" + pageName + "/" + pageName);
      }
    },
    // 提示正在开发中
    InDeveloping() {
      uni.showToast({
        title: "正在开发中",
        icon: "none",
      });
    },
    // 设置按钮的可用状态(在每次操作之后调用)
    setBtnCtrl() {
      const status = this.runStatus;
      let run = status.isRun;

      this.btnCtrl["menu"] = !run;
      this.btnCtrl["zero"] = !run;
    },
    // 交换函数
    swap(a, b) {
      [a, b] = [b, a];
    },
    // 获取设备信息并存储到缓存
    getDeviceInfoAndStore() {
      getSysConfig({
        devId: uni.getStorageSync("devId"),
      })
        .then((res) => {
          console.log(res);
          this.sysConfig = res.data;
          // 遍历res.data，res.data是一个map，key是属性名，value是属性值，将key和value存储到缓存中
          Object.keys(res.data).forEach((key) => {
            uni.setStorageSync(key, res.data[key]);
          });
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
</script>

<style>
/* 样式规则 */
.app {
  /* 整体样式 */
}

.top-section {
  /* 顶部样式 */
  border-bottom: 1px solid #ccc;
  padding: 10px 0;
}

.device-info {
  /* 设备信息样式 */
  display: flex;
  justify-content: space-between;
}

.device-info-item {
  /* 设备信息项样式 */
  margin-right: 1px;
}

.top-panel {
  /* 顶部面板样式 */
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
}

.grid-container {
  /* 网格容器样式 */
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(30%, 1fr));
  grid-gap: 0px;
  margin-top: 15px;
  margin-left: 10px;
}

.param-item {
  /* 参数项样式 */
  display: flex;
  align-items: center;
  margin-right: 20px;
  margin-bottom: 10px;
}

.param-label {
  /* 参数标签样式 */
  width: 70px;
  font-weight: bold;
}

.weight {
  /* 实时重量样式 */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  background-color: #333;
}

.weight-value-container {
  /* 容器样式 */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 32px;
  font-weight: bold;
  color: #39ff14; /* 荧光绿色 */
  position: relative;
}

.weight-value {
  /* 实时重量数值样式 */
  padding: 5px 10px;
}

.weight-unit {
  /* 单位样式 */
  position: absolute;
  right: 8px;
  bottom: 8px;
  font-size: 18px;
}

.image-section {
  /* 图片区域样式 */
  height: auto; /* 将高度改为自适应高度 */
  min-height: 200px; /* 设置一个最小高度，以确保有足够的空间容纳元素 */
  background-color: #ccc;
  border-bottom: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.small-box-container {
  /* 小方格容器样式 */
  display: flex;
  flex-wrap: wrap;
  max-width: 480px; /* 调整容器宽度以控制每行显示的方格数量 */
  margin: 0 auto; /* 水平居中 */
}

.small-box {
  /* 小方格样式 */
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
  flex-basis: calc(100% / 5 - 20px); /* 控制每行显示5个方格 */
  background: #236490;
}

.box-number {
  /* 编号样式 */
  font-size: 14px;
  margin-bottom: 4px;
}

.box-weight {
  /* 数字样式 */
  font-size: 16px;
  font-weight: bold;
}

.middle-section {
  /* 中部样式 */
  border-bottom: 1px solid #ccc;
  /* padding: 10px 0; */
  padding-bottom: 10px;
}

.button-area {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.button-area + .button-area {
  margin-top: 10px;
}

.this-btn {
  display: flex;
  justify-content: space-between;
}

.action-btn {
  flex: 1;
  min-width: 0;
  margin: 0 5px;
  background-color: #fff;
  color: #333;
}

.action-btn:hover {
  /* 鼠标悬停时的按钮样式 */
  background-color: #ccc;
}

.action-btn {
  flex: 1;
  min-width: 0;
  margin: 0 5px;
  background-color: #fff;
  color: #333;
}

.left-btn {
  /* 左侧按钮样式 */
  margin-right: 5px;
}

.right-btn {
  /* 右侧按钮样式 */
  margin-left: 5px;
}

.separator {
  /* 分隔区域样式 */
  height: 1px;
  background-color: #ccc;
  margin: 10px 0;
}

.spacer {
  /* 垂直间距样式 */
  height: 10px;
}

.footer {
  /* 底部样式 */
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding-bottom: 10px;
}

.action-container {
  margin-top: 10px;
}
</style>
