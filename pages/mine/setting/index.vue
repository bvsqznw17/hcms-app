<template>
  <view class="setting-container" :style="{height: `${windowHeight}px`}">
    <view class="menu-list">
      <view class="list-cell list-cell-arrow" @click="handleToPwd">
        <view class="menu-item-box">
          <view class="iconfont icon-password menu-icon"></view>
          <view>修改密码</view>
        </view>
      </view>
      <view class="list-cell list-cell-arrow" @click="handleToUpgrade">
        <view class="menu-item-box">
          <view class="iconfont icon-refresh menu-icon"></view>
          <view>检查更新</view>
        </view>
      </view>
      <view class="list-cell list-cell-arrow" @click="handleCleanTmp">
        <view class="menu-item-box">
          <view class="iconfont icon-clean menu-icon"></view>
          <view>清理缓存</view>
        </view>
      </view>
    </view>
    <view class="cu-list menu">
      <view class="cu-item item-box">
        <view class="content text-center" @click="handleLogout">
          <text class="text-black">退出登录</text>
        </view>
      </view>
    </view>
    <simple-process :show="showProgress" :message="processMsg" :progress="progress"></simple-process>
  </view>
</template>

<script>
import simpleProcess from "../../../components/simpleProgress/simpleProgress";
export default {
  components: {
    simpleProcess,
  },
  data() {
    return {
      windowHeight: uni.getSystemInfoSync().windowHeight,
      version: 99,
      progress: 0,
      showProgress: false,
      processMsg: "",
    };
  },
  onLoad() {
    console.log("onlaunch");
    plus.runtime.getProperty(plus.runtime.appid, (res) => {
      console.log("当前版本");
      console.log(res);
      // this.version = 101;
      this.version = res.versionCode;
    });
  },
  methods: {
    handleToPwd() {
      this.$tab.navigateTo("/pages/mine/pwd/index");
    },
    handleToUpgrade() {
      var that = this;
      uni.request({
        url: "http://121.199.30.10:19000/appStoreFile/version.json",
        data: {},
        header: {},
        method: "GET",
        success: (res) => {
          console.log(res);
          if (res.data.code === 0) {
            if (res.data.version > this.version) {
              // 提示有新版本让用户确认是否进行更新
              uni.showModal({
                title: "有新版本可以更新",
                content:
                  "当前版本:" +
                  that.fmtVersion(this.version) +
                  "\n最新版本:" +
                  that.fmtVersion(res.data.version),
                showCancel: true,
                success: (resp) => {
                  if (resp.confirm) {
                    // 进行更新
                    let dtask = that.createDtask(res.data.url);
                    that.startDownload(dtask);
                  }
                },
              });
            } else {
              uni.showToast({
                title: "当前已是最新版本",
                duration: 1500,
              });
            }
          }
        },
      });
    },
    handleCleanTmp() {
      this.$modal.showToast("模块建设中~");
    },
    handleLogout() {
      this.$modal.confirm("确定注销并退出系统吗？").then(() => {
        this.$store.dispatch("LogOut").then(() => {
          this.$tab.reLaunch("/pages/work/index");
        });
      });
    },
    updateProgress(percent) {
      if (percent < 0) {
        percent = 0;
      } else if (percent > 100) {
        percent = 100;
      }
      this.progress = percent;
      this.processMsg = "已下载" + percent + "%";
    },
    // 创建dtask
    createDtask(url) {
      var dtask = plus.downloader.createDownload(
        url,
        {
          force: true,
        },
        function (d, status) {
          console.log(status);
          // 下载完成
          if (status == 200) {
            console.log("下载完成");
            uni.showModal({
              title: "下载完成，即将安装",
              showCancel: false,
              success: () => {
                // 由于install只能安装本地的地址，所以先把下载的地址在本地找到，再调用install
                plus.runtime.install(
                  plus.io.convertLocalFileSystemURL(d.filename),
                  {},
                  function () {
                    console.log("success");
                    plus.runtime.restart(); // 安装成功后重启
                  },
                  function (error) {
                    console.log(error.message);
                    uni.showToast({
                      title: "安装失败",
                      duration: 1500,
                    });
                  }
                );
              },
            });
          } else {
            uni.showToast({
              title: "更新失败",
              duration: 1500,
            });
          }
        }
      );
      return dtask;
    },
    startDownload(dtask) {
      var that = this;
      that.showProgress = true;
      dtask.start();
      dtask.addEventListener("statechanged", function (download, status) {
        switch (download.state) {
          case 1:
            console.log("开始下载");
            break;
          case 2:
            console.log("连接到服务器");
            break;
          case 3:
            // console.log("已接收到数据");
            var percent = parseInt(
              (download.downloadedSize / download.totalSize) * 100
            );
            that.updateProgress(percent);
            break;
          case 4:
            console.log("下载完成");
            that.updateProgress(100);
            that.showProgress = false;
            // uni.showToast({
            //   title: "下载成功",
            //   icon: "success",
            //   duration: 2000,
            // });
            break;
        }
      });
    },
    // 格式化version，version一般是数字，例：101,1010；需要转换为1.0.1和1.0.10
    fmtVersion(version) {
      version = version.toString();
      // 算法：101或者1110转换为1.0.1和1.0.10
      var arr = version.split("");
      arr[0] = parseInt(arr[0]);
      arr[1] = parseInt(arr[1]);
      arr[2] = parseInt(arr[2]);
      return arr.join(".");
    },
  },
};
</script>

<style lang="scss" scoped>
.page {
  background-color: #f8f8f8;
}

.item-box {
  background-color: #ffffff;
  margin: 30rpx;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 10rpx;
  border-radius: 8rpx;
  color: #303133;
  font-size: 32rpx;
}
</style>
