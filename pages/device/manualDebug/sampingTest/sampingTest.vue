<template>
  <view class="container">
    <!-- 图表区域 -->
    <view class="chart-section">
      <!-- 图表组件插槽 -->
    </view>

    <!-- 状态信息与操作按钮区域 -->
    <view class="status-section">
      <!-- 机器状态显示 -->
      <view class="label-container">
        <view class="label-row">
          <view class="label-group">
            <text class="label">当前斗号：</text>
            <text class="value">{{ curseldn }}</text>
          </view>
          <view class="label-group">
            <text class="label">采样值：</text>
            <text class="value">{{ sampleValue }}</text>
          </view>
        </view>
        <view class="label-row">
          <view class="label-group">
            <text class="label">当前重量：</text>
            <text class="value">{{ weight }}</text>
          </view>
          <view class="label-group">
            <text class="label">最大值：</text>
            <text class="value">{{ maxValue }}</text>
          </view>
        </view>
      </view>

      <!-- 输入框和标签的容器 -->
      <view class="input-container">
        <label class="input-label"
          ><span class="label-text">包装速度：</span
          ><input type="text" v-model="prm_speed" class="input-field"
        /></label>
        <label class="input-label"
          ><span class="label-text">传感器滤波系数：</span
          ><input type="text" v-model="prm_ASF" class="input-field"
        /></label>
        <label class="input-label"
          ><span class="label-text">称重斗延时：</span
          ><input type="text" v-model="prm_CZD_Dly" class="input-field"
        /></label>
        <label class="input-label"
          ><span class="label-text">称重稳定时间：</span
          ><input type="text" v-model="prm_MSV_Dly" class="input-field"
        /></label>
      </view>
      <!-- <view class="input-container">
        <label class="input-label"
          >包装速度：:
          <input type="text" v-model="prm_speed" class="input-field" />
        </label>
        <label class="input-label"
          >传感器滤波系数:
          <input type="text" v-model="prm_ASF" class="input-field" />
        </label>
        <label class="input-label"
          >称重斗延时：
          <input type="text" v-model="prm_CZD_Dly" class="input-field" />
        </label>
        <label class="input-label"
          >称重稳定时间：
          <input type="text" v-model="prm_MSV_Dly" class="input-field" />
        </label>
      </view> -->

      <!-- 底部按钮 -->
      <view class="button-area">
        <!-- <button class="action-btn">返回</button> -->
        <button class="action-btn">置零</button>
        <button class="action-btn">测试</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      curseldn: "1",
      sampleValue: "2",
      maxValue: "3",
      weight: "4",
    };
  },
  methods: {
    zeroing() {
      // 归零操作逻辑
    },
    startTest() {
      // 开始测试操作逻辑
    },
  },
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  width: 100%; /* 根据您提供的宽度 */
  height: auto; /* 根据您提供的高度 */
  padding: 10px;
  box-sizing: border-box;
}

.status-section {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 10px;
}

.input-label {
  display: flex;
  width: 100%;
  justify-content: center;
  margin-bottom: 10px;
}

.label-text {
  text-align: right; /* 标签文本右对齐 */
  min-width: 150px; /* 设置一个最小宽度以保证冒号对齐 */
  display: inline-block; /* 确保可以设置宽度 */
  margin-right: 10px; /* 和输入框之间的间距 */
}

.input-field {
  border: none;
  outline: none;
  background-color: #ddd;
  width: 40%;
  margin-left: 10px;
}

.label-row {
  display: flex;
  justify-content: center; /* 居中对齐 */
  width: 100%;
  margin-bottom: 10px;
}

.label-group {
  display: flex;
  flex-direction: row; /* 水平排列 */
  align-items: center;
  margin-right: 20px; /* 增加标签组间距 */
}

.label {
  font-size: 16px;
  margin-right: 5px; /* 增加标签和值之间的距离 */
  white-space: nowrap; /* 防止换行 */
}

.value {
  font-size: 16px;
  white-space: nowrap; /* 防止换行 */
}

/* 样式用于不可用的重量标签 */
.disabled-weight {
  color: red; /* 文字颜色 */
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

.button-area {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 10px;
}

.button-area + .button-area {
  margin-top: 10px;
}
</style>
