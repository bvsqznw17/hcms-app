<template>
  <view class="image-section">
    <!-- 使用 v-for 渲染小方格 -->
    <view class="small-box-container">
      <view
        v-for="(weight, index) in weightValues"
        :key="index"
        class="small-box"
        :style="boxStyle(index)"
        :ref="`box-${index}`"
        @click="clickBox(index)"
      >
        <span class="box-number" v-if="showNumberLabel">{{ index + 1 }}</span>
        <span class="box-weight" v-if="showWeightLabel">{{ weight }}</span>
      </view>
    </view>
    <view class="ellipse-block" :style="zzStyle()" @click="touchEllipse"></view>
  </view>
</template>

<script>
import { readParam } from "@/api/device/business.js";
import { formatNumber } from "@/utils/util.js";
export default {
  name: "ScaleImage",
  props: {
    // weightValues: Array,
    followDouStatus: {
      type: Boolean,
      default: true,
    },
    clickable: {
      type: Boolean,
      default: true,
    },
    showNumberLabel: {
      type: Boolean,
      default: true, // 默认显示
    },
    showWeightLabel: {
      type: Boolean,
      default: true, // 默认显示
    },
    zzjState: {
      type: Number,
      default: 0,
    },
    // 宽幅doustatus解析
    wideDoustatusMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      activeIndex: null,
      // 颜色配置 0-15的数字对应16种不同的颜色
      colorMap: {
        0: "#0863D7", // RGB(8, 98, 215)
        1: "#082BD7", // RGB(8, 43, 215)
        2: "#2908D7", // RGB(41, 8, 215)
        3: "#6E08D7", // RGB(110, 8, 215)
        4: "#B408D7", // RGB(180, 8, 215)
        5: "#D708B5", // RGB(215, 8, 181)
        6: "#D70870", // RGB(215, 8, 112)
        7: "#D7082B", // RGB(215, 8, 43)
        8: "#D72908", // RGB(215, 41, 8)
        9: "#D76F08", // RGB(215, 111, 8)
        10: "#D7B308", // RGB(215, 179, 8)
        11: "#7ED708", // RGB(126, 215, 8)
        12: "#08D71B", // RGB(8, 215, 27)
        13: "#08D7C1", // RGB(8, 215, 193)
        14: "#0899D7", // RGB(8, 153, 215)
        15: "#707070", // RGB(112, 112, 112)
      },
      // douLabel: {
      //   0: "斗中有料",
      //   1: "无组合次数达到最大值",
      //   2: "保留（无定义）",
      //   3: "无选择检出有组合",
      //   4: "无选择检出无组合排放",
      //   5: "强制排放",
      //   6: "置零出错",
      //   7: "正常组合",
      //   8: "强制排放第一次",
      //   9: "超重",
      //   A: "通讯超时",
      //   B: "重量低于-5.0",
      //   C: "正在自动置零",
      //   D: "无料检出",
      //   E: "加料",
      //   F: "斗被禁止",
      // },
      dstatus: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      weightValues: [],
      dotNum: 0,
      boxKeys: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
      dstate: [],
    };
  },
  mounted() {
    this.$nextTick(() => {
      let dotNum = uni.getStorageSync("sys_dot_num");
      this.dotNum = parseInt(dotNum == null ? 0 : dotNum) % 4;
      console.log(this.dotNum);
      this.getDouWeight();
      this.refreshDouStatus();
    });
  },
  methods: {
    // 获取并构建组合秤重量显示数据
    getDouWeight() {
      readParam({
        devId: uni.getStorageSync("devId"),
        paramKey: "doustatus",
      }).then((res) => {
        console.log("doustatus", res);
        if (!res.data) return;
        let doustatus = JSON.parse(res.data.doustatus);
        let dst = JSON.parse(res.data.doustatus);
        // 显示14个即可
        let douNum = 14;
        let startPosition = Math.floor((douNum + 1) / 2);
        doustatus = doustatus.slice(startPosition, startPosition + douNum);
        for (let i = 0; i < doustatus.length; i++) {
          if (doustatus[i] !== 0x7ffe) {
            doustatus[i] = formatNumber(doustatus[i], this.dotNum);
            if (dst[this.dstate[i] + 48]) {
              doustatus[i] +=
                ":" +
                String.fromCharCode(
                  this.dstate[i] + (this.dstate[i] < 10 ? 48 : 55)
                );
            }
          } else {
            doustatus[i] = "ERR";
            // todo 设置颜色为灰色
          }
        }
        this.weightValues = doustatus;
        // 提交数据到父组件
        this.$emit("changeWeightValues", doustatus);

        console.log(this.weightValues);
      });
    },
    touchEllipse() {
      this.$emit("zzClicked");
    },
    clickBox(index) {
      if (this.clickable == false) return;
      console.log("clickBox", index);
      this.activeIndex = index;
      this.$emit("boxClicked", index);
    },
    // 刷新斗状态
    refreshDouStatus() {
      // if (!this.followDouStatus) return;

      let dstatusKey = "cmb_DouStatus";
      let decodeFunc = this.decodeDouStatus;
      if (this.wideDoustatusMode) {
        dstatusKey = "doustatus";
        decodeFunc = this.decodeWideDouStatus;
      }

      readParam({
        devId: uni.getStorageSync("devId"),
        paramKey: dstatusKey,
      }).then((res) => {
        console.log("斗状态", res);
        // 结果是个base64字符串，需要解码
        if (res.data != undefined) {
          this.dstatus = decodeFunc(res.data[dstatusKey]);
          this.setBoxColor(Object.keys(this.dstatus), null);
        }
      });
    },
    // 斗状态解码
    decodeDouStatus(status) {
      const byteArray = this.base64ToByteArray(status);
      const arr = [];
      this.dstate = [];
      for (let i = 0; i < byteArray.length * 2; i++) {
        arr.push(byteArray[i]);
        this.dstate.push(this.getDouStatus(byteArray, i));
      }
      console.log("状态数组：" + this.dstate);
      // this.$emit("dstate", this.dstate);
      return this.dstate;
    },

    getDouStatus(ba, i) {
      const s = ba[Math.floor(i / 2)];
      const p = i % 2;
      return (s >> (4 * p)) & 0x0f;
    },

    base64ToByteArray(base64String) {
      const arrayBuffer = uni.base64ToArrayBuffer(base64String);
      return new Uint8Array(arrayBuffer);
    },
    // 针对置零页面优化的斗状态解码
    decodeWideDouStatus(doustatus) {
      console.log("doustatus", doustatus);
      for (let i = 0; i < 14; i++) {
        this.dstate.push(this.getDouStatus_wide(doustatus, i));
      }
      console.log("状态数组：" + this.dstate);
      // this.$emit("dstate", this.dstate);
      return this.dstate;
    },

    getDouStatus_wide(mp, i) {
      const s = mp[Math.floor(i / 2)];
      const p = i % 2;
      return (s >> (8 * p)) & 0x0f;
    },

    // 刷新斗重量
    refreshDouWeight() {
      this.getDouWeight();
    },

    boxStyle(index) {
      const boxStatus = this.dstatus[index];
      const color = this.colorMap[boxStatus];
      return {
        backgroundColor: color || "#0863D7", // 如果找不到颜色则使用默认颜色
      };
    },
    // 根据索引数组设置颜色
    setBoxColor(idxArr, ckey) {
      if (!this.followDouStatus) {
        for (let i = 0; i < idxArr.length; i++) {
          this.$set(this.dstatus, idxArr[i], ckey);
        }
      } else {
        for (let i = 0; i < idxArr.length; i++) {
          this.$set(this.dstatus, i, this.dstatus[i]);
        }
      }
    },
    zzStyle() {
      let style = { backgroundColor: "#0863D7" };
      if (this.zzjState == 0) {
        style = { backgroundColor: "#0863D7" };
      } else if (this.zzjState == 1) {
        style = { backgroundColor: "#707070" };
      } else if (this.zzjState == 2) {
        style = { backgroundColor: "#D7082B" };
      }
      return style;
    },
  },
};
</script>

<style scoped>
.image-section {
  /* 图片区域样式 */
  height: auto;
  /* 将高度改为自适应高度 */
  min-height: 200px;
  /* 设置一个最小高度，以确保有足够的空间容纳元素 */
  background-color: #ccc;
  border-bottom: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  /* 使子元素垂直堆叠 */
}

.small-box-container {
  /* 小方格容器样式 */
  display: flex;
  flex-wrap: wrap;
  max-width: 480px;
  /* 调整容器宽度以控制每行显示的方格数量 */
  margin: 0 auto;
  /* 水平居中 */
  perspective: 1000px; /* 添加透视效果，给立体感 */
}

.small-box {
  /* 小方格样式 */
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
  flex-basis: calc(100% / 5 - 20px);
  color: white;
  /* 控制每行显示5个方格 */
  background: #0863d7;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.3); /* 添加阴影以增强立体效果 */
  border: 1px solid rgba(255, 255, 255, 0.2); /* 添加边框以模拟亮边 */
}

.small-box,
.small-box::after {
  transition: background-color 0.2s, transform 0.2s, box-shadow 0.2s;
}

.box-number {
  /* 编号样式 */
  font-size: 14px;
  margin-bottom: 4px;
}

.box-weight {
  /* 数字样式 */
  font-size: 16px;
  font-weight: bold;
}

.ellipse-block {
  width: 60%;
  /* 使倒梯形的宽度与小方格容器的宽度一致 */
  height: 50px;
  /* 调整高度以使倒梯形更扁平 */
  background-color: #0863d7;
  /* 倒梯形方块的背景颜色 */
  margin: 20px auto;
  /* 上边距和下边距为 20px，水平居中 */
  clip-path: ellipse(50% 50% at 50% 50%);
  /* 使用 clip-path 创建椭圆形状 */
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.3); /* 添加阴影以增强立体效果 */
}

.small-box:active {
  background-color: #d7082b !important; /* 设置 hover 时的背景颜色 */
}

.ellipse-block:active {
  background-color: #d7082b !important; /* 设置 hover 时的背景颜色 */
}
</style>
