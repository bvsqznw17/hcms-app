<template>
  <view>
    <uni-forms
      v-if="pvList && pvList.length > 0"
      label-position="left"
      labelAlign="center"
      labelWidth="375upx"
    >
      <uni-forms-item
        style="margin-right: 10px"
        v-for="(it, idx) in pvList"
        :key="idx"
        :name="it.paramName"
        :label="it.paramName"
      >
        <uni-easyinput
          class="inputCss"
          type="text"
          v-model="it.paramValue"
          @change="changeInput(it)"
        />
      </uni-forms-item>
    </uni-forms>
    <!-- 暂无数据页面 -->
    <view class="noData" v-if="!pvList || pvList.length == 0">
      <text>暂无数据</text>
    </view>
    <!-- // 保存按钮 -->
    <view class="btn-wrapper">
      <button
        class="btn-wrapper-button"
        plain
        type="primary"
        @click="saveData()"
        :disabled="userModel == 1"
      >
        保存
      </button>
    </view>
  </view>
</template>

<script>
import { listForParam, setPlzyParam } from "@/api/device/paramValue.js";
import { deepCopy } from "@/utils/util.js";
import { checkDevStatus } from "@/api/device/business.js";
export default {
  data() {
    return {
      queryParams: {
        devId: null,
        paramType: 1,
        paramSubType: 10,
      },
      pvList: [],
      updIdMap: {},
      preData: {},
      userModel: 1,
    };
  },
  onLoad(opt) {
    this.userModel = uni.getStorageSync("userModel");
    console.log(opt);
    this.queryParams.devId = uni.getStorageSync("devId");
    this.getList();
  },
  methods: {
    getList() {
      listForParam(this.queryParams).then((res) => {
        console.log(res);
        // 首先将res.data根据regAddr进行排序，小地址在前
        res.data = res.data.sort((a, b) => {
          return a.regAddr - b.regAddr;
        });
        this.pvList = [];
        let mainPl = null;
        let mainZy = null;
        // 通常共有32个参数，16个为频率，16个为增益
        // 取第15个为主振频率，取第31个为主振增益
        // 第16个抛弃，第32个抛弃
        res.data.map((it, idx) => {
          if (idx == 14) {
            it.paramName = "主振频率";
            mainPl = it;
          } else if (idx == 30) {
            it.paramName = "主振增益";
            mainZy = it;
          } else if (idx != 14 && idx != 30 && idx != 15 && idx != 31) {
            this.pvList.push(it);
          }
        });
        this.pvList.unshift(mainZy);
        this.pvList.unshift(mainPl);

        console.log(this.pvList);
        this.preData = deepCopy(this.pvList);
      });
    },
    // input聚焦事件
    // focusInput(id) {
    // 	// 监听到修改之后将参数加入到待修改列表
    // 	this.updIdMap[id] = id
    // },
    // input修改事件
    changeInput(it) {
      // 校验修改的值是否超出范围并提示
      console.log(it);
      console.log(this.preData);
      console.log(this.pvList);
      if (it.paramName.indexOf(this.strValidParamName) == -1) {
        let min = (it.minV / Math.pow(10, it.decimalNum)).toFixed(
          it.decimalNum
        );
        let max = (it.maxV / Math.pow(10, it.decimalNum)).toFixed(
          it.decimalNum
        );
        let pv = parseInt(it.paramValue);
        if ((pv != 0 && !pv) || pv > max || pv < min) {
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
          // 可修改之后将参数加入到待修改列表
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
          console.log(res);
          uni.showToast({
            title: "当前设备" + res.msg,
            icon: "none",
            showCancel: false,
          });
          return;
        }

        let tabData = data || this.pvList;
        // 遍历tabData，判断是否在updIdMap中，在就修改
        let keys = Object.keys(this.updIdMap);
        console.log(keys);
        let len = keys.length;
        let num = 0;
        tabData.map((it, idx) => {
          if (it.regAddr in this.updIdMap) {
            // 对小数点反格式化后再进行存储
            it.paramValue = this.trimPoint(it.paramValue);
            // 将主振频率和主振增益的name改回原来的
            if (it.paramName == "主振频率") {
              it.paramName = "单个振机频率15";
            } else if (it.paramName == "主振增益") {
              it.paramName = "单个振机增益15";
            }
            it.devId = uni.getStorageSync("devId");
            setPlzyParam(it).then((res) => {
              num++;
              console.log(res);
              // 之后再格式化作为显示
              it.paramValue = (
                it.paramValue / Math.pow(10, it.decimalNum)
              ).toFixed(it.decimalNum);
              // 将主振频率和主振增益的name改回原来的
              if (it.paramName == "单个振机频率15") {
                it.paramName = "主振频率";
              } else if (it.paramName == "单个振机增益15") {
                it.paramName = "主振增益";
              }
              if (num == len) {
                console.log("clear");
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
