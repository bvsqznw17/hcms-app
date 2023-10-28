<template>
  <view>
    <!-- 按钮菜单模板 -->
    <view class="uni-padding-wrap uni-common-mt">
      <view class="uni-btn-v">
        <navigator
          v-for="(it, idx) in menuList"
          :key="idx"
          :url="
            '/pages/device/advancedSetting/mkStatus/mkStatusParam?param=' +
            it.param +
            '&devName=' +
            devName
          "
          hover-class="navigator-hover"
        >
          <button type="default">{{ it.text }}</button>
        </navigator>
      </view>
    </view>
  </view>
</template>

<script>
import { collModuleStatus } from "@/api/device/paramValue";
import { listDevMsg } from "@/api/device/devMsg.js";
export default {
  data() {
    return {
      menuList: [
        { text: "主控板", param: "0" },
        { text: "分立板", param: "1" },
        { text: "振机板", param: "2" },
        { text: "振动板", param: "3" },
        { text: "拓展板", param: "4" },
      ],
      devName: null,
    };
  },
  onLoad(opt) {
    console.log(opt);
    let devName = opt.devName;
    this.devName = devName;
    // 检测设备是否在线
    listDevMsg({
      devName: devName,
    }).then((res) => {
      if (res.rows.length > 0 && res.rows[0].status == 0) {
        uni.showToast({
          title: "当前设备处于离线状态",
          icon: "none",
          showCancel: false,
        });
        return;
      }
      // 首次加载进来的时候，采集一次模块参数
      uni.showLoading({
        title: "模块数据采集中",
      });
      collModuleStatus({ devName: devName }).then((res) => {
        console.log(res);
        uni.hideLoading();
        if (res.code == 200) {
          uni.showModal({
            title: "采集完毕",
            showCancel: false,
          });
        } else {
          uni.showModal({
            title: "采集失败",
            showCancel: false,
          });
        }
      });
    });
  },
  methods: {},
};
</script>

<style>
</style>
