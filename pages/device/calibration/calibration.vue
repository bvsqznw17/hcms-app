<template>
  <view class="app">
    <!-- 小方格和分割线 -->
    <view class="small-box-section">
      <!-- 小方格 -->
      <DouImage
        ref="douImage"
        :followDouStatus="false"
        :zzjState="zzjState"
        :showWeightLabel="isCkAll"
        @boxClicked="boxClicked"
        @zzClicked="zzClicked"
        @changeWeightValues="changeWeightValues"
      ></DouImage>

      <!-- 分割线 -->
      <view class="separator"></view>
    </view>

    <!-- 实时重量 -->
    <view class="weight">
      <view class="weight-value-container">
        <span class="weight-value">{{ realtimeWeight }}</span>
        <span class="weight-unit">{{ weight_unit }}</span>
      </view>
    </view>

    <!-- 振动单选项 -->
    <radio-group class="uni-flex uni-row radio-group rg" @change="radioChange1">
      <radio value="1" class="radio" :disabled="zdno[0]">振动1</radio>
      <radio value="2" class="radio" :disabled="zdno[1]">振动2</radio>
      <radio value="3" class="radio" :disabled="zdno[2]">振动3</radio>
      <radio value="4" class="radio" :disabled="zdno[3]">振动4</radio>
    </radio-group>

    <view class="input-container">
      <label class="input-label"
        >砝码重量:
        <input
          type="text"
          v-model="weightPvs.sys_nov_czd"
          class="input-field"
          :disabled="weightDisable"
        />
      </label>
      <label class="input-label"
        >满量程:
        <input
          type="text"
          v-model="weightPvs.sys_max_czd"
          class="input-field"
          :disabled="weightDisable"
        />
      </label>
    </view>

    <!-- 单选项和按钮 -->
    <view class="options-section">
      <!-- 单选项 -->
      <radio-group
        style="flex: 2"
        class="uni-flex uni-row radio-group rg"
        @change="radioChange2"
      >
        <radio value="0" class="radio">初始标定</radio>
        <radio value="1" class="radio" :checked="true" :disabled="false"
          >重新标定</radio
        >
      </radio-group>
      <checkbox-group class="ckbox" @change="selAllBox">
        <label> <checkbox value="1" :checked="isCkAll" />标定所有 </label>
      </checkbox-group>
    </view>

    <!-- 按钮 -->
    <view class="button-area">
      <button class="action-btn" @click="zero" :disabled="disbtn['zero']">
        置零
      </button>
      <button class="action-btn" @click="full" :disabled="disbtn['full']">
        满度
      </button>
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
    <simple-process
      :show="showProgress"
      :message="processMsg"
      :progress="progress"
    ></simple-process>
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
import { formatNumber } from "@/utils/util.js";
import simpleProcess from "@/components/simpleProgress/simpleProgress";
export default {
  components: {
    DouImage,
    simpleProcess,
  },
  data() {
    return {
      realtimeWeight: "--",
      weight_unit: "g",
      programNum: "01",
      productName: "产品名称",
      dotNum: 0,
      zdOption: "1",
      curseldn: -1, // 选中的斗
      doustatus: 0,
      isCkAll: false, // 是否全选
      bdState: "1", // 标定状态 0 是初始标定 1 是重新标定
      zzjState: 0, // 主振机状态-颜色 0 灰色 1 蓝色 2 红色
      c_anew: true, // 是否重新标定
      showWeightLabel: false, // 是否显示重量标签
      disbtn: {
        zero: false,
        full: true,
      },
      zdno: [true, true, true, true], // 是否禁用振动单选
      weightValues: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      weightDisable: true,
      progress: 0, // 进度条进度
      showProgress: false,
      processMsg: "",
      intervalId: null,
      intervalId2: null,
      weightPvs: {
        sys_nov_czd: 0,
        sys_max_czd: 0,
        sys_nov_zzj: 0,
        sys_max_zzj: 0,
        sys_nov_zd: 0,
        sys_max_zd: 0,
      },
    };
  },
  mounted() {
    this.dotNum = uni.getStorageSync("sys_dot_num");
    this.weight_unit = uni.getStorageSync("sys_Unit");
    this.dotNum = parseInt(this.dotNum) % 4;
    console.log(this.dotNum);
    // this.getDouWeight();
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
    // 清除定时器，避免内存泄漏
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.stopReader();
  },

  methods: {
    // 向设备发送指令
    sendCmd(cmd, cmdParam) {
      let devId = uni.getStorageSync("devId");
      // uni.showLoading({
      //   title: "执行中",
      //   mask: true,
      // });
      writeCmd({
        devId: devId,
        cmd: cmd,
        cmdParam: cmdParam,
      }).then((res) => {
        console.log(res);
        if (res.code == 200) {
          getCmdResult({
            devId: devId,
          }).then((resp) => {
            if (resp.code == 200) {
              this.refreshDouWeight();
            }
          });
        } else {
          uni.showToast({
            title: "指令下发失败",
          });
        }
      });
    },
    changeWeightValues(weightValues) {
      console.log("重量值", weightValues);
      this.weightValues = weightValues;
      this.realtimeWeight =
        this.curseldn > 0 ? weightValues[this.curseldn - 1] : "--";
    },
    // 读取斗状态-用于本页面的重量显示
    getDouWeight() {
      readParam({
        devId: uni.getStorageSync("devId"),
        paramKey: "doustatus",
      }).then((res) => {
        console.log("斗状态", res);
        if (!res.data) return;
        let doustatus = JSON.parse(res.data.doustatus);

        for (let i = 0; i < doustatus.length; i++) {
          doustatus[i] = formatNumber(doustatus[i], this.dotNum);
        }
        this.doustatus = doustatus;

        // 显示14个即可
        let douNum = 14;
        let startPosition = Math.floor((douNum + 1) / 2);
        this.weightValues = doustatus.slice(
          startPosition,
          startPosition + douNum
        );
        console.log("重量数组", this.weightValues);
      });
    },
    // 读取砝码重量和量程
    readWeightAndRangeParam() {
      readParams({
        devId: uni.getStorageSync("devId"),
        paramKeys: JSON.stringify(Object.keys(this.weightPvs)),
      }).then((res) => {
        console.log(res);
        this.weightPvs = res.data;
        // 对数组的数据进行格式化
        Object.keys(this.weightPvs).forEach((key) => {
          this.weightPvs[key] = formatNumber(this.weightPvs[key], this.dotNum);
        });
      });
    },
    // 置零操作方法
    async zero() {
      const douNumber = this.curseldn;
      if (this.isCkAll) douNumber = 0;
      if (douNumber < 0) {
        uni.showToast({
          title: "请选择斗",
        });
        return;
      }

      this.sendCmd(ctrlno.CTL_DOU_CALIZERO, douNumber);
      this.startProgress(3);

      this.setEnabledZero(true);

      if (this.c_anew) {
        setTimeout(() => {
          this.startProgress(2);
          this.setEnabledZero(false);
        }, 3050);
      }
    },
    // 满度操作方法
    full() {
      const douNumber = this.curseldn;
      if (this.isCkAll) douNumber = 0;
      if (douNumber < 0) {
        uni.showToast({
          title: "请选择斗",
        });
        return;
      }

      this.startProgress(3);
      this.sendCmd(ctrlno.CTL_DOU_CALIFULL, douNumber);

      this.setEnabledZero(false);
    },
    radioChange1(e) {
      console.log(e);
      this.zdOption = e.detail.value;
      // this.sendCmd(ctrlno.CTL_SEZ, e);
    },
    radioChange2(e) {
      this.bdState = e.detail.value;
      this.c_anew = this.bdState == "1";
    },
    selAllBox(e) {
      console.log(e);
      this.isCkAll = e.detail.value.length > 0;
      this.selAllDou(this.isCkAll);
    },
    selAllDou(b) {
      console.log("selAllDou", b);
      // if (this.isCkAll == b) {
      //   return;
      // }
      this.setBoxColor(null, b ? 7 : 0);
      this.zzjState = 0;
      this.curseldn = -1;
      this.refreshDouWeight();
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
    boxClicked(index) {
      let douNumber = index + 1;
      this.realtimeWeight = this.weightValues[index];
      if (douNumber == this.curseldn) {
        this.sendCmd(ctrlno.CTL_SEZ, douNumber);
        return false;
      }
      this.selAllDou(false);
      this.setBoxColor([index], 7);
      this.curseldn = douNumber;
      this.weightDisable = false;
      this.realtimeWeight = this.weightValues[index];
    },
    zzClicked() {
      this.isCkAll = false;
      this.selAllDou(false);
      this.zzjState = 2;
      this.curseldn = -1;
      this.weightDisable = false;
      console.log(this.doustatus);
      this.realtimeWeight = this.doustatus[14];
    },
    // 设置小方格颜色
    setBoxColor(arr, ckey) {
      if (arr != null) {
        this.$refs.douImage.setBoxColor(arr, ckey);
      } else {
        this.$refs.douImage.setBoxColor(
          [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
          ckey
        );
      }
    },
    setEnabledZero(b) {
      this.disbtn["zero"] = b;
      this.disbtn["full"] = !b;
      // this.c_anew = !b;
    },
    refreshDouWeight() {
      // this.getDouWeight();
      this.readWeightAndRangeParam();
      this.$refs.douImage.refreshDouWeight();
    },
    updateProgress(percent) {
      if (percent < 0) {
        percent = 0;
      } else if (percent > 100) {
        percent = 100;
      }
      this.progress = percent;
      this.processMsg = "进度" + percent + "%";
    },
    startProgress(totalSeconds) {
      this.showProgress = true;
      let percent = 1;
      let intervalId = setInterval(() => {
        this.updateProgress(percent++);
        if (percent > 100) {
          clearInterval(intervalId);
          this.showProgress = false;
        }
      }, totalSeconds * 10);
    },
    startReader(interval) {
      this.intervalId2 = setInterval(() => {
        refreshCache({
          devId: uni.getStorageSync("devId"),
        }).then((res) => {
          console.log("刷新", res);
          this.$refs.douImage.getDouWeight();
        });
      }, interval);
    },
    stopReader() {
      clearInterval(this.intervalId2);
    },
    // refreshUI() {
    //   let d = this.isCkAll || (this.curseldn >= 1 && this.curseldn <= 14);
    //   let g = !d && this.curseldn >= 0;
    //   let z = !d && this.curseldn == -1;
    // },
  },
};
</script>

<style>
/* 样式规则 */
.app {
  /* 整体样式 */
}

.weight {
  /* 实时重量样式 */
  display: flex;
  align-items: center;
  justify-content: center;
  /* margin-top: 10px; */
  background-color: #333;
  flex-direction: column;
  /* padding-bottom: 10px; */
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
  color: #39ff14;
  /* 荧光绿色 */
  position: relative;
  /* margin-bottom: 10px; */
}

.input-container {
  /* 输入框容器样式 */
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ccc;
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

.small-box-section {
  /* 小方格和分割线的区域样式 */
  display: flex;
  flex-direction: column;
  border-top: 1px solid #ccc;
}

.separator {
  /* 分割区域样式 */
  height: 1px;
  background-color: #ccc;
  margin: 10px 0;
}

.options-section {
  /* 单选项和按钮的区域样式 */
  display: flex;
  flex-direction: row;
  align-items: center; /* 确保垂直居中对齐 */
}

.radio-options {
  /* 单选项样式 */
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.button-area {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ccc;
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

.rg {
  border-bottom: 1px solid #ccc;
  padding: 10px;
}

.radio {
  flex: 1;
}

.input-label {
  display: flex;
  align-items: center;
  margin-right: 10px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 5px;
}

.input-field {
  border: none;
  outline: none;
  background-color: transparent;
  width: 60%;
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

.bottom-btn {
  flex: 1;
  min-width: 0;
  margin-right: 10px;
  background-color: #fff;
  color: #333;
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

.ckbox {
  flex: 1;
  border-bottom: 1px solid #ccc;
  padding: 10px;
}
</style>
