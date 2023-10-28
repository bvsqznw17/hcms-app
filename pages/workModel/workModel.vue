<template>
  <div class="container">
    <div class="button-group">
      <button class="button monitoring" @click="setMode('monitoring')">监控模式</button>
      <button class="button operating" @click="setMode('operating')">操作模式</button>
    </div>
  </div>
</template>

<style>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.button-group {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: -25vh; /* Move the button group up by 5% of the viewport height */
  width: 40%; 
}

.button {
  padding: 0.5em;
  border: none;
  border-radius: 0.25em;
  font-size: 1.5em;
  color: black;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  margin: 1em 0;
  width: 100%; 
}

.monitoring {
  background-color: #4CAF50;
}

.operating {
  background-color: #2196F3;
}

.button:hover {
  opacity: 0.9;
}

</style>

<script>
export default {
  data() {
    return {
      userModel: null
    };
  },
  methods: {
    setMode(mode) {
      if (mode === 'monitoring') {
        this.userModel = 1;
      } else if (mode === 'operating') {
        this.userModel = 2;
      }
      // 跳转到work page
      uni.setStorageSync('userModel', this.userModel);
      this.$tab.reLaunch('/pages/work/index')
    }
  }
};
</script>
