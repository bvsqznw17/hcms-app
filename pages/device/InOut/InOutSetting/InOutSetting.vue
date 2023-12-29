<template>
  <view>
    <uni-forms
      class="form-style"
      :value="form"
      label-position="left"
      labelAlign="center"
      labelWidth="375upx"
      :border="isBorder"
    >
      <!-- 弹框 -->
      <uni-forms-item name="func" label="功能">
        <picker
          :range="funcList"
          :range-key="'name'"
          @change="bindData('func', $event.detail.value)"
        >
          <view class="picker-style">{{ funcList[funcIndex].name }} </view>
        </picker>
      </uni-forms-item>
      <!-- 单选框 -->
      <uni-forms-item name="reverse" label="翻转">
        <switch @change="changeReverse" :checked="reverse"></switch>
      </uni-forms-item>
      <uni-forms-item name="status" label="状态">
        <switch disabled :checked="status"></switch>
      </uni-forms-item>
    </uni-forms>
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
import { getInOutParam, setInOutParam } from "@/api/device/paramValue.js";
import { checkDevStatus } from "@/api/device/business.js";
import popPicker from "@/components/popPicker";
export default {
  components: {
    popPicker: popPicker,
  },
  data() {
    return {
      form: {
        inOut: 0,
        param: null,
        devName: null,
        portNum: 0,
        func: 0,
        reverse: false,
        status: false,
      },
      queryParams: {
        devId: null,
        ip: null,
        paramSubType: 6,
        pageNum: 1,
        pageSize: 50,
      },
      inOut: 0, // 输入输出
      param: 0, // 端口号
      navTitlePre: "输入端口", // 导航栏标题前缀
      funcList: [],
      funcIndex: 0,
      isBorder: true,
      reverse: false,
      status: false,
      hasChange: false,
      userModel: 1,
    };
  },
  onLoad(opt) {
    this.userModel = uni.getStorageSync("userModel");
    let inOut = parseInt(opt.inOut);
    let param = parseInt(opt.param);
    let devName = opt.devName;

    // 根据inout判断是输入还是输出，从而设置funcList
    // 如果inout = 0，说明是输入，否则是输出
    if (inOut == 0) {
      this.navTitlePre = "输入端口";
      this.funcList = [
        { name: "请选择", value: 0 },
        { name: "包装机A请求放料信号输入", value: 1 },
        { name: "包装机B请求放料信号输入", value: 2 },
        { name: "料位检测信号输入A", value: 5 },
        { name: "运行", value: 10 },
      ];
    } else {
      this.navTitlePre = "输出端口";
      this.funcList = [
        { name: "请选择", value: 0 },
        { name: "组合秤就绪 1A", value: 1 },
        { name: "放料 1B", value: 2 },
        { name: "超重/清空 1C", value: 3 },
        { name: "料位加料 1D", value: 4 },
        { name: "组合秤就绪 2A", value: 5 },
        { name: "放料 2B", value: 6 },
        { name: "超重 2C", value: 7 },
        { name: "正在运行", value: 21 },
        { name: "有报警", value: 22 },
        { name: "振机1信号", value: 30 },
        { name: "振机2信号", value: 31 },
        { name: "振机3信号", value: 32 },
        { name: "振机4信号", value: 33 },
        { name: "振机5信号", value: 34 },
        { name: "振机6信号", value: 35 },
        { name: "振机7信号", value: 36 },
        { name: "振机8信号", value: 37 },
        { name: "振机9信号", value: 38 },
        { name: "振机10信号", value: 39 },
        { name: "振机11信号", value: 40 },
        { name: "振机12信号", value: 41 },
        { name: "振机13信号", value: 42 },
        { name: "振机14信号", value: 43 },
      ];
    }

    getInOutParam({
      devId: uni.getStorageSync("devId"),
      param: param,
      inOut: inOut,
    }).then((res) => {
      console.log(res);
      this.form = res.data;
      this.form.devName = devName;
      this.form.param = param;
      this.form.inOut = inOut;
      this.form.portNum = param + 1;
      // 根据portNum设置页面顶部的标题
      uni.setNavigationBarTitle({
        title: this.navTitlePre + this.form.portNum + "设置",
      });
      this.reverse = this.ckReverse();
      this.status = this.ckStatus();
      // 用于比较的paramValue的值只取前7位二进制作为整数比较，作位运算
      let cmpval = this.form.func.paramValue & 0x7f;
      console.log(cmpval);
      // 设置funcIndex
      for (let i = 0; i < this.funcList.length; i++) {
        if (this.funcList[i].value == cmpval) {
          this.funcIndex = i;
          break;
        }
      }
    });
  },
  methods: {
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
        let pv = this.form.func;
        // 设置func的params，这里只有一个参数param，代表端口号
        pv.params = {
          param: this.form.param,
        };
        // 根据端口翻转状态设置paramValue的最高位，如果端口翻转，最高位为1，否则为0
        if (this.reverse) {
          pv.paramValue = pv.paramValue | 0x80;
        } else {
          pv.paramValue = pv.paramValue & 0x7f;
        }

        console.log(pv);
        if (this.hasChange) {
          setInOutParam(pv).then((res) => {
            console.log(res);
            if (res.code == 200) {
              uni.showModal({
                content: "保存成功",
                showCancel: false,
              });
            }
          });
        }
      });
    },
    // 绑定数据
    bindData(key, val) {
      console.log(key, val);
      this.funcIndex = val;
      this.form.func.paramValue = this.funcList[val].value;
      this.hasChange = true;
    },
    // 修改端口翻转
    changeReverse(e) {
      this.reverse = e.detail.value;
      this.hasChange = true;
    },
    // 是否选中端口翻转
    ckReverse() {
      // TODO 取高位
      let ck = parseInt(this.form.func.paramValue) & (1 << 7);
      return ck != 0;
    },
    // 是否选中端口状态
    ckStatus() {
      let ck = parseInt(this.form.status.paramValue) & (1 << this.form.param);
      return ck != 0;
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

.form-style {
  background-color: #fff;
}

.picker-style {
  line-height: 250%;
  color: #409eff;
}
</style>
