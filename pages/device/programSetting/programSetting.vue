<template>
  <view>
    <!-- 按钮菜单模板 -->
    <view class="uni-padding-wrap uni-common-mt">
      <view class="uni-btn-v">
        <navigator
          v-for="(it, idx) in menuList"
          :key="idx"
          :url="
            '/pages/device/programSetting/' +
            it.url +
            '/' +
            it.url +
            '?devName=' +
            devName +
            '&param=' +
            it.param
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
export default {
  data() {
    return {
      menuList: [
        {
          text: "基本参数",
          url: "baseParam",
          param: 1,
        },
        {
          text: "中级参数",
          url: "middleParam",
          param: 2,
        },
        {
          text: "振机设置",
          url: "zjSetting",
          param: 3,
        },
        {
          text: "时间调整",
          url: "timeSetting",
          param: 4,
        },
        {
          text: "马达模式",
          url: "motorModel",
          param: 5,
        },
        {
          text: "指定斗",
          url: "setDou",
          param: 6,
        },
        {
          text: "AFC",
          url: "AFC",
          param: 7,
        },
      ],
      devName: null,
    };
  },
  onLoad(opt) {
    let devName = uni.getStorageSync("devName");
    this.devName = devName;
  },
  methods: {},
};
</script>

<style>
.uni-common-mt {
  margin-top: 150upx;
}
</style>
