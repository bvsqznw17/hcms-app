<template>
  <view class="app">
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

    <!-- 调试按钮区域 -->
    <view class="middle-section">

      <!-- 置零操作时的三个按钮 -->
      <view class="button-area">
        <button class="action-btn" @click="zeroOper('reset')" :disabled="btnCtrl['reset']">置零</button>
        <button class="action-btn" @click="zeroOper('empty')" :disabled="btnCtrl['empty']">清空</button>
        <button class="action-btn" @click="zeroOper('clean')" :disabled="btnCtrl['clean']">清洗</button>
      </view>

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
import { writeCmd, readParam, getRunStatus } from "@/api/device/business.js";
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
      btnCtrl: {
        // 控制按钮是否禁用
        reset: false,
        empty: false,
        clean: false,
      },
      runStatus: {}, // 设备运行状态
    };
  },
  onload() {
    // 加载斗状态
    this.getDouRunStatus();
  },
  methods: {
    // 向设备发送指令
    sendCmd(cmd, cmdParam) {
      this.setBtnCtrl();
      writeCmd({
        devName: uni.getStorageSync("devName"),
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
    // 置零操作按钮
    zeroOper(type) {
      this.InDeveloping();
      return;
      if (type === "reset") {
        this.sendCmd(ctrlno.CTL_MANUAL_ZERO, 0x01);
      } else if (type === "empty") {
        this.sendCmd(ctrlno.CTL_MANUAL_EMPTY, 0x01);
      } else if (type === "clean") {
        this.sendCmd(ctrlno.CTL_MANUAL_CLEAN, 0x01);
      }
    },
    // 获取设备运行状态
    getDouRunStatus() {
      getRunStatus({
        devId: uni.getStorageSync("devId"),
      }).then((res) => {
        console.log(res);
      });
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
        title: "正在开发中，该页面功能暂不可用",
        icon: "none",
      });
    },
    // 设置按钮的可用状态(在每次操作之后调用)
    setBtnCtrl() {
      const status = this.runStatus;
      let b =
        status.isManualClean || status.isManualZero || status.isManualEmpty;
      let run = status.isRun;
      let lack = status.isLackMaterial;
      let alarm = status.isHaveAlarm;

      let enabled = !b;

      this.btnCtrl["reset"] = enabled;
      this.btnCtrl["empty"] = enabled;
      this.btnCtrl["clean"] = enabled;
      this.btnCtrl["menu"] = enabled && !lack && !run;
      this.btnCtrl["zero"] = enabled;
      this.btnCtrl["combine"] = enabled;
      this.btnCtrl["tj"] = enabled;
      this.btnCtrl["zjSetting"] = enabled;
      this.btnCtrl["timeSetting"] = enabled;
      this.btnCtrl["camera"] = enabled;

      this.btnCtrl["run"] = enabled && !run;
      this.btnCtrl["stop"] = enabled && run;
      this.btnCtrl["lack_stop"] = enabled && status.IsLackMaterialDisable;
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