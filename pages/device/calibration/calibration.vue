<template>
  <view class="app">

    <!-- 小方格和分割线 -->
    <view class="small-box-section">
      <!-- 小方格 -->
      <view class="small-box-container">
        <view v-for="(weight, index) in weightValues" :key="index" class="small-box">
          <span class="box-number">{{ index + 1 }}</span>
          <span class="box-weight">{{ weight }}</span>
        </view>
      </view>

      <!-- 分割线 -->
      <view class="separator"></view>
    </view>

    <!-- 实时重量 -->
    <view class="weight">
      <view class="weight-value-container">
        <span class="weight-value">{{ realtimeWeight }}</span>
        <span class="weight-unit">g</span>
      </view>
    </view>

    <!-- 振动单选项 -->
    <radio-group class="uni-flex uni-row radio-group rg" @change="radioChange1">
      <radio value="1" class="radio">振动1</radio>
      <radio value="2" class="radio">振动2</radio>
      <radio value="3" class="radio">振动3</radio>
      <radio value="4" class="radio">振动4</radio>
    </radio-group>

    <view class="input-container">
      <label class="input-label">砝码重量:
        <input type="text" v-model="weightValue" class="input-field">
      </label>
      <label class="input-label">满量程:
        <input type="text" v-model="capacityValue" class="input-field">
      </label>
    </view>

    <!-- 单选项和按钮 -->
    <view class="options-section">
      <!-- 单选项 -->
      <radio-group class="uni-flex uni-row radio-group rg" @change="radioChange2">
        <radio value="1" class="radio">初始标定</radio>
        <radio value="2" class="radio">重新标定</radio>
        <radio value="3" class="radio">标定所有</radio>
      </radio-group>

      <!-- 按钮 -->
      <view class="button-area">
        <uni-button class="action-btn" @click="zero">置零</uni-button>
        <uni-button class="action-btn" @click="full">满度</uni-button>
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
export default {
  data() {
    return {
      realtimeWeight: "0.5", // 实时重量示例值
      weightValue: "", // 砝码重量
      capacityValue: "", // 满量程
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
      zdOption: "1", // 振动选项
      calibrationOption: "1", // 标定选项
    };
  },
  methods: {
    showMenuBtns() {
      // 控制显示/隐藏菜单按钮的方法
    },
    zero() {
      // 置零操作方法
      this.InDeveloping();
    },
    full() {
      // 满度操作方法
      this.InDeveloping();
    },
    radioChange1(e) {
      console.log(e);
      this.zdOption = e.detail.value;
    },
    radioChange2(e) {
      console.log(e);
      this.calibrationOption = e.detail.value;
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
  color: #39ff14; /* 荧光绿色 */
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

.separator {
  /* 分割区域样式 */
  height: 1px;
  background-color: #ccc;
  margin: 10px 0;
}

.options-section {
  /* 单选项和按钮的区域样式 */
  display: flex;
  flex-direction: column;
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
  background-color: #f5f5f5; /* Adjust the background color as per your design */
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
</style>