<script>
import config from "./config";
import store from "@/store";
import { getToken } from "@/utils/auth";
import { changeDevStatus } from "@/api/device/business.js";

export default {
  onLaunch: function () {
    this.initApp();
  },
  onHide() {
    console.log("应用进入后台");
    // 将该用户正在操作的设备的操作状态改为0
  },
  methods: {
    // 初始化应用
    initApp() {
      // 初始化应用配置
      this.initConfig();
      // 检查用户登录状态
      //#ifdef H5
      this.checkLogin();
      //#endif
    },
    initConfig() {
      this.globalData.config = config;
    },
    checkLogin() {
      if (!getToken()) {
        this.$tab.reLaunch("/pages/login");
      }
    },
  },
};
</script>

<style>
/* #ifndef APP-PLUS-NVUE */
@import "@/common/uni.css";
@import "@/static/css/weui/weui-app.css";
/* #endif*/
@import "common/uni-nvue.css";
</style>

<style lang="scss">
/* #ifndef APP-PLUS-NVUE */
@import "@/static/scss/index.scss";
/* #endif*/
</style>
