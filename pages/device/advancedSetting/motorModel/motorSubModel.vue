<template>
  <view>
    <!-- 按钮菜单模板 -->
    <view class="uni-padding-wrap uni-common-mt">
      <view class="uni-btn-v">
        <view
          v-for="(it, idx) in menuList"
          :key="idx"
          @click="chooseModel(it.param)"
          :url="
            '/pages/device/advancedSetting/motorModel/motorModelParam?param=' +
            it.param
          "
          hover-class="navigator-hover"
        >
          <button type="default">{{ it.text }}</button>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      menuList: [
        {
          text: "模式0",
          param: "0",
        },
        {
          text: "模式1",
          param: "1",
        },
        {
          text: "模式2",
          param: "2",
        },
        {
          text: "模式3",
          param: "3",
        },
        {
          text: "模式4",
          param: "4",
        },
      ],
      devName: null,
      param: null,
    };
  },
  onLoad(opt) {
    this.param = opt.param;
    this.devName = opt.devName;
  },
  methods: {
    chooseModel(p) {
      uni.setStorageSync("mainModel", this.param);
      uni.setStorageSync("devName", this.devName);
      uni.setStorageSync("subModel", p);
      this.$tab.navigateTo(
        "/pages/device/advancedSetting/motorModel/motorModelParam"
      );
    },
  },
};
</script>

<style></style>
