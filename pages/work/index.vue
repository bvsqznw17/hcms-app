<template>
  <view class="work-container">
    <!-- 轮播图 -->
    <uni-swiper-dot class="uni-swiper-dot-box" :info="data" :current="current" field="content">
      <swiper class="swiper-box" :current="swiperDotIndex" @change="changeSwiper">
        <swiper-item v-for="(item, index) in data" :key="index">
          <view class="swiper-item" @click="clickBannerItem(item)">
            <image :src="item.image" mode="aspectFill" :draggable="false" />
          </view>
        </swiper-item>
      </swiper>
    </uni-swiper-dot>

    <!-- 宫格组件 -->
    <uni-section title="系统菜单" type="line"></uni-section>
    <view class="grid-body">
      <uni-grid :column="4" :showBorder="false">
        <uni-grid-item v-for="(item, index) in menuList" :key="index">
          <view class="grid-item-box" @click="skipToPage(item.perms)">
            <uni-icons :type="item.icon" size="30"></uni-icons>
            <text class="text">{{item.menuName}}</text>
          </view>
        </uni-grid-item>
      </uni-grid>
    </view>
    <!-- 在最底部增加一个返回模式选择的按钮 -->
    <!-- <view class="back-btn">
      <button class="button" @click="backToModeSelect">返回模式选择</button>
    </view> -->
  </view>
</template>

<script>
import { getMenuData } from "@/api/system/menu.js";
export default {
  data() {
    return {
      current: 0,
      swiperDotIndex: 0,
      menuList: [],
      data: [
        {
          image: "/static/images/banner/banner1.jpg",
        },
        {
          image: "/static/images/banner/banner2.jpg",
        },
        {
          image: "/static/images/banner/banner3.jpg",
        },
      ],
    };
  },
  onLoad(opt) {
    console.log(opt);
    // 获取菜单列表
    getMenuData().then((res) => {
      console.log(res);
      this.menuList = res.data;
      // 过滤掉软件升级菜单
      this.menuList = this.menuList.filter((item) => {
        return item.perms !== "upgrade";
      });
      console.log(this.menuList);
    });
  },
  methods: {
    clickBannerItem(item) {
      console.info(item);
    },
    changeSwiper(e) {
      this.current = e.detail.current;
    },
    changeGrid(e) {
      this.$modal.showToast("模块建设中~");
    },
    // 跳转到具体页面
    skipToPage(page) {
      this.$tab.navigateTo("/pages/device/" + page + "/" + page);
    },
    // 返回模式选择页面
    // backToModeSelect() {
    //   this.$tab.reLaunch("/pages/workModel/workModel");
    // },
  },
};
</script>

<style lang="scss">
/* #ifndef APP-NVUE */
page {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background-color: #fff;
  min-height: 100%;
  height: auto;
}

view {
  font-size: 14px;
  line-height: inherit;
}

/* #endif */

.text {
  text-align: center;
  font-size: 26rpx;
  margin-top: 10rpx;
}

.grid-item-box {
  flex: 1;
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px 0;
}

.uni-margin-wrap {
  width: 690rpx;
  width: 100%;
}

.swiper {
  height: 300rpx;
}

.swiper-box {
  height: 150px;
}

.swiper-item {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  height: 300rpx;
  line-height: 300rpx;
}

@media screen and (min-width: 500px) {
  .uni-swiper-dot-box {
    width: 400px;
    /* #ifndef APP-NVUE */
    margin: 0 auto;
    /* #endif */
    margin-top: 8px;
  }

  .image {
    width: 100%;
  }
}

.button {
  position: absolute;
  bottom: 1%;
  left: 30%;
  padding: 0.25em;
  border: none;
  border-radius: 0.25em;
  font-size: 1.3em;
  color: #555555;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  margin: 1em 0;
  width: 40%;
  // background-color: #4CAF50;;
}
</style>