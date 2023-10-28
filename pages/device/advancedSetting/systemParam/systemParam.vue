<template>
  <view>
    <uni-forms v-if="pvList && pvList.length > 0" label-position="left" labelAlign="center" labelWidth="375upx">
      <template v-for="(it, idx) in pvList">
        <uni-forms-item style="margin-right: 10px;" :key="'picker-' + idx" :name="it.paramName" :label="it.paramName" v-if="it.pbList != undefined">
          <picker @change="bindPickerChange(it, $event)" :value="pbIndexs[it.paramKey]" :ref="'pb' + idx" :range="it.pbList" :disabled="it.disabled" @click.stop="handleClick">
            <uni-easyinput type="text" :styles="inputStyles" v-model="it.pbList[pbIndexs[it.paramKey]]" :clearable="true" :disabled="true"></uni-easyinput>
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
import { deepCopy, formatNumber, trimPoint } from "@/utils/util.js";
import { checkDevStatus } from "@/api/device/business.js";
import { listSettings, updateSettings } from "@/api/device/sysSettings.js";
import popPicker from "@/components/popPicker";
export default {
  components: {
    popPicker: popPicker,
  },
  data() {
    return {
      queryParams: {
        devName: null,
        pageNum: 1,
        pageSize: 50,
      },
      pvList: [],
      updIdMap: {},
      strValidParamName: ["产品名称"],
      preData: {},
      userModel: 1,
      pbMap: {
        sys_Unit: ["g", "kg", "lb", "oz"],
        sys_ZDSense: ["振动", "旋转"],
        sys_RunMode: ["单循环", "双循环", "异步"],
        sys_AutoZeroMode: ["计时间", "计次数"],
        sys_TrackMode: ["脉冲带记忆", "脉冲不记忆", "电平带记忆", "电平不记忆"],
        sys_YC_FLFS: ["间隔时间", "总体时间"],
        sys_FL_FS: ["单集料斗", "超差选别", "AB各自"],
      },
      baseSwitch: ["关", "开"],
      // 需要应用baseSwitch的参数
      baseSwitchKeyList: [
        "sys_JLD_state",
        "sys_LWJC_FS",
        "sys_VibrationSen",
        "sys_QP_2CJL",
        "sys_QPDGSel",
      ],
      pbIndexs: {
        sys_Unit: 0,
        sys_ZDSense: 0,
        sys_RunMode: 0,
        sys_AutoZeroMode: 0,
        sys_TrackMode: 0,
        sys_YC_FLFS: 0,
        sys_FL_FS: 0,
        sys_JLD_state: 0,
        sys_LWJC_FS: 0,
        sys_VibrationSen: 0,
        sys_QP_2CJL: 0,
        sys_QPDGSel: 0,
      },
      inputStyles: {
        borderColor: "#2979FF",
        disableColor: "#5e9aff",
      },
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
        // 根据decimalNum将paramValue转换成小数
        pvList.map((item, index) => {
          item.paramValue = formatNumber(item.paramValue, item.decimalNum);
        });
        console.log(pvList);
        this.preData = deepCopy(pvList);
        this.getRuleList(pvList);
      });
    },
    getRuleList(pvList) {
      let pbKeyList = Object.keys(this.pbIndexs);

      listSettings(this.queryParams).then((res) => {
        pvList.map((item, index) => {
          res.rows.map((it, idx) => {
            if (item.paramKey == it.paramKey) {
              // 如果paramKey在baseSwitchKeyList中，设置item的pbList为baseSwitch
              if (this.baseSwitchKeyList.indexOf(item.paramKey) != -1) {
                item.pbList = this.baseSwitch;
              } else if (pbKeyList.indexOf(item.paramKey) != -1) {
                item.pbList = this.pbMap[it.paramKey];
              }
            }
          });
        });
        this.pvList = pvList;
        this.caculateAllDisabled();
        console.log(this.pvList);
      });
    },
    // input修改事件
    changeInput(it) {
      // 校验修改的值是否超出范围并提示
      console.log(it);
      if (it.paramName.indexOf(this.strValidParamName) == -1) {
        let min = formatNumber(it.minV, it.decimalNum);
        let max = formatNumber(it.maxV, it.decimalNum);
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
    async saveData(data) {
      // 检测设备是否在线
      checkDevStatus({
        devName: this.queryParams.devName,
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
        console.log(this.updIdMap);
        let len = keys.length;
        let num = 0;
        tabData.map((it, idx) => {
          if (it.regAddr in this.updIdMap) {
            // 对小数点反格式化后再进行存储
            let oldValue = it.paramValue;
            it.paramValue = trimPoint(it.paramValue);
            console.log("更新");
            updateParamValue(it).then((res) => {
              num++;
              console.log(res);
              // 将修改后的值改为原来的值
              it.paramValue = oldValue;
              if (num == len) {
                this.updIdMap = {};
                uni.showModal({
                  content: "保存成功",
                  showCancel: false,
                });
                // 同步更新system设置
                // let re = this.updateSysSettings(it);
              }
            });
          }
        });
      });
    },
    // 更新系统设置
    async updateSysSettings(it) {
      console.log(it);
      res = await updateSettings(it).then((res) => {
        console.log(res.code == 200);
      });
    },
    bindPickerChange(it, e) {
      console.log(it, e);
      this.pbIndexs[it.paramKey] = e.detail.value;
      it.paramValue = e.detail.value;
      this.updIdMap[it.regAddr] = it.regAddr;
      this.caculateAllDisabled();
    },
    // 计算是否禁用组件
    caculateDisabled(it) {
      let disabled = false;
      if (it.paramKey == "sys_FL_FS") {
        if (this.pbIndexs["sys_JLD_state"] == 0) {
          disabled = true;
        }
      }
      return disabled;
    },
    // 计算所有的禁用组件
    caculateAllDisabled() {
      this.pvList.map((it, idx) => {
        it.disabled = this.caculateDisabled(it);
      });
    },
    handleFocus() {
      console.log("handleFocus");
      uni.hideKeyboard();
    },
    handleClick(e) {
      console.log("handleClick");
      e.stopPropagation();
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

.uni-input-input:disabled {
  -webkit-text-fill-color: currentcolor;
  color: blue;
}
</style>
