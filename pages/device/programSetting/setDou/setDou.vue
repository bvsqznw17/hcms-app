<template>
  <view>
    <!-- 按钮菜单模板 -->
    <view class="uni-padding-wrap uni-common-mt">
      <view class="uni-btn-v">
        <navigator v-for="(it,idx) in menuList" :key="idx" :url="'/pages/device/programSetting/setDou/setDouParam?param=' +it.param + '&devName=' + devName + '&selectedDou=' + selectedDou" hover-class="navigator-hover">
          <button type="default">{{it.text}}</button>
        </navigator>
      </view>
    </view>
  </view>
</template>

<script>
import { getDouParam } from "@/api/device/paramValue.js";
export default {
  data() {
    return {
      menuList: [
        {
          text: "指定1",
          param: "0",
        },
        {
          text: "指定2",
          param: "1",
        },
        {
          text: "指定3",
          param: "2",
        },
        {
          text: "指定4",
          param: "3",
        },
        {
          text: "指定5",
          param: "4",
        },
        {
          text: "指定6",
          param: "5",
        },
        {
          text: "指定7",
          param: "6",
        },
      ],
      devName: null,
      selectedDou: 0, // 已经选中的斗
    };
  },
  onLoad(opt) {
    console.log(opt);
    this.devName = opt.devName;
    let param = opt.param;
    // 计算已经选中的斗
    // 1. 获取当前设备的所有斗参数
    let douParamList = [];
    let dplen = 0;
    for (let i = 0; i < 7; i++) {
      getDouParam({
        devId: uni.getStorageSync("devId"),
        param: i,
      }).then((res) => {
        if (res.data.setDou.paramValue != 0) {
          douParamList.push(parseInt(res.data.setDou.paramValue));
          dplen++;
        }
        // 2. 计算已经选中的斗，基于位运算，将所有的斗参数作|运算
        if (dplen != douParamList.length) {
          return;
        }
        let selectedDou = 0;
        for (let i = 0; i < douParamList.length; i++) {
          selectedDou = selectedDou | douParamList[i];
        }
        this.selectedDou = selectedDou;
        console.log(this.selectedDou);
      });
    }
  },
  onShow() {
    console.log("onShow");
    this.selectedDou = uni.getStorageSync("selectedDou");
    console.log(this.selectedDou);
  },
  methods: {},
};
</script>

<style>
</style>
