<template>
  <view>
    <uni-forms v-if="pvList && pvList.length > 0" :model="pvForm" label-position="left" labelAlign="center" labelWidth="240upx">
      <uni-forms-item style="margin-right: 10px;" v-for="(it,idx) in pvList" :key="idx" :name="it.paramName" :label="it.paramName">
        <uni-easyinput class="inputCss" type="text" v-model="it.paramValue" @focus="focusInput(it.id)" @change="changeInput(it)" :disabled="it.disabled" />
      </uni-forms-item>
    </uni-forms>
    <!-- 暂无数据页面 -->
    <view class="noData" v-if="!pvList || pvList.length == 0">
      <text>暂无数据</text>
    </view>
    <!-- // 保存按钮 -->
    <view class="btn-wrapper">
      <button class="btn-wrapper-button" plain type="primary" @click="saveData()">保存</button>
    </view>
  </view>
</template>

<script>
import { listParamValue, updateParamValue } from "@/api/device/paramValue.js";
import { deepCopy } from "@/utils/util.js";
import { listSettings } from "@/api/device/sysSettings.js";
export default {
  data() {
    return {
      queryParams: {
        devName: null,
        ip: null,
        paramSubType: 4,
      },
      pvList: [],
      pvForm: {},
      updIdMap: {},
      strValidParamName: ["产品名称"],
      preData: {},
      online: false, // 设备是否在线
      QPDGRelativeKey: ["prm_Dou_PauseTime[2]", "prm_JYD_Dly", "prm_JYD_Dly2"],
    };
  },
  onLoad(opt) {
    console.log(opt);
    // 根据opt.devName
    this.online = opt.status == 1 ? true : false;
    this.queryParams.devName = opt.devName;
    this.getList();
  },
  methods: {
    getList() {
      listParamValue(this.queryParams).then((res) => {
        console.log(res);
        let pvList = res.rows;
        this.preData = deepCopy(pvList);
        this.getRuleList(pvList);
      });
    },
    getRuleList(pvList) {
      listSettings({}).then((res) => {
        console.log(res);
        this.pvList = pvList;
        this.ruleList = res.rows;
        // 遍历ruleList，如果paramKey=="sys_QPDGSel" 且 paramValue==0，则将pvList中的paramKey in QPDGRelativeKey的项的disabled设置为true
        this.ruleList.map((it, idx) => {
          if (it.paramKey == "sys_QPDGSel" && it.paramValue == 0) {
            this.pvList.map((item, index) => {
              if (this.QPDGRelativeKey.indexOf(item.paramKey) != -1) {
                item.disabled = true;
              }
            });
          }
        });
        console.log(this.pvList);
      });
    },
    // input聚焦事件
    focusInput(id) {
      // 监听到修改之后将参数加入到待修改列表
      this.updIdMap[id] = id;
    },
    // input修改事件
    changeInput(it) {
      // 校验修改的值是否超出范围并提示
      console.log(it);
      console.log(this.preData);
      console.log(this.pvList);
      if (it.paramName.indexOf(this.strValidParamName) == -1) {
        let pv = parseInt(it.paramValue);
        if ((pv != 0 && !pv) || pv > it.maxV || pv < it.minV) {
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
          this.preData = deepCopy(this.pvList);
        }
      }
    },
    // 保存数据
    saveData(data) {
      if (!this.online) {
        uni.showToast({
          title: "当前设备处于离线状态",
          icon: "none",
          showCancel: false,
        });
        return;
      }
      // console.log('saveData')
      let tabData = data || this.pvList;
      // let updIdMap = updIdMap || this.updIdMap
      // console.log(tabData)
      // 遍历tabData，判断是否在updIdMap中，在就修改
      let keys = Object.keys(this.updIdMap);
      console.log(keys);
      let len = keys.length;
      let num = 0;
      tabData.map((it, idx) => {
        // console.log(it.id in this.updIdMap)
        if (it.id in this.updIdMap) {
          // 对小数点反格式化后再进行存储
          if (it.paramName.indexOf(this.strValidParamName) == -1) {
            it.paramValue = this.trimPoint(it.paramValue);
          }
          // it.minV = this.trimPoint(it.minV)
          // it.maxV = this.trimPoint(it.maxV)
          console.log("call function");
          updateParamValue(it).then((res) => {
            num++;
            console.log(res);
            // 之后再格式化作为显示
            it.paramValue = (
              it.paramValue / Math.pow(10, it.decimalNum)
            ).toFixed(it.decimalNum);
            if (num == len) {
              console.log("clear");
              this.updIdMap = {};
              uni.showModal({
                content: "保存成功",
                showCancel: false,
              });
              // this.$modal.msgSuccess("保存成功");
            }
          });
        }
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
  /* align: center; */
  height: 80upx;
  /* 		margin-top: 20upx;
		margin-bottom: 10upx;
		margin-left: 60upx; */
  margin: 20upx 0 20upx 60upx;
}

.btn-wrapper-button {
  /* width: 40%; */
  width: 180upx;
  line-height: 80upx;
  height: 80upx;
}

.noData {
  display: flex;
  align-items: center;
}
</style>
