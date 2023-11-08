<template>
  <view>
    <uni-forms v-if="pvList && pvList.length > 0" label-position="left" labelAlign="center" labelWidth="375upx">
      <template v-for="(it, idx) in pvList">
        <uni-forms-item style="margin-right: 10px" :key="'picker-' + idx" :name="it.paramName" :label="it.paramName" v-if="it.pbList != undefined">
          <picker @change="bindPickerChange(it, $event)" :value="pbIndexs[it.paramKey]" :ref="'pb' + idx" :range="it.pbList" :disabled="it.disabled">
            <uni-easyinput type="text" v-model="it.pbList[pbIndexs[it.paramKey]]" :clearable="false" :disabled="it.disabled"></uni-easyinput>
          </picker>
        </uni-forms-item>
        <uni-forms-item style="margin-right: 10px" :key="'input-' + idx" :name="it.paramName" :label="it.paramName" v-else>
          <uni-easyinput class="inputCss" type="text" v-model="it.paramValue" :disabled="it.disabled" @change="changeInput(it)" />
        </uni-forms-item>
      </template>
    </uni-forms>
    <!-- 暂无数据页面 -->
    <view class="noData" v-if="!pvList || pvList.length == 0">
      <text>暂无数据</text>
    </view>
    <!-- // 保存按钮 -->
    <view class="btn-wrapper">
      <button class="btn-wrapper-button" plain type="primary" @click="saveData()" :disabled="userModel == 1">
        保存
      </button>
    </view>
  </view>
</template>

<script>
import { listForParam, updateParamValue } from "@/api/device/paramValue.js";
import { deepCopy, formatNumber } from "@/utils/util.js";
import { checkDevStatus } from "@/api/device/business.js";
import { listSettings } from "@/api/device/sysSettings.js";
export default {
  data() {
    return {
      queryParams: {
        devName: null,
        paramSubType: 1,
        pageNum: 1,
        pageSize: 50,
      },
      pvList: [],
      updIdMap: {},
      strValidParamName: ["产品名称"],
      preData: {},
      userModel: 1,
      pbMap: {
        prm_WorP: ["重量-重量", "重量-包数", "包数-包数", "包数-皮重"],
      },
      disableKeyList: ["prm_DWW_UpLimit", "prm_DWW_DownLimit", "prm_P2Cnt"],
      pbIndexs: {
        prm_WorP: 0,
      },
      // 需要根据包数-包数的值来设置decimalNum的参数列表
      ndDecimalList: [
        "prm_SetWeight",
        "prm_SetWeight1",
        "prm_SetWeight2",
        "prm_PCL",
      ],
      baseDecimalNum: 0,
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
        let pvList = res.data;
        console.log(pvList);
        this.preData = deepCopy(pvList);
        this.getRuleList(pvList);
      });
    },
    getRuleList(pvList) {
      let pbKeyList = Object.keys(this.pbIndexs);

      listSettings(this.queryParams).then((res) => {
        // 计算规则：当it.paramKey=='sys_RunMode'且it.paramValue>0时，设置item.maxV=160
        // 首先遍历res.rows，找到it.paramKey=='sys_RunMode'且it.paramValue>0的数据
        let isSetMaxV = false;
        res.rows.map((it, idx) => {
          if (it.paramKey == "sys_RunMode" && it.paramValue > 0) {
            isSetMaxV = true;
          }
          // 设置基础decimalNum
          if (it.paramKey == "sys_dot_num") {
            this.baseDecimalNum = it.paramValue;
          }
        });
        pvList.map((item, index) => {
          if (pbKeyList.indexOf(item.paramKey) != -1) {
            item.pbList = this.pbMap[item.paramKey];
          }
          if (isSetMaxV && item.paramKey == "prm_speed") {
            item.maxV = 160;
          }
        });
        this.pvList = pvList;
        this.caculateAllRule();
        console.log(this.pvList);
      });
    },
    // input修改事件
    changeInput(it) {
      // 校验修改的值是否超出范围并提示
      console.log(it);
      if (it.paramName.indexOf(this.strValidParamName) == -1) {
        let min = it.minV;
        let max = it.maxV;
        let pv = +it.paramValue;
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
      } else {
        this.updIdMap[it.regAddr] = it.regAddr;
        this.preData = deepCopy(this.pvList);
      }
    },
    // 保存页面数据
    saveData(data) {
      // 检测设备是否在线
      checkDevStatus({
        devId: uni.getStorageSync("devId"),
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
        uni.setStorageSync("curDev", this.queryParams.devName);
        let tabData = data || this.pvList;
        // 遍历tabData，判断是否在updIdMap中，在就修改
        let keys = Object.keys(this.updIdMap);
        console.log(this.updIdMap);
        let len = keys.length;
        let num = 0;
        tabData.map((it, idx) => {
          if (it.regAddr in this.updIdMap) {
            // 对小数点反格式化后再进行存储
            if (it.paramName.indexOf(this.strValidParamName) == -1) {
              it.paramValue = parseInt(
                it.paramValue * Math.pow(10, it.decimalNum)
              );
            }
            console.log("更新");
            updateParamValue(it).then((res) => {
              num++;
              console.log(res);
              // 之后再格式化作为显示
              if (it.paramName.indexOf(this.strValidParamName) == -1) {
                it.paramValue = formatNumber(it.paramValue, it.decimalNum);
              }
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
    bindPickerChange(it, e) {
      console.log(it, e);
      this.pbIndexs[it.paramKey] = e.detail.value;
      it.paramValue = e.detail.value;
      this.updIdMap[it.regAddr] = it.regAddr;
      this.caculateAllRule();
    },
    // 计算是否禁用组件
    caculateDisabled(it) {
      let disabled = false;
      if (this.disableKeyList.indexOf(it.paramKey) != -1) {
        if (this.pbIndexs["prm_WorP"] != 2) {
          disabled = true;
        }
      } else if (it.paramKey == "prm_TWW") {
        if (this.pbIndexs["prm_WorP"] != 3) {
          disabled = true;
        }
      }
      return disabled;
    },
    // 计算decimalNum
    caculateDecimalNum(param) {
      const pbIndexs = this.pbIndexs;
      const ndDecimalList = this.ndDecimalList;
      const prm_WorP = pbIndexs["prm_WorP"];
      // console.log(prm_WorP);
      const isZero =
        ndDecimalList.indexOf(param.paramKey) !== -1 &&
        (prm_WorP == 1 || prm_WorP == 2);
      const ignorePCL = param.paramKey == "prm_PCL" && prm_WorP == 1;
      let decimalNum = 0;
      if (isZero) {
        decimalNum = 0;
        if (ignorePCL) decimalNum = this.baseDecimalNum;
      } else {
        decimalNum = this.baseDecimalNum;
      }
      // console.log(param.paramKey, decimalNum);
      return decimalNum;
    },
    // 计算并修改pvList中的属性值
    caculateAllRule() {
      this.pvList.map((it, idx) => {
        // 过滤掉设置速度
        if (it.paramKey == "prm_speed") {
          return;
        }
        it.disabled = this.caculateDisabled(it);
        it.decimalNum = this.caculateDecimalNum(it);
      });
      this.formatAllRule();
    },
    // 根据decimalNum格式化pvList中的属性值
    formatAllRule() {
      this.pvList.map((it, idx) => {
        // 跳过对 strValidParamName 中的参数进行格式化
        if (this.strValidParamName.indexOf(it.paramName) !== -1) {
          return;
        }
        it.paramValue = formatNumber(it.paramValue, it.decimalNum);
      });
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
