<template>
  <view class="container">
    <!-- <scroll-view class="table-scroll" scroll-y> -->
    <uni-table border stripe empty-text="暂无更多数据" @click="highlightRow">
      <!-- 表头行 -->
      <uni-tr class="header-row">
        <uni-th>程序号</uni-th>
        <uni-th>产品名称</uni-th>
        <uni-th>目标值</uni-th>
        <uni-th>上限值</uni-th>
        <uni-th>下限值</uni-th>
        <uni-th>速度</uni-th>
      </uni-tr>
      <!-- 数据行 -->
      <uni-tr v-for="(item, index) in tableData" :key="index" :class="{ 'highlighted': item.selected }">
        <uni-td>{{ item.id }}</uni-td>
        <uni-td>{{ item.productName }}</uni-td>
        <uni-td>{{ item.target }}</uni-td>
        <uni-td>{{ item.upper }}</uni-td>
        <uni-td>{{ item.lower }}</uni-td>
        <uni-td>{{ item.speed }}</uni-td>
      </uni-tr>
    </uni-table>
    <!-- </scroll-view> -->
    <view class="button-group">
      <uni-button class="action-btn" @click="selectRow">选择</uni-button>
      <uni-button class="action-btn" @click="copyTo">复制到</uni-button>
      <uni-button class="action-btn" @click="deleteSelected">删除</uni-button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      tableData: [
        {
          id: "1",
          productName: "产品A",
          target: 100,
          upper: 120,
          lower: 80,
          speed: 20,
          selected: false,
        },
        {
          id: "2",
          productName: "产品B",
          target: 200,
          upper: 220,
          lower: 180,
          speed: 30,
          selected: false,
        },
        {
          id: "3",
          productName: "产品C",
          target: 150,
          upper: 170,
          lower: 130,
          speed: 25,
          selected: false,
        },
      ],
    };
  },
  methods: {
    selectRow(index) {
      this.tableData.forEach((item, i) => {
        item.selected = i === index;
      });
    },
    copyTo() {
      const selectedData = this.tableData.filter((item) => item.selected);
      // 复制选中行的操作...
      console.log(selectedData);
    },
    deleteSelected() {
      const selectedIndexes = this.tableData.reduce((acc, item, index) => {
        if (item.selected) {
          acc.push(index);
        }
        return acc;
      }, []);
      this.tableData = this.tableData.filter(
        (item, index) => !selectedIndexes.includes(index)
      );
    },
    highlightRow(index) {
      this.tableData.forEach((item) => {
        item.selected = false;
      });
      this.tableData[index].selected = true;
    },
  },
};
</script>

<style>
.container {
  height: 100vh;
  padding-bottom: 80px; /* 用于底部按钮的空间占位 */
}

.table-scroll {
  height: calc(100vh - 80px); /* 减去底部按钮的高度 */
}

.highlighted {
  background-color: #f8f8f8; /* 高亮行颜色 */
}

.header-row {
  background-color: #ddd; /* 表头背景色 */
}

.column-width {
  flex-basis: 0;
  flex-grow: 1;
  text-align: center;
  overflow-wrap: break-word;
}

.button-group {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px;
}

.action-btn {
  flex: 1;
  min-width: 0;
  margin: 0 5px;
  background-color: #fff;
  color: #333;
}
</style>