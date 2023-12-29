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
            '&isFJ=' +
            it.isFJ
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
import { checkDevStatus } from "@/api/device/business.js";
export default {
  data() {
    return {
      menuList: [
        {
          text: "主控板",
          param: "0",
        },
        {
          text: "分立板",
          param: "1",
        },
        {
          text: "分立板-集料斗",
          param: "1",
          isFJ: true,
        },
        {
          text: "振机板",
          param: "2",
        },
        {
          text: "振动板",
          param: "3",
        },
        {
          text: "拓展板",
          param: "4",
        },
      ],
      devName: null,
    };
  },
  onLoad(opt) {
    console.log(opt);
    let devName = opt.devName;
    this.devName = uni.getStorageSync("devName");
    // 检测设备是否在线
    checkDevStatus({
      devId: uni.getStorageSync("devId"),
    }).then((res) => {
      if (res.msg != 200) {
        console.log(res);
        uni.showToast({
          title: "当前设备" + res.msg,
          icon: "none",
          showCancel: false,
        });
        return;
      }

      // 首次加载进来的时候，采集一次模块参数
      uni.showLoading({
        title: "模块数据采集中",
      });
      collModuleStatus({
        devId: uni.getStorageSync("devId"),
      }).then((res) => {
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

<style></style>
