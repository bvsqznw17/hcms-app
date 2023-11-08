<template>
  <view>
    <uni-forms v-if="pvList && pvList.length > 0" label-position="left" labelAlign="center" labelWidth="375upx">
      <uni-forms-item style="margin-right: 10px;" v-for="(it,idx) in pvList" :key="idx" :name="it.paramName" :label="it.paramName">
        <uni-easyinput class="inputCss" type="text" v-model="it.paramValue" @change="changeInput(it)" />
      </uni-forms-item>
    </uni-forms>
    <!-- 暂无数据页面 -->
    <view class="noData" v-if="!pvList || pvList.length == 0">
      <text>暂无数据</text>
    </view>
    <!-- // 保存按钮 -->
    <view class="btn-wrapper">
      <button class="btn-wrapper-button" plain type="primary" @click="saveData()" :disabled="userModel == 1">保存</button>
    </view>
  </view>
</template>

<script>
import { listForParam, updateParamValue } from "@/api/device/paramValue.js";
import { deepCopy, formatNumber } from "@/utils/util.js";
import { checkDevStatus } from "@/api/device/business.js";
export default {
  data() {
    return {
      queryParams: {
        devName: null,
        paramSubType: 1,
      },
      pvList: [],
      updIdMap: {},
      preData: {},
      userModel: 1,
    };
  },
  onLoad(opt) {
    this.userModel = uni.getStorageSync("userModel");
    this.queryParams.devName = opt.devName;
    this.queryParams.paramSubType = opt.param;
    this.getList();
  },
  methods: {
    getList() {
      listForParam(this.queryParams).then((res) => {
        console.log(res);
        this.pvList = res.data;
        this.preData = deepCopy(this.pvList);
      });
    },
    // input修改事件
    changeInput(it) {
      // 校验修改的值是否超出范围并提示
      console.log(it);
      console.log(this.preData);
      console.log(this.pvList);
      if (it.paramName.indexOf(this.strValidParamName) == -1) {
        let min = it.minV;
        let max = it.maxV;
        let pv = parseInt(it.paramValue);
        if ((pv != 0 && !pv) || pv > +max || pv < +min) {
          uni.showToast({
            title: it.paramName + "取值范围在" + min + "~" + max,
            icon: "none",
            duration: 3000,
          });
          // 将修改的值改回原来的值
          this.preData.map((item, index) => {
            if (item.paramName == it.paramName) {
              it.paramValue = item.paramValue;
            }
          });
          this.pvList = this.pvList.map((item, index) => {
            if (item.paramName == it.paramName) {
              item.paramValue = it.paramValue;
            }
            return item;
          });
        } else {
          // 将修改后的值做格式化处理，保留小数点后几位，按照decimalNum
          it.paramValue = (+it.paramValue).toFixed(it.decimalNum);
          this.updIdMap[it.regAddr] = it.regAddr;
          this.preData = deepCopy(this.pvList);
        }
      }
    },
    // 保存页面数据
    saveData(data) {
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
        uni.setStorageSync("curDev", this.queryParams.devName);
        let tabData = data || this.pvList;
        // 遍历tabData，判断是否在updIdMap中，在就修改
        let keys = Object.keys(this.updIdMap);
        let len = keys.length;
        let num = 0;
        tabData.map((it, idx) => {
          if (it.regAddr in this.updIdMap) {
            // 对小数点反格式化后再进行存储
            if (it.paramName.indexOf(this.strValidParamName) == -1) {
              it.paramValue = this.trimPoint(it.paramValue);
            }

            updateParamValue(it).then((res) => {
              num++;
              console.log(res);
              // 之后再格式化作为显示
              it.paramValue = (
                it.paramValue / Math.pow(10, it.decimalNum)
              ).toFixed(it.decimalNum);
              if (num == len) {
                this.updIdMap = {};
                uni.showModal({
                  content: "保存成功",
                  showCancel: false,
                });
              }
            });
          }
        });
      });
    },
    // 过滤小数点转为整数
    trimPoint(v) {
      return parseInt(String(v).replace(".", "")) | v;
    },
  },
};
</script>

<style>
.btn-wrapper {
  display: flex;
  align-items: center;
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
