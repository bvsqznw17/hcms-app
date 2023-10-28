<template>
  <view>
    <view class="overlay" v-if="show">
      <view class="progress-modal">
        <view class="progress-bar">
          <view class="progress" :style="{ width: progressWidth }"></view>
        </view>
        <view class="message">{{ message }}</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: '',
    },
    progress: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    progressWidth() {
      return this.progress + '%';
    },
  },
};
</script>

<style scoped>
.overlay {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.progress-modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(200, 200, 200, 0.8); /* 背景颜色为半透明的白色 */
  padding: 20px;
  border-radius: 4px;
  text-align: center;
  width: auto; /* 让宽度自适应进度条 */
  height: auto; /* 让高度自适应进度条 */
  min-width: 300px; /* 最小宽度为 200px，以避免过于紧缩 */
}


.progress-bar {
  width: 100%;
  height: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 10px;
  overflow: hidden;
  /* 将进度条的高度调整为 20px */
  height: 20px;
}

.progress {
  height: 100%;
  background-color: #2db7f5;
}
</style>
