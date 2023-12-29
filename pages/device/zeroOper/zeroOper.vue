<template>
  <view class="app">
    <!-- 空白区域用于放置组合秤图片 -->
    <dou-image
      class="blank-area"
      ref="douImage"
      @dstate="changeDstate"
      :wideDoustatusMode="true"
      :clickable="false"
    ></dou-image>

    <!-- 调试按钮区域 -->
    <view class="middle-section">
      <!-- 置零操作时的三个按钮 -->
      <view class="button-area">
        <button
          class="action-btn"
          :class="{ 'btn-checked': btnChecked['reset'] }"
          @click="zeroOper('reset')"
          :disabled="!btnCtrl['reset']"
        >
          置零
        </button>
        <button
          class="action-btn"
          :class="{ 'btn-checked': btnChecked['empty'] }"
          @click="zeroOper('empty')"
          :disabled="!btnCtrl['empty']"
        >
          清空
        </button>
        <button
          class="action-btn"
          :class="{ 'btn-checked': btnChecked['clean'] }"
          @click="zeroOper('clean')"
          :disabled="!btnCtrl['clean']"
        >
          清洗
        </button>
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
import {
  writeCmd,
  readParam,
  getRunStatus,
  getCmdResult,
  refreshCache,
} from "@/api/device/business.js";
import { ctrlno } from "@/utils/devConstant.js";
import DouImage from "@/components/douImage/douImage.vue";

export default {
  components: {
    DouImage,
  },
  data() {
    return {
      programNum: "01",
      productName: "产品名称",
      btnCtrl: {
        // 控制按钮是否可用
        reset: true,
        empty: true,
        clean: true,
      },
      btnChecked: {
        reset: false,
        empty: false,
        clean: false,
      },
      runStatus: {}, // 设备运行状态
      shouldContinue: true,
      intervalId: null,
    };
  },
  onLoad() {
    this.getDouRunStatus();
  },
  onShow() {
    // 启动刷新器
    this.startReader(2000);
  },
  onHide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    console.log("页面隐藏");
  },
  beforeDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  },
  methods: {
    // 向设备发送指令
    sendCmd(cmd, cmdParam) {
      let that = this;
      let devId = uni.getStorageSync("devId");

      uni.showLoading({
        title: "指令下发中...",
        mask: true,
      });

      writeCmd({
        devId: devId,
        cmd: cmd,
        cmdParam: cmdParam,
      }).then((res) => {
        console.log(res);
        if (res.code == 200) {
          // uni.showToast({
          //   title: "指令下发成功",
          // });
          that.reGetDouRunStatus();
          // getCmdResult({
          //   devId: devId,
          // }).then((resp) => {
          //   if (resp.code == 200) {
          //     that.getDouRunStatus();
          //   }
          // });
          uni.hideLoading();
        } else {
          uni.showToast({
            title: "指令下发失败",
          });
        }
      });
    },
    // 置零操作按钮
    zeroOper(type) {
      if (type === "reset") {
        this.sendCmd(ctrlno.CTL_MANUAL_ZERO, 0x01);
      } else if (type === "empty") {
        this.sendCmd(ctrlno.CTL_MANUAL_EMPTY, 0x01);
        this.btnChecked.empty = !this.btnChecked.empty;
      } else if (type === "clean") {
        this.sendCmd(ctrlno.CTL_MANUAL_CLEAN, 0x01);
        this.btnChecked.clean = !this.btnChecked.clean;
      }
      this.shouldContinue = true;
    },
    // 获取设备运行状态
    getDouRunStatus() {
      getRunStatus({
        devId: uni.getStorageSync("devId"),
      }).then((res) => {
        console.log(res);
        this.runStatus = res.data;
        this.setBtnCtrl();
      });
    },
    // 递归多次读取设备运行状态-实际上是为了高刷
    reGetDouRunStatus() {
      // 递归终止条件
      if (!this.shouldContinue) return;

      getRunStatus({
        devId: uni.getStorageSync("devId"),
      }).then((res) => {
        console.log(res);
        this.runStatus = res.data;
        // this.setBtnCtrl();
        // 设置延时以递归调用此函数
        setTimeout(() => {
          this.getDouRunStatus();
        }, 1000); // 1000毫秒后再次调用
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

      let bz = status.isManualZero;
      let be = status.isManualEmpty;
      let bc = status.isManualClean;
      let b = bz || be || bc;

      this.btnCtrl["reset"] = !b;
      this.btnCtrl["empty"] = !b || be;
      this.btnChecked["empty"] = be;
      this.btnCtrl["clean"] = !b || bc;
      this.btnChecked["clean"] = bc;

      if (!b) {
        this.shouldContinue = false;
      }
    },
    changeDstate(e) {
      console.log("dstate", e);
      this.dstate = e;
    },
    startReader(interval) {
      this.intervalId = setInterval(() => {
        refreshCache({
          devId: uni.getStorageSync("devId"),
        }).then((res) => {
          console.log("刷新", res);
          this.$refs.douImage.getDouWeight();
          this.$refs.douImage.refreshDouStatus();
        });
      }, interval);
    },
    stopReader() {
      clearInterval(this.intervalId);
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

.btn-checked {
  background-color: #569bc6;
  color: white;
}
</style>
