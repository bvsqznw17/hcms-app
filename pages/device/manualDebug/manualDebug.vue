<template>
  <view class="app">
    <!-- 空白区域用于放置组合秤图片 -->
    <view class="image-section">
      <!-- 使用 v-for 渲染小方格 -->
      <view class="small-box-container">
        <view v-for="(weight, index) in weightValues" :key="index" @click="clickBox(index)" class="small-box">
          <span class="box-number">{{ index + 1 }}</span>
          <span class="box-weight">{{ weight }}</span>
        </view>
      </view>
    </view>

    <!-- 调试按钮区域 -->
    <view class="middle-section">
      <view class="debug-button-area" v-show="showDebugBtn">
        <view class="button-area">
          <!-- 包含 单次运行、连续运行、主振机、线振机、进料斗、称重斗、集料斗、强排导管、禁止斗、斗重量按钮-->
          <button class="action-btn" @click="btnClick(0)">单次运行</button>
          <button class="action-btn" @click="btnClick(1)">连续运行</button>
          <button class="action-btn" @click="btnClick(2)">主振机</button>
        </view>
        <view class="button-area">
          <button class="action-btn" @click="btnClick(3)">线振机</button>
          <button class="action-btn" @click="btnClick(4)">进料斗</button>
          <button class="action-btn" @click="btnClick(5)">称重斗</button>
        </view>
        <view class="button-area">
          <button class="action-btn" @click="btnClick(6)">集料斗</button>
          <button class="action-btn" @click="btnClick(7)">强排导管</button>
          <button class="action-btn" @click="btnClick(8)">禁止斗</button>
        </view>
        <view class="button-area">
          <button class="action-btn" @click="btnClick(9)">斗重量</button>
        </view>
      </view>

      <view class="debug-button-area" v-show="!showDebugBtn">
        <view class="button-area">
          <!-- 包含 采样测试、开关斗测试、振动测试、摄像头 按钮 -->
          <button class="action-btn" @click="btnClick(10)">采样测试</button>
          <button class="action-btn" @click="btnClick(11)">开关斗测试</button>
        </view>
        <view class="button-area">
          <button class="action-btn" @click="btnClick(12)">振动测试</button>
          <button class="action-btn" style="flex: 1" @click="btnClick(13)">摄像头</button>
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
  getRunStatus,
  getCmdResult,
} from "@/api/device/business.js";
import { ctrlno } from "@/utils/devConstant.js";
export default {
  data() {
    return {
      deviceName: "设备名称",
      deviceModel: "设备型号",
      programNum: "01",
      productName: "产品名称",
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
      showDebugBtn: true,
      boxIndex: 0,
      currentBtn: 0,
    };
  },
  methods: {
    // 向设备发送指令
    sendCmd(cmd, cmdParam) {
      // this.setBtnCtrl();
      uni.showLoading({
        title: "调试中...",
      });
      writeCmd({
        devName: uni.getStorageSync("devName"),
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
          devName: uni.getStorageSync("devName"),
        }).then((resp) => {
          console.log(resp);
          uni.hideLoading();
        });
      });
    },
    btnClick(key) {
      // TODO 按钮点击
      this.InDeveloping();
      const douNumber = this.boxIndex + 1;
      switch (key) {
        // case 1-9 对应 sendCmd
        case 0:
          this.sendCmd(ctrlno.CTL_MANUAL_ONCE, douNumber);
          break;
        case 1:
          this.sendCmd(ctrlno.CTL_MANUAL_CONTINUE, douNumber);
          break;
        case 2:
          this.sendCmd(ctrlno.CTL_MANUAL_ZZJ, douNumber);
          break;
        case 3:
          this.sendCmd(ctrlno.CTL_MANUAL_XZJ, douNumber);
          break;
        case 4:
          this.sendCmd(ctrlno.CTL_MANUAL_HCD, douNumber);
          break;
        case 5:
          this.sendCmd(ctrlno.CTL_MANUAL_CZD, douNumber);
          break;
        case 6:
          this.sendCmd(ctrlno.CTL_MANUAL_JYD, douNumber);
          break;
        case 7:
          this.sendCmd(ctrlno.CTL_MANUAL_JLD, douNumber);
          break;
        case 8:
          this.sendCmd(ctrlno.CTL_DOU_PROHIBIT, douNumber);
          break;
        case 9:
          this.sendCmd(ctrlno.CTL_SEZ, douNumber);
          break;
        case 10:
          this.showSamp(douNumber);
          return false;
        case 11:
          this.showKaiMen(douNumber);
          return false;
        case 12:
          this.showZhenDong(douNumber);
          return false;
        case 13:
          this.showCamera();
          return false;
        default:
          return false;
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
    clickBox(index) {
      this.boxIndex = index;
    },
    // 提示正在开发中
    InDeveloping() {
      uni.showToast({
        title: "正在开发中，该页面功能暂不可用",
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
  },
};
</script>

<style>
.app {
  /* 整体样式 */
}

.image-section {
  /* 图片区域样式 */
  height: auto;
  min-height: 200px;
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
  max-width: 480px;
  margin: 0 auto;
}

.small-box {
  /* 小方格样式 */
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
  flex-basis: calc(100% / 5 - 20px);
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
  /* border-bottom: 1px solid #ccc; */
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

.action-btn {
  flex: 1;
  min-width: 0;
  margin: 0 5px;
  background-color: #fff;
  color: #333;
}

.footer-btn {
  flex: 1;
  min-width: 0;
  background-color: #fff;
  color: #333;
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
  background-color: #f5f5f5; /* Adjust the background color as per your design */
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
  background-color: #f5f5f5; /* Adjust the background color as per your design */
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
</style>