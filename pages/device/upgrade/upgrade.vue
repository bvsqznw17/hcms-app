<template>
  <view class="uni-container">
    <!-- 搜索框 -->
    <view>
      <view :class="['weui-search-bar', inputShowed ? 'weui-search-bar_focusing' : '']" id="searchBar">
        <form class="weui-search-bar__form">
          <view class="weui-search-bar__box">
            <i class="weui-icon-search"></i>
            <input type="text" id="searchInput" class="weui-search-bar__input" placeholder="请输入ip地址" v-model="inputVal" :focus="inputShowed" @input="inputTyping" />
            <span class="weui-icon-clear" v-if="inputVal.length > 0" @click="clearInput"></span>
          </view>
          <label class="weui-search-bar__label" @click="showInput">
            <i class="weui-icon-search"></i>
            <span class="weui-search-bar__text">搜索</span>
          </label>
        </form>
        <view class="weui-search-bar__cancel-btn" @click="hideInput">取消</view>
      </view>
      <view class="weui-cells searchbar-result" v-if="inputVal.length > 0">
        <block v-for="(item, index) in searchList" :key="index">
          <view class="weui-cell weui-cell_active weui-cell_access">
            <view @click="chooseRes" :data-ip="item.ip" class="weui-cell__bd weui-cell_primary">
              <view>{{item.ip}}</view>
            </view>
          </view>
        </block>
      </view>
    </view>
    <!-- 设备列表 -->
    <view class="uni-list">
      <block v-for="(item, index) in listData" :key="index">
        <view class="uni-list-cell" hover-class="uni-list-cell-hover">
          <view class="bus-list js_bus_list">
            <view class="bus-list-item">
              <!-- 左侧 -->
              <view class="dev-msg">
                <view>
                  <text class="_label">设备名称：</text>
                  <text style="">{{item.devName}}</text>
                </view>
                <view>
                  <text class="_label">设备型号：</text>
                  <text>{{item.devModel}}</text>
                </view>
                <view>
                  <text class="_label">当前版本：</text>
                  <text>{{item.version}}</text>
                </view>
                <view>
                  <text class="_label">通信状态：</text>
                  <text :style="{'color':(item.online ? '#13ce66' : '#e54d42')}">{{item.statusText}}</text>
                </view>
                <!-- <view>
                  <text class="_label">当前语言：</text>
                  <text>{{item.language}}</text>
                </view> -->
                <view>
                  <text class="_label">更新时间：</text>
                  <text>{{item.dtUpdate}}</text>
                </view>
              </view>
              <!-- 右侧 -->
              <view :id="index" :data-ip="item.ip" class="btns">
                <view class="_btn" @click="btnDo('upgrade', item)">软件升级</view>
                <!-- <view class="_btn" @click="btnDo('update', item)">语言更新</view> -->
              </view>
            </view>
          </view>
        </view>
      </block>
    </view>
    <uni-load-more :status="status" :icon-size="16" :content-text="contentText" />
    <!-- 		<picker @change="bindPickerChange1" range-key="version" :range="versionList" id="pb1" ref="pb1">
		</picker> -->
    <!-- 		<picker @change="bindPickerChange2" :range="languageList" ref="pb2">
		</picker> -->
    <pop-picker :dataList="versionList" :bindChange="bindPickerChange1" @confirm="confirmUp" ref="pb1"></pop-picker>
    <pop-picker :dataList="languageList" :bindChange="bindPickerChange2" @confirm="confirmLan" ref="pb2"></pop-picker>
  </view>
</template>

<script>
import { dateUtils, debounce } from "../../../utils/util.js";
import { listUpgrade, upgradeToNew } from "@/api/device/upgrade.js";
import { listVersion } from "@/api/device/version.js";
import { listLanguage, upgradeLanguage } from "@/api/device/language";
import { checkDevStatus } from "@/api/device/business.js";
import popPicker from "@/components/popPicker";

export default {
  components: {
    popPicker: popPicker,
  },
  data() {
    return {
      listData: [],
      reload: false,
      status: "more",
      contentText: {
        contentdown: "上拉加载更多",
        contentrefresh: "加载中",
        contentnomore: "没有更多",
      },
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        devName: null,
        ip: null,
        status: null,
      },
      searchList: [], // 搜索栏的选项列表
      inputShowed: false,
      inputVal: "",
      // 是否打开picker
      openPicker: false,
      versionList: [],
      languageList: [],
      versionObjList: [],
      languageObjList: [],
      total: 0,
      // 是否加载完毕
      loadAll: false,
      upParam: {},
      lanParam: {},
      userModel: "1", // 1：监控模式 2：操作模式
      online: false, // 设备是否在线
    };
  },
  onLoad(opt) {
    // 获取devName和status
    let devName = uni.getStorageSync("devName");
    let status = uni.getStorageSync("status");

    this.userModel = uni.getStorageSync("userModel");
    // 设置在线状态
    this.online = status == "1" ? true : false;
    this.queryParams.devName = devName;
    this.getList();
  },
  onShow() {
    // var timer = setTimeout(() => {
    // 	this.getList()
    // 	clearTimeout(timer)
    // }, 500);
    // 初始化防抖函数
    this.reqDebounce = debounce(this.getSearchList, 500);
  },
  onPullDownRefresh() {
    this.reload = true;
    this.getList();
  },
  onReachBottom() {
    if (!this.loadAll) {
      this.status = "more";
      this.getList();
    }
  },
  methods: {
    /** 查询设备列表 */
    getList() {
      if (this.listData.length > 0) {
        this.queryParams.pageNum += 10;
      }
      listUpgrade(this.queryParams).then((response) => {
        console.log(response);
        let list = response.rows;
        // 将online状态传递给list
        list.forEach((e) => {
          e.online = this.online;
          e.statusText = this.online ? "在线" : "离线";
        });
        if (this.queryParams.pageNum <= response.total) {
          this.listData = this.reload ? list : this.listData.concat(list);
          this.status = "more";
        } else {
          if (this.listData.length <= 0) {
            this.listData = list;
          }
          this.status = "noMore";
          this.loadAll = true;
        }
        this.reload = false;
      });
    },
    setTime: function (items) {
      var newItems = [];
      items.forEach((e) => {
        newItems.push({
          author_name: e.author_name,
          cover: e.cover,
          id: e.id,
          post_id: e.post_id,
          published_at: dateUtils.format(e.published_at),
          title: e.title,
        });
      });
      return newItems;
    },
    aderror(e) {
      console.log("aderror: " + JSON.stringify(e.detail));
    },

    showInput() {
      this.inputShowed = true;
    },
    hideInput() {
      this.inputVal = "";
      this.inputShowed = false;
    },
    clearInput() {
      this.inputVal = "";
      this.searchList = [];
    },
    inputTyping(e) {
      console.log(e);
      // 根据搜索值到数据库去匹配devMsg，将匹配到的结果循环显示到搜索文本上提供选择
      var ip = e.detail.value;
      this.reqDebounce({
        ip: ip,
      }); // 防止抖动
    },
    // 请求信息列表
    getSearchList(data) {
      listUpgrade(data).then((res) => {
        console.log(res);
        this.searchList = res.rows;
      });
    },

    // 事件处理： 搜索项点击
    chooseRes(e) {
      console.log(e);
      var ip = e.currentTarget.dataset.ip;
      // 随后，将该value传入，getList
      this.queryParams.ip = ip;
      this.reload = true;
      this.getList();
      this.inputVal = "";
      this.inputShowed = false;
    },
    btnDo(code, item) {
      if (this.checkMonitor()) return;
      uni.setStorageSync("curDev", item.devName);
      const type = code === "upgrade" ? "up" : "lan";
      listVersion({
        devModel: item.devModel,
        type: type,
      }).then((res) => {
        if (res.rows.length > 0) {
          this.versionObjList = res.rows.map((it, idx) => {
            it.devName = item.devName;
            it.ip = item.ip;
            it.id = item.id;
            return it;
          });
          this.versionList = res.rows.map((it, idx) => {
            return it.version;
          });
          // 先设置upParam为第一个
          this.upParam = this.versionObjList[0];
        }
        this.$refs.pb1.open();
      });
    },
    bindPickerChange1(e) {
      let index = e.detail.value;
      console.log(index);
      let param = this.versionObjList[index];
      console.log(param);
      this.upParam = param;
    },
    bindPickerChange2(e) {
      let index = e.detail.value;
      let param = this.languageObjList[index];
      this.lanParam = param;
    },
    confirmUp() {
      console.log(this.upParam);
      // 检测设备是否在线
      checkDevStatus({
        devName: this.upParam.devName,
      }).then((res) => {
        console.log(res);
        if (res.msg != 200) {
          uni.showToast({
            title: "当前设备" + res.msg,
            icon: "none",
            showCancel: false,
          });
          return;
        }
        // 下发软件升级指令
        uni.showLoading({
          title: "更新包下发中",
        });
        upgradeToNew(this.upParam).then((res) => {
          console.log(res);
          uni.hideLoading();
          if (res.code == 200) {
            uni.showModal({
              content: "更新包下发成功",
              showCancel: false,
            });
            // 下发成功后刷新页面
            this.getList();
          }
        });
      });
    },
    confirmLan() {
      checkDevStatus({
        devName: this.upParam.devName,
        userModel: this.userModel,
      }).then((res) => {
        if (res.rows.length > 0 && res.rows[0].status == 0) {
          uni.showToast({
            title: "当前设备处于离线状态",
            icon: "none",
            showCancel: false,
          });
          return;
        }
        // 下发语言更新指令
        uni.showLoading({
          title: "更新包下发中",
        });
        console.log(this.lanParam);
        upgradeLanguage(this.lanParam).then((res) => {
          console.log(res);
          uni.hideLoading();
          if (res.code == 200) {
            uni.showModal({
              content: "语言包下发成功",
              showCancel: false,
            });
          }
        });
      });
    },
    // 检查是否是监控模式，监控模式下不可操作
    checkMonitor() {
      console.log(this.userModel);
      if (this.userModel != 2) {
        uni.showToast({
          title: "监控模式下不可操作",
          icon: "none",
          showCancel: false,
        });
        return true;
      }
      return false;
    },
  },
};
</script>

<style>
.page {
  background-color: #ffffff;
}

.page__bd {
  padding-bottom: 20rpx;
  /* height: 10%; */
}

.page-wrapper {
  margin: 0;
  font-size: 28rpx;
  line-height: 1.5;
  color: #333;
  background-color: #efefef;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  -webkit-tap-highlight-color: transparent;
  min-height: 2000rpx;
}

.bus-list .bus-list-item {
  position: relative;
  height: 260rpx;
  width: 700rpx;
  background-color: #fff;
  margin: 16rpx 0;
  border: 2rpx solid #e5e5e5;
  border-width: 2rpx 0;
}

.bus-list .bus-list-item::before,
.bus-list .bus-list-item::after {
  position: absolute;
  left: 122rpx;
  content: "";
  width: 24rpx;
  height: 12rpx;
}

.bus-list .bus-list-item::before {
  border-radius: 0 0 60rpx 60rpx;
  border-top: none;
  top: -2rpx;
}

.bus-list .bus-list-item::after {
  border-radius: 60rpx 60rpx 0 0;
  border-bottom: none;
  bottom: -2rpx;
}

.bus-list .bus-list-item .dev-msg {
  position: absolute;
  left: 0;
  margin: 10rpx 0;
  color: #005cb3;
  text-align: left;
  font-size: 30rpx;
  font-family: Arial;
}

.bus-list .bus-list-item .btns {
  /* background-color: #1890ff; */
  position: absolute;
  right: 0;
  width: 210rpx;
  height: 190rpx;
  line-height: 190rpx;
  text-align: center;
  vertical-align: center;
  color: #1890ff;
  font-size: 30rpx;
}

._btn {
  margin-top: 64rpx;
  width: 190rpx;
  height: 40rpx;
  line-height: 40rpx;
  border: #1890ff solid 1rpx;
  border-radius: 5%;
}

._btn + ._btn {
  margin-top: 46rpx;
}

.bus-list .bus-list-item.disabled .btns {
  background-color: #c5c5c5;
}

._label {
  color: #005cb3;
}
</style>
