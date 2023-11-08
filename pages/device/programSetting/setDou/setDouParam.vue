<template>
  <view>
    <uni-forms class="form-style" :value="form" label-position="left" labelAlign="center" labelWidth="375upx" :border="isBorder">
      <!-- 弹框 -->
      <uni-forms-item name="setDou" label="指定斗">
        <axb-check-box ref="radio" :multi="true" :list="douList" @change="selectBox"></axb-check-box>
      </uni-forms-item>
      <uni-forms-item style="margin-right: 10px" name="weightUp" label="重量上限">
        <uni-easyinput class="inputCss" type="text" v-model="form.weightUp.paramValue" @change="changeInput('up')" />
      </uni-forms-item>
      <uni-forms-item style="margin-right: 10px" name="weightDown" label="重量下限">
        <uni-easyinput class="inputCss" type="text" v-model="form.weightDown.paramValue" @change="changeInput('down')" />
      </uni-forms-item>
      <!-- 单选框 -->
      <uni-forms-item name="isMultiDou" label="多斗组合">
        <switch @change="changeMultiDou" :checked="isMultiDou"></switch>
      </uni-forms-item>
      <uni-forms-item name="isSuperLight" label="超强轻排">
        <switch @change="changeSuperLight" :checked="isSuperLight"></switch>
      </uni-forms-item>
    </uni-forms>
    <!-- // 保存按钮 -->
    <view class="btn-wrapper">
      <button class="btn-wrapper-button" plain type="primary" @click="saveData()" :disabled="userModel == 1">
        保存
      </button>
    </view>
  </view>
</template>

<script>
import {
  updateParamValue,
  getDouParam,
  setDouParam,
} from "@/api/device/paramValue.js";
import { checkDevStatus } from "@/api/device/business.js";
import popPicker from "@/components/popPicker";
import axbCheckBox from "@/components/axb-checkbox/axb-checkbox";
import { formatNumber, trimPoint } from "@/utils/util.js";
import { listSettings } from "@/api/device/sysSettings.js";
export default {
  components: {
    popPicker: popPicker,
    axbCheckBox: axbCheckBox,
  },
  data() {
    return {
      form: {
        setDou: {},
        weightUp: {},
        weightDown: {},
        isMultiDou: {},
        isSuperLight: {},
      },
      updMap: {},
      updPvList: [],
      devName: null,
      param: 0, // 指定斗
      douList: [
        { name: "1", value: 1, checked: 0 },
        { name: "2", value: 2, checked: 0 },
        { name: "3", value: 3, checked: 0 },
        { name: "4", value: 4, checked: 0 },
        { name: "5", value: 5, checked: 0 },
        { name: "6", value: 6, checked: 0 },
        { name: "7", value: 7, checked: 0 },
        { name: "8", value: 8, checked: 0 },
        { name: "9", value: 9, checked: 0 },
        { name: "10", value: 10, checked: 0 },
        { name: "11", value: 11, checked: 0 },
        { name: "12", value: 12, checked: 0 },
        { name: "13", value: 13, checked: 0 },
        { name: "14", value: 14, checked: 0 },
      ],
      isBorder: true,
      old_weightUp: 0,
      old_weightDown: 0,
      isMultiDou: false,
      isSuperLight: false,
      selectedDou: 0,
      unSelectableDou: 0,
      userModel: 1,
      baseDecimalNum: 0,
    };
  },
  onLoad(opt) {
    console.log(opt);
    this.userModel = uni.getStorageSync("userModel");
    let param = parseInt(opt.param);
    let devName = opt.devName;
    this.selectedDou = opt.selectedDou;
    this.devName = devName;
    this.param = param;

    // 设置页面标题
    uni.setNavigationBarTitle({
      title: "指定斗" + (param + 1),
    });

    // 获取初始小数位数后初始化页面数据
    listSettings({ paramKey: "sys_dot_num", devName: devName }).then((res) => {
      console.log(res);
      this.baseDecimalNum = res.rows[0].paramValue;
      this.initDouPage(opt);
    });
  },
  methods: {
    // input修改事件
    changeInput(tag) {
      let val, oldVal;
      if (tag == "up") {
        val = this.form.weightUp.paramValue;
        oldVal = this.old_weightUp;
      } else {
        val = this.form.weightDown.paramValue;
        oldVal = this.old_weightDown;
      }
      // 校验修改的值是否超出范围并提示
      console.log(this.form);
      console.log(val);
      console.log(oldVal);
      // 取单个的值的上下限来进行分析
      let min = formatNumber(1, this.baseDecimalNum);
      let max = formatNumber(10000, this.baseDecimalNum);
      // 将上下限应用小数点位数
      let pv = +val;
      if ((pv != 0 && !pv) || pv > max || pv < min) {
        uni.showToast({
          title: "取值范围在" + min + "~" + max,
          icon: "none",
          duration: 3000,
        });
        // 将修改的值改回原来的值
        if (tag == "up") {
          this.form.weightUp.paramValue = oldVal;
        } else {
          this.form.weightDown.paramValue = oldVal;
        }
      } else {
        if (tag == "up") {
          this.old_weightUp = val;
          this.updMap.weightUp = true;
          // this.updPvList.push(this.form.weightUp)
        } else {
          this.old_weightDown = val;
          this.updMap.weightDown = true;
          // this.updPvList.push(this.form.weightDown)
        }
      }
    },
    // 获取数据设置指定斗选择状态
    initDouPage(opt) {
      getDouParam({
        devId: uni.getStorageSync("devId"),
        param: opt.param,
      }).then((res) => {
        console.log(res);
        this.form = res.data;
        // 根据basedecimalNum设置weightDown和weigthUp的小数位数
        this.form.weightDown.paramValue = formatNumber(
          this.form.weightDown.paramValue,
          this.baseDecimalNum
        );
        this.form.weightUp.paramValue = formatNumber(
          this.form.weightUp.paramValue,
          this.baseDecimalNum
        );
        // 设置斗的选择状态
        this.form.setDou.paramValue = parseInt(this.form.setDou.paramValue);
        // 实现互斥：在上级页面建立一个已经被选中的斗列表selectedDou，然后以此来标记和过滤本页面中的斗
        // 把selectedDou和paramValue作一个运算，排除掉这个指定斗已经选中的斗，作位运算
        this.unSelectableDou = this.selectedDou & ~this.form.setDou.paramValue;
        // 把这个结果作为多选框的不可操作选项，其他的就是正常的多选框操作
        // 根据setDou的值设置多选框的选中状态，通过位运算获取一个选中数组
        let arr = [];
        let arr2 = [];
        let setDou = this.form.setDou.paramValue;
        for (let i = 0; i < 14; i++) {
          if (setDou & 1) {
            arr.push(i + 1);
          }
          if (this.unSelectableDou & 1) {
            arr2.push(i + 1);
          }
          setDou = setDou >> 1;
          this.unSelectableDou = this.unSelectableDou >> 1;
        }
        console.log(arr);
        console.log(arr2);
        // 根据arr的选中值设置多选框的选中状态
        for (let i = 0; i < this.douList.length; i++) {
          if (arr.indexOf(this.douList[i].value) != -1) {
            this.douList[i].checked = 1;
          }
          if (arr2.indexOf(this.douList[i].value) != -1) {
            this.douList[i].checked = 2;
          }
        }

        this.old_weightDown = this.form.weightDown.paramValue;
        this.old_weightUp = this.form.weightUp.paramValue;
        this.isMultiDou = this.ckMultiDou();
        this.isSuperLight = this.ckSuperLight();
      });
    },
    // 保存页面数据
    saveData() {
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
        uni.setStorageSync("curDev", this.form.devName);
        let num = 0;
        // 检查updMap，是否有修改的数据，有的话加入updPvList
        for (let i in this.updMap) {
          console.log(i);
          if (this.updMap[i]) {
            this.updPvList.push(this.form[i]);
          }
        }
        let len = this.updPvList.length;
        console.log(this.updPvList);
        // 遍历updPvList-修改其中所有的项-需要对两个is进行位运算处理
        for (let i in this.updPvList) {
          let pv = this.updPvList[i];
          console.log(pv);
          // 将pv的paramValue转为整数
          let oldVal = pv.paramValue;
          pv.paramValue = trimPoint(pv.paramValue);
          updateParamValue(pv).then((res) => {
            num++;
            console.log(res);
            if (num == len) {
              this.updPvList = [];
              uni.showModal({
                content: "保存成功",
                showCancel: false,
              });
              // 将修改的值改回原来的值
              pv.paramValue = oldVal;
            }
          });
        }
      });
    },
    // 过滤小数点转为整数
    trimPoint(v) {
      return parseInt(String(v).replace(".", "")) | v;
    },
    // 修改多斗组合
    changeMultiDou(e) {
      let param = this.param;
      let val = parseInt(this.form.isMultiDou.paramValue);
      if (e.detail.value) {
        val |= 1 << param;
      } else {
        val &= ~(1 << param);
      }
      this.form.isMultiDou.paramValue = val;
      this.updMap.isMultiDou = true;
    },
    // 修改超强轻排
    changeSuperLight(e) {
      let param = this.param;
      let val = parseInt(this.form.isSuperLight.paramValue);
      if (e.detail.value) {
        val |= 1 << param;
      } else {
        val &= ~(1 << param);
      }
      this.form.isSuperLight.paramValue = val;
      this.updMap.isSuperLight = true;
    },
    // 是否选中多斗组合
    ckMultiDou() {
      let ck = parseInt(this.form.isMultiDou.paramValue) & (1 << this.param);
      console.log(ck);
      return ck != 0;
    },
    // 是否选中超强轻排
    ckSuperLight() {
      console.log(this.form.isSuperLight.paramValue);
      console.log(this.param);
      let ck = parseInt(this.form.isSuperLight.paramValue) & (1 << this.param);
      console.log(ck);
      return ck != 0;
    },
    // 选择dou
    selectBox(e) {
      console.log(e);
      let re = e.re;
      let re_all = e.re_all;
      // 因为是多选，所以e是数组
      // 然后总共有14个斗，但是我们的值是一个整数，所以需要对这个整数进行位运算，按16位来进行
      // 1.先将所有的值清空
      this.form.setDou.paramValue = 0;
      // 2.遍历e，将选中的值进行位运算
      for (let i in re) {
        this.form.setDou.paramValue |= 1 << (re[i] - 1);
      }
      // 根据改变的结果，重新计算selectedDou
      this.selectedDou = 0;
      for (let i in re_all) {
        this.selectedDou |= 1 << (re_all[i] - 1);
      }
      uni.setStorageSync("selectedDou", this.selectedDou);
      this.updMap.setDou = true;
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

.form-style {
  background-color: #fff;
}

.picker-style {
  line-height: 250%;
  color: #409eff;
}
</style>
