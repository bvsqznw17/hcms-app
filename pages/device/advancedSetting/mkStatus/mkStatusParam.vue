<template>
  <view>
    <!-- 使用 uni-table 来展示数据 -->
    <uni-table
      v-if="pvList && pvList.length > 0"
      border
      stripe
      emptyText="暂无更多数据"
    >
      <!-- 表头行 -->
      <uni-tr>
        <uni-th align="center" width="50">编号</uni-th>
        <uni-th align="center">版本</uni-th>
        <uni-th align="center">状态</uni-th>
      </uni-tr>
      <!-- 表格数据行 -->
      <uni-tr v-for="(it, idx) in pvList" :key="idx">
        <uni-td align="center">{{ idx + 1 }}</uni-td>
        <uni-td>{{ it.version }}</uni-td>
        <uni-td>
          <switch
            disabled
            @change="changeStatus"
            :checked="cpStatus(it.status)"
          ></switch>
        </uni-td>
      </uni-tr>
    </uni-table>

    <!-- 暂无数据页面 -->
    <view class="noData" v-if="!pvList || pvList.length === 0">
      <text>暂无数据</text>
    </view>
  </view>
</template>

<script>
// ... 你的脚本内容
</script>

<style>
/* ... 你的样式内容 */
</style>

<script>
import { getMkParam } from "@/api/device/paramValue";
export default {
  data() {
    return {
      param: 0,
      queryParams: {
        devId: null,
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
    let isFJ = opt.isFJ;
    // 获取模块状态参数
    getMkParam({
      param: param,
      devId: uni.getStorageSync("devId"),
    }).then((res) => {
      console.log(res);

      let pvList = res.data.map((it, idx) => {
        if (it.paramValue !== null) {
          it.version = it.paramValue.split("|")[0];
          it.status = it.paramValue.split("|")[1];
        }
        return it;
      });
      // 附加处理逻辑，用于分离 分立板和分立板-集料斗的数据
      if (param != "1") {
        this.pvList = pvList;
      } else {
        this.dealFLB(pvList, isFJ);
      }
    });
  },
  methods: {
    cpStatus(status) {
      return status == 1;
    },
    changeStatus(e) {
      console.log("changeStatus");
    },
    dealFLB(pvList, isFJ) {
      if (pvList.length > 14) {
        if (isFJ == "undefined") {
          this.pvList = pvList.slice(0, 14);
        } else {
          this.pvList = pvList.slice(14, pvList.length);
        }
      } else {
        this.pvList = pvList;
      }
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
