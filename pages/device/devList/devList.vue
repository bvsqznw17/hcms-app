<template>
  <view class="uni-container">
    <!-- 搜索框 -->
    <view>
      <view :class="['weui-search-bar', inputShowed ? 'weui-search-bar_focusing' : '']" id="searchBar">
        <form class="weui-search-bar__form">
          <view class="weui-search-bar__box">
            <i class="weui-icon-search"></i>
            <input type="text" id="searchInput" class="weui-search-bar__input" placeholder="请输入设备名称" v-model="inputVal" :focus="inputShowed" @input="inputTyping" />
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
            <view @click="chooseRes" :data-devName="item.devName" class="weui-cell__bd weui-cell_primary">
              <view>{{ item.devName }}</view>
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
                  <text style="">{{ item.devName }}</text>
                </view>
                <view>
                  <text class="_label">机器类型：</text>
                  <text style="">{{ item.devModel }}</text>
                </view>
                <view>
                  <text class="_label">IPv4地址：</text>
                  <text style="">{{ item.ip }}</text>
                </view>
                <view>
                  <text class="_label">通信状态：</text>
                  <text :style="{ color: item.status == 0 ? '#e54d42' : '#13ce66' }">{{
                    item.statusText
                  }}</text>
                </view>
                <view>
                  <text class="_label">目标重量：</text>
                  <text style="">{{ item.目标重量 || "--" }}</text>
                </view>
                <view>
                  <text class="_label">设定速度：</text>
                  <text style="">{{ item.设定速度 || "--" }}</text>
                </view>
                <view>
                  <text class="_label">实际速度：</text>
                  <text style="">{{ item.平均速度 || "--" }}</text>
                </view>
                <!-- 								<view>
									<text class="_label">健康状态：</text>
									<text style="">{{item.健康状态 || '--'}}</text>
								</view> -->
                <!-- 								<view>
									<text class="_label">料位状态：</text>
									<text style="">{{item.料位状态 || '--'}}</text>
								</view> -->
                <view>
                  <text class="_label">更新时间：</text>
                  <text>{{ item.dtUpdate }}</text>
                </view>
              </view>
              <!-- 右侧 -->
              <view :id="index" :data-ip="item.ip" class="btns">
                <view class="_btn" @click="switchMode('monitoring', item)">监控模式</view>
                <view class="_btn" @click="switchMode('operation', item)">操作模式</view>
              </view>
            </view>
          </view>
        </view>
      </block>
    </view>
    <!-- 连接码验证弹窗 -->
    <uni-popup ref="popup" type="dialog">
      <uni-popup-dialog mode="input" title="连接码验证" placeholder="请输入连接码" @confirm="dialogConfirm"></uni-popup-dialog>
    </uni-popup>
    <uni-load-more :status="status" :icon-size="16" :content-text="contentText" />
  </view>
</template>

<script>
import { dateUtils, debounce } from "../../../utils/util.js";
import { listDevMsgEx } from "@/api/device/devMsg.js";
import { listSettings } from "@/api/device/sysSettings.js";
import { verifyCcode, updDevCcode } from "@/api/device/devCcode.js";
import { checkDevStatus } from "@/api/device/business.js";

export default {
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
        status: null,
      },
      searchList: [], // 搜索栏的选项列表
      inputShowed: false,
      inputVal: "",
      // 是否加载完毕
      loadAll: false,
      isMonitoringMode: true,
      isOperationMode: false,
      devId: null,
    };
  },
  onLoad() {
    this.getList();
  },
  onShow() {
    // 初始化防抖函数
    this.reqDebounce = debounce(this.getSearchList, 500);
  },
  onPullDownRefresh() {
    console.log("下拉刷新");
    this.reload = true;
    this.getList();
  },
  onReachBottom() {
    console.log("到达底部");
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
      console.log(this.queryParams);
      listDevMsgEx(this.queryParams).then((response) => {
        console.log(response);
        let list = response.rows.map((it, idx) => {
          // 根据status添加status文字作为显示
          if (it.status == 1) {
            it.statusText = "在线";
          } else {
            it.statusText = "离线";
          }
          //
          for (let key in it.params) {
            it[key] = it.params[key];
          }
          return it;
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
        console.log(list);
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
      var devName = e.detail.value;
      this.reqDebounce({
        devName: devName,
      }); // 防止抖动
    },
    // 请求信息列表
    getSearchList(data) {
      listDevMsgEx(data).then((res) => {
        console.log(res);
        this.searchList = res.rows;
      });
    },
    // 事件处理： 搜索项点击
    chooseRes(e) {
      console.log("see", e);
      const devName = e.currentTarget.dataset.devname;
      // 随后，将该value传入，getList
      console.log(devName);
      this.queryParams.devName = devName;
      this.reload = true;
      this.getList();
      this.inputVal = "";
      this.inputShowed = false;
    },
    // 获取设备参数并设置到缓存中
    getDevParams(item) {
      // 获取设备的系统参数
      listSettings({
        devName: item.devName,
      }).then((res) => {
        console.log("系统参数", res);
        if (res.rows.length > 0) {
          // 将res.rows进行处理，并设置到缓存中，规则是：遍历res.rows，将每个参数设置到缓存中
          res.rows.forEach((it) => {
            uni.setStorageSync(it.paramKey, it.paramValue);
          });
        }
      });
    },
    // 选择模式
    switchMode(mode, item) {
      if (mode == "monitoring") {
        this.isMonitoringMode = true;
        this.isOperationMode = false;
        uni.setStorageSync("userModel", 1);
      } else {
        this.isMonitoringMode = false;
        this.isOperationMode = true;
        uni.setStorageSync("userModel", 2);
      }
      // 检测设备是否在线
      checkDevStatus({
        devId: uni.getStorageSync("devId"),
      }).then((res) => {
        console.log(res);
        if (res.msg != 200) {
          if (mode != "monitoring") {
            uni.showToast({
              title: "设备离线，请切换至监控模式",
            });
            return false;
          }
        }
        this.switchModeLogic(item);
      });
    },
    // 选择模式之后的逻辑
    switchModeLogic(item) {
      this.devId = item.id;
      // 在点击跳转到页面之前，先获取设备的相关参数并设置到缓存中
      this.getDevParams(item);
      uni.setStorageSync("devId", item.id);
      uni.setStorageSync("devIp", item.ip);
      uni.setStorageSync("devName", item.devName);
      uni.setStorageSync("status", item.status);
      // 连接码验证
      this.verifyCcode(item);
    },
    // 跳转到主控界面
    skipToMain() {
      this.$tab.navigateTo("/pages/device/devMain/devMain");
    },
    // 验证连接码
    verifyCcode(item) {
      verifyCcode({
        devId: this.devId,
      }).then((res) => {
        console.log(res);
        if (res.data == 1) {
          this.skipToMain();
        } else {
          this.openPopup();
        }
      });
    },
    // 打开连接码验证弹窗
    openPopup() {
      this.$refs.popup.open();
    },
    // 连接码确认按钮点击
    dialogConfirm(e) {
      verifyCcode({
        devId: this.devId,
        ccode: e,
      }).then((res) => {
        console.log(res);
        if (res.data == 1) {
          uni.showToast({
            title: "验证成功",
          });
          this.skipToMain();
        } else {
          uni
            .showToast({
              title: "连接码错误",
            })
            .then(() => {
              this.openPopup();
            });
        }
      });
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
  height: 400rpx;
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
  margin-top: 120rpx;
  width: 190rpx;
  height: 40rpx;
  line-height: 40rpx;
  border: #1890ff solid 1rpx;
  border-radius: 5%;
}

._btn + ._btn {
  margin-top: 69rpx;
}

.bus-list .bus-list-item.disabled .btns {
  background-color: #c5c5c5;
}

._label {
  color: #005cb3;
}

.mode-switch {
  display: flex;
  justify-content: center;
}

.mode-switch-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  font-size: 14px;
  text-align: center;
  padding: 0 12px;
  color: white;
  background-color: #eee;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}

.mode-switch-item.active {
  background-color: #4caf50;
}
</style>
