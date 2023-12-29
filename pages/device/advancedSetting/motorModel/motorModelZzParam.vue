<template>
  <view class="tabs">
    <scroll-view
      ref="tabbar1"
      id="tab-bar"
      class="tab-bar"
      :scroll="false"
      :scroll-x="true"
      :show-scrollbar="false"
      :scroll-into-view="scrollInto"
    >
      <view style="flex-direction: column">
        <view style="flex-direction: row">
          <view
            class="uni-tab-item"
            v-for="(tab, index) in ItabList"
            :key="'tab' + tab"
            :id="'tab' + tab"
            :ref="'tabitem' + index"
            :data-id="index"
            :data-current="index"
            @click="ontabtap"
          >
            <text
              class="uni-tab-item-title"
              :class="tabIndex == index ? 'uni-tab-item-title-active' : ''"
              >{{ tab }}</text
            >
          </view>
        </view>
        <view class="scroll-view-indicator">
          <view
            ref="underline"
            class="scroll-view-underline"
            :class="isTap ? 'scroll-view-animation' : ''"
            :style="{
              left: indicatorLineLeft + 'px',
              width: indicatorLineWidth + 'px',
            }"
          ></view>
        </view>
      </view>
    </scroll-view>
    <view class="tab-bar-line"></view>
    <swiper
      class="tab-view"
      :style="{ height: swiperHeight + 'px' }"
      ref="swiper1"
      id="tab-bar-view"
      :current="tabIndex"
      :duration="300"
      @change="onswiperchange"
      @transition="onswiperscroll"
      @animationfinish="animationfinish"
      @onAnimationEnd="animationfinish"
    >
      <swiper-item
        class="swiper-item"
        v-for="(page, index) in tabList"
        :key="index"
      >
        <swiper-page
          class="swiper-page"
          :swHeight="swiperHeight"
          :page="page"
          :pid="index"
          ref="page"
        >
        </swiper-page>
      </swiper-item>
    </swiper>
    <!-- 原点检测按钮 -->
    <view class="btn-wrapper">
      <button
        class="oc-btn-wrapper-button"
        plain
        type="primary"
        @click="checkOrigin()"
      >
        原点检测
      </button>
    </view>
    <!-- // 保存按钮 -->
    <view class="btn-wrapper">
      <button
        class="btn-wrapper-button"
        plain
        type="primary"
        @click="submit(pageId)"
        :disabled="userModel == 1"
      >
        保存
      </button>
    </view>
  </view>
</template>

<script>
import { getMotorParam } from "@/api/device/paramValue.js";

import { checkDevStatus } from "@/api/device/business.js";

import swiperPage from "./swiper-page.nvue";

// #ifdef APP-PLUS
const dom = weex.requireModule("dom");
// #endif

const TAB_PRELOAD_OFFSET = 1;

export default {
  components: {
    swiperPage,
  },
  data() {
    let self = this;
    return {
      isShowPage: false, // 是否显示参数列表
      ItabList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      tabList: [],
      tabIndex: 0,
      scrollInto: "",
      indicatorLineLeft: 0,
      indicatorLineWidth: 0,
      isTap: false,
      pageId: 0,
      // 轮播页高度
      swiperHeight: self.getWindowHeight(),
      queryParams: {
        ip: null,
        devName: null,
        mainModel: 0,
        subModel: 0,
        paramSubType: 1,
        pageNum: 1,
        pageSize: 200,
      },
      pkIdx: 0,
      pkChange: false,
      gdData: "", // 光电停止角度数据 json字符串形式
      userModel: 1,
    };
  },
  onLoad() {
    this.userModel = uni.getStorageSync("userModel");
    uni.showLoading({
      title: "数据加载中",
    });
    // 加载参数面板数据之前，先测试一下设备是否在线
    checkDevStatus({
      devId: uni.getStorageSync("devId"),
    }).then((res) => {
      if (res.msg != 200) {
        uni.hideLoading();
        uni.showToast({
          title: "当前设备" + res.msg,
          icon: "none",
          showCancel: false,
        });
        setTimeout(() => {
          uni.navigateBack({
            delta: 1,
          });
        }, 1000);
      } else {
        this.loadTabPanelData();
      }
    });
  },
  onReady() {
    this._lastTabIndex = 0;
    this.swiperWidth = 0;
    this.tabbarWidth = 0;
    this.tabListSize = {};
    this._touchTabIndex = 0;
    // this.selectorQuery();
  },
  methods: {
    // 加载参数面板数据
    async loadTabPanelData() {
      // 查询得到一个数组，这个数组应当可以直接被用于展示用-每组6个对象，直接查询返回，然后使用
      let that = this;
      let queryParams = {
        devId: uni.getStorageSync("devId"),
        mainModel: that.queryParams.mainModel,
        subModel: that.queryParams.subModel,
      };
      console.log(queryParams);
      let p = await getMotorParam(queryParams).then((res) => {
        console.log(res);
        uni.hideLoading();
        return res.data;
      });
      // 遍历p，根据decimalNum字段，将其转换为对应的小数位数
      // p是一个二维数组，每个元素是一个数组，每个数组中有6个对象
      for (let i = 0; i < p.length; i++) {
        for (let j = 0; j < p[i].length; j++) {
          let decimalNum = p[i][j].decimalNum;
          p[i][j].paramValue = (
            p[i][j].paramValue / Math.pow(10, decimalNum)
          ).toFixed(decimalNum);
        }
      }
      // 截取p的最后两个元素作为gdData，并将p的最后两个元素删除
      that.gdData = JSON.stringify(p.splice(p.length - 2, p.length));
      this.checkMaxSpeed(p);
      that.tabList = p;
      console.log(that.tabList);
      setTimeout(() => {
        this.pageList = this.$refs.page;
        this.selectorQuery();
      }, 1000);
    },
    // 选项卡点击事件处理
    ontabtap(e) {
      let index = e.target.dataset.current || e.currentTarget.dataset.current;
      //let offsetIndex = this._touchTabIndex = Math.abs(index - this._lastTabIndex) > 1;

      // #ifdef APP-PLUS || H5 || MP-WEIXIN || MP-QQ
      this.isTap = true;
      var currentSize = this.tabListSize[index];
      this.updateIndicator(currentSize.left, currentSize.width);
      this._touchTabIndex = index;
      // #endif

      // 切换tab
      this.switchTab(index);
    },
    onswiperchange(e) {
      if (this.isTap) return;
      console.log("onswiperchange");
      // TODO 编译时注意是否会触发条件编译

      let index = e.target.current || e.detail.current;
      this.switchTab(index);
    },
    onswiperscroll(e) {
      if (this.isTap) {
        return;
      }

      var offsetX = e.detail.dx;
      var preloadIndex = this._lastTabIndex;
      if (offsetX > TAB_PRELOAD_OFFSET) {
        preloadIndex++;
      } else if (offsetX < -TAB_PRELOAD_OFFSET) {
        preloadIndex--;
      }
      if (
        preloadIndex === this._lastTabIndex ||
        preloadIndex < 0 ||
        preloadIndex > this.pageList.length - 1
      ) {
        return;
      }

      // #ifdef APP-NVUE || APP-PLUS || H5 || MP-WEIXIN || MP-QQ
      var percentage = Math.abs(this.swiperWidth / offsetX);
      var currentSize = this.tabListSize[this._lastTabIndex];
      var preloadSize = this.tabListSize[preloadIndex];
      var lineL =
        currentSize.left + (preloadSize.left - currentSize.left) / percentage;
      var lineW =
        currentSize.width +
        (preloadSize.width - currentSize.width) / percentage;
      this.updateIndicator(lineL, lineW);
      // #endif
    },
    animationfinish(e) {
      // console.log('animationfinish')
      // #ifdef APP-NVUE || APP-PLUS || H5 || MP-WEIXIN || MP-QQ
      let index = e.detail.current;
      if (this._touchTabIndex === index) {
        this.isTap = false;
      }
      this._lastTabIndex = index;
      // this.switchTab(index);
      this.updateIndicator(
        this.tabListSize[index].left,
        this.tabListSize[index].width
      );
      // #endif
    },
    selectorQuery() {
      // #ifdef APP-NVUE
      // 查询 tabbar 宽度
      uni
        .createSelectorQuery()
        .in(this)
        .select("#tab-bar")
        .boundingClientRect()
        .exec((rect) => {
          this.tabbarWidth = rect[0].width;
        });
      // 查询 tabview 宽度
      uni
        .createSelectorQuery()
        .in(this)
        .select("#tab-bar-view")
        .boundingClientRect()
        .exec((rect) => {
          this.swiperWidth = rect[0].width;
        });

      // 因 nvue 暂不支持 class 查询
      var queryTabSize = uni.createSelectorQuery().in(this);
      for (var i = 0; i < this.ItabList.length; i++) {
        queryTabSize.select("#tab" + this.ItabList[i]).boundingClientRect();
      }
      queryTabSize.exec((rects) => {
        console.log(JSON.stringify(rects));
        rects.forEach((rect) => {
          this.tabListSize[rect.dataset.id] = rect;
        });
      });
      // #endif

      // #ifdef MP-WEIXIN || H5 || MP-QQ
      console.log(1);
      uni
        .createSelectorQuery()
        .in(this)
        .select(".tab-view")
        .fields(
          {
            dataset: true,
            size: true,
          },
          (res) => {
            this.swiperWidth = res.width;
          }
        )
        .exec();
      uni
        .createSelectorQuery()
        .in(this)
        .selectAll(".uni-tab-item")
        .boundingClientRect((rects) => {
          rects.forEach((rect) => {
            this.tabListSize[rect.dataset.id] = rect;
          });
          this.updateIndicator(
            this.tabListSize[this.tabIndex].left,
            this.tabListSize[this.tabIndex].width
          );
        })
        .exec();
      // #endif
      console.log(this.tabListSize);
    },
    updateIndicator(left, width) {
      this.indicatorLineLeft = left;
      this.indicatorLineWidth = width;
    },
    switchTab(index) {
      this.pageId = index;

      if (this.tabIndex === index) {
        return;
      }
      this.tabIndex = index;
      console.log("switch tab");
      // #ifdef APP-NVUE
      console.log("nvue");
      this.scrollTabTo(index);
      // #endif
      // #ifndef APP-NVUE
      console.log("not nvue");
      this.scrollInto = "tab" + index;
      // #endif
    },
    scrollTabTo(index) {
      console.log(this.$refs);
      const el = this.$refs["tabitem" + index][0];
      let offset = 0;
      // TODO fix ios offset
      if (index > 0) {
        offset = this.tabbarWidth / 2 - this.tabListSize[index].width / 2;
        if (this.tabListSize[index].right < this.tabbarWidth / 2) {
          offset = this.tabListSize[0].width;
        }
      }
      dom.scrollToElement(el, {
        offset: -offset,
      });
    },
    // 获取屏幕高度
    getWindowHeight() {
      let height = 0;
      uni.getSystemInfo({
        success(res) {
          height = res.windowHeight - uni.upx2px(300);
        },
      });
      return height;
    },
    // 保存参数修改
    submit(pageId) {
      console.log(pageId);
      console.log(this.$refs);
      // 检测设备是否在线
      checkDevStatus({
        devId: uni.getStorageSync("devId"),
      }).then((res) => {
        if (res.msg != 200) {
          uni.showToast({
            title: "当前设备" + res.msg,
            icon: "none",
            showCancel: false,
          });
          return;
        }

        this.pageList[pageId].savePageData();
      });
    },
    // 校验用户权限
    hasPerm(perm) {
      return this.$auth.hasPermi(perm);
    },
    // 原点检测
    checkOrigin() {
      // 跳转到原点检测页面
      uni.navigateTo({
        url:
          "/pages/device/advancedSetting/motorModel/originCheck?data=" +
          this.gdData,
      });
    },
    // 检查最大速度是否是0，如果最大速度是0，修改同一个对象中的'角度'字段：paramName='停顿时间',decimalNum=0
    checkMaxSpeed(tabList) {
      // 遍历tabList，对最大速度为0的参数进行处理，tabList是一个二维数组，第一维是tab页，第二维是tab页中的参数
      for (let i = 0; i < tabList.length; i++) {
        let maxSpeedIndex = -1;
        for (let j = 0; j < tabList[i].length; j++) {
          // paramName 包含 '最大速度' 并且 paramValue 为 0，去掉最后一个字符，判断是否为 '最大速度'
          let isMaxSpeed =
            tabList[i][j].paramName.substring(0, 4) == "最大速度";
          if (isMaxSpeed && tabList[i][j].paramValue == 0) {
            maxSpeedIndex = j;
          }
        }
        if (maxSpeedIndex >= 0) {
          for (let k = 0; k < tabList[i].length; k++) {
            let item = tabList[i][k];
            let isAngle = item.paramName.substring(0, 2) == "角度";
            if (isAngle) {
              item.paramName = "停顿时间" + i;
              item.decimalNum = 0;
              item.paramValue = (
                item.paramValue / Math.pow(10, item.decimalNum)
              ).toFixed(item.decimalNum);
            }
          }
        }
      }
    },
  },
};
</script>

<style>
/* #ifndef APP-PLUS */
page {
  width: 100%;
  min-height: 100%;
  display: flex;
}

/* #endif */

.page {
  flex: 1;
}

.flexible-view {
  background-color: #f823ff;
}

.tabs {
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  background-color: #ffffff;
  /* #ifdef MP-ALIPAY || MP-BAIDU */
  height: 100vh;
  /* #endif */
}

.tab-bar {
  width: 750upx;
  height: 84upx;
  flex-direction: row;
  /* #ifndef APP-PLUS */
  white-space: nowrap;
  /* #endif */
}

/* #ifndef APP-NVUE */
.tab-bar ::-webkit-scrollbar {
  display: none;
  width: 0 !important;
  height: 0 !important;
  -webkit-appearance: none;
  background: transparent;
}

/* #endif */

.scroll-view-indicator {
  position: relative;
  height: 2px;
  background-color: transparent;
}

.scroll-view-underline {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 0;
  background-color: #007aff;
}

.scroll-view-animation {
  transition-duration: 0.2s;
  transition-property: left;
}

.tab-bar-line {
  height: 1upx;
  background-color: #cccccc;
}

.tab-view {
  flex: 1;
}

.uni-tab-item {
  /* #ifndef APP-PLUS */
  display: inline-block;
  /* #endif */
  flex-wrap: nowrap;
  padding-left: 25px;
  padding-right: 25px;
}

.uni-tab-item-title {
  color: #555;
  font-size: 30upx;
  height: 80upx;
  line-height: 80upx;
  flex-wrap: nowrap;
  /* #ifndef APP-PLUS */
  white-space: nowrap;
  /* #endif */
}

.uni-tab-item-title-active {
  color: #007aff;
}

.swiper-item {
  flex: 1;
  flex-direction: column;
}

.swiper-page {
  flex: 1;
  flex-direction: column;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

.btn-wrapper {
  display: flex;
  align-items: center;
  /* align: center; */
  height: 80upx;
  /* 		margin-top: 20upx;
		margin-bottom: 10upx;
		margin-left: 60upx; */
  margin: 20upx 0 20upx 60upx;
}

.btn-wrapper-button {
  /* width: 40%; */
  width: 120upx;
  line-height: 80upx;
  height: 80upx;
}

.oc-btn-wrapper-button {
  width: 160upx;
  line-height: 80upx;
  height: 80upx;
}
</style>
