<template>
  <view>
    <uni-forms v-if="pvList && pvList.length > 0" label-position="left" labelAlign="center" labelWidth="375upx">
      <uni-forms-item style="margin-right: 10px" v-for="(it, idx) in pvList" :key="idx" :name="it.paramName" :label="it.version">
        <!-- <uni-easyinput disabled class="inputCss" type="text" v-model="it.status" />
				 -->
        <switch disabled @change="changeStatus" :checked="cpStatus(it.status)"></switch>
      </uni-forms-item>
    </uni-forms>
    <!-- 暂无数据页面 -->
    <view class="noData" v-if="!pvList || pvList.length == 0">
      <text>暂无数据</text>
    </view>
  </view>
</template>

<script>
import { getMkParam } from "@/api/device/paramValue";
export default {
  data() {
    return {
      param: 0,
      devName: null,
      queryParams: {
        devName: null,
        paramSubType: 1,
        pageNum: 1,
        pageSize: 50,
      },
      pvList: [],
      updIdMap: {},
      preData: {},
    };
  },
  onLoad(opt) {
    console.log(opt);
    let param = opt.param;
    let devName = opt.devName;
    // 获取模块状态参数
    getMkParam({
      param: param,
      devId: uni.getStorageSync("devId"),
    }).then((res) => {
      console.log(res);
      this.pvList = res.data.map((it, idx) => {
        if (it.paramValue !== null) {
          it.version = it.paramValue.split("|")[0];
          it.status = it.paramValue.split("|")[1];
        }
        return it;
      });
    });
  },
  methods: {
    cpStatus(status) {
      return status == 1;
    },
    changeStatus(e) {
      console.log("changeStatus");
    },
  },
};
</script>

<style>
.btn-wrapper {
  display: flex;
  align-items: center;
  /* align: center; */
  height: 80upx;
  margin: 20upx 0 20upx 60upx;
}

.btn-wrapper-button {
  width: 180upx;
  line-height: 80upx;
  height: 80upx;
}

.noData {
  display: flex;
  align-items: center;
}
</style>
