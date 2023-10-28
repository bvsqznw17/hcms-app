<template>
	<view>
		<!-- 搜索框 -->
		<view>
			<view :class="['weui-search-bar', inputShowed ? 'weui-search-bar_focusing' : '']" id="searchBar">
				<form class="weui-search-bar__form">
					<view class="weui-search-bar__box">
						<i class="weui-icon-search"></i>
						<input type="text" id="searchInput" class="weui-search-bar__input" placeholder="请输入设备型号"
							v-model="inputVal" :focus="inputShowed" @input="inputTyping" />
						<span class="weui-icon-clear" v-if="inputVal.length > 0" @click="clearInput"></span>
					</view>
					<label class="weui-search-bar__label" @click="showInput">
						<i class="weui-icon-search"></i>
						<span class="weui-search-bar__text">搜索</span>
					</label>
				</form>
				<view class="weui-search-bar__cancel-btn" @click="hideInput">取消</view>
			</view>
			<view class="weui-cells searchbar-result" v-if="inputVal.length > 0">
				<block v-for="(item, index) in searchList" :key="index">
					<view class="weui-cell weui-cell_active weui-cell_access">
						<view @click="chooseRes" :data-name="item.devModel" class="weui-cell__bd weui-cell_primary">
							<view>{{item.devModel}}</view>
						</view>
					</view>
				</block>
			</view>
		</view>
		<view class="index-body">
			<uni-list>
				<uni-list-item v-for="item in listData" :key="item.id" :title="item.devModel"
					:clickable="true" :thumb="'/static/svg/dev.svg'"
					@click="toDetail($event, item)">
				</uni-list-item>
			</uni-list>
		</view>
	</view>
</template>

<script>
	import {
		dateUtils,
		debounce
	} from '../../../utils/util.js';
	import {
		listDevice
	} from '@/api/device/device.js';
	export default {
		data() {
			return {
				listData: [],
				fileList: [],
				searchList: [], // 搜索栏的选项列表
				inputShowed: false,
				inputVal: "",
				queryParams: {
					pageNum: 1,
					pageSize: 10,
					name: null,
					ip: null,
					status: null
				}
			}
		},
		onLoad() {
			this.getList()
		},
		onShow() {
			// 初始化防抖函数
			this.reqDebounce = debounce(this.getSearchList, 500);
		},
		methods: {
			getList(){
				listDevice(this.queryParams).then(res=>{
					console.log(res)
					this.listData = res.rows
				})
			},
			// 请求信息列表
			getSearchList(data) {
				listDevice(data).then(res => {
					console.log(res);
					this.searchList = res.rows
				})
			},
			showInput() {
				this.inputShowed = true
			},
			hideInput() {
				this.inputVal = ""
				this.inputShowed = false
			},
			clearInput() {
				this.inputVal = ""
				this.searchList = []
			},
			inputTyping(e) {
				console.log(e)
				// 根据搜索值到数据库去匹配devMsg，将匹配到的结果循环显示到搜索文本上提供选择
				var name = e.detail.value
				this.reqDebounce({
					name: name
				}) // 防止抖动
			},
			// 事件处理： 搜索项点击
			chooseRes(e) {
				console.log(e);
				var name = e.currentTarget.dataset.name
				// 随后，将该value传入，getList
				this.queryParams.name = name
				this.reload = true
				this.getList()
				this.inputVal = ""
				this.inputShowed = false
			},
			toDetail(e, item) {
				console.log(item)
				// 跳转到文件下载页面
				uni.navigateTo({
					url: '/pages/device/downloadFilePage/downloadFilePage?devModel='+item.devModel
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		.header {
			// height: 50rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 12rpx 30rpx;
		}

		.index-body {
			margin-top: var(--status-bar-height);

			.right-icon {
				margin-right: 60rpx;
				display: flex;
				align-items: center;

				image {
					width: 36rpx;
					height: 36rpx;
				}
			}

			/deep/ .uni-list-item__container {
				// padding: 12rpx 30rpx;

				.uni-list-item__content-title {
					// font-size: 16rpx;
				}

				.uni-list--base {
					// width: 36rpx;
					// height: 36rpx;
				}
			}
		}
	}
</style>

<style>
	.page {
		background-color: #ffffff;
	}

	.page__bd {
		padding-bottom: 20rpx;
		/* height: 10%; */
	}

	.page-wrapper {
		margin: 0;
		font-size: 28rpx;
		line-height: 1.5;
		color: #333;
		background-color: #efefef;
		overflow-x: hidden;
		-webkit-overflow-scrolling: touch;
		-webkit-tap-highlight-color: transparent;
		min-height: 2000rpx;
	}

	.bus-list .bus-list-item {
		position: relative;
		height: 200rpx;
		width: 700rpx;
		background-color: #fff;
		margin: 16rpx 0;
		border: 2rpx solid #e5e5e5;
		border-width: 2rpx 0;
	}

	.bus-list .bus-list-item::before,
	.bus-list .bus-list-item::after {
		position: absolute;
		left: 122rpx;
		content: '';
		width: 24rpx;
		height: 12rpx;
	}

	.bus-list .bus-list-item::before {
		border-radius: 0 0 60rpx 60rpx;
		border-top: none;
		top: -2rpx;
	}

	.bus-list .bus-list-item::after {
		border-radius: 60rpx 60rpx 0 0;
		border-bottom: none;
		bottom: -2rpx;
	}

	.bus-list .bus-list-item .dev-msg {
		position: absolute;
		left: 0;
		margin: 10rpx 0;
		color: #005cb3;
		text-align: left;
		font-size: 30rpx;
		font-family: Arial;
	}


	.bus-list .bus-list-item .btns {
		/* background-color: #1890ff; */
		position: absolute;
		right: 0;
		width: 210rpx;
		height: 190rpx;
		line-height: 190rpx;
		text-align: center;
		vertical-align: center;
		color: #1890ff;
		font-size: 30rpx;
	}

	._btn {
		margin-top: 40rpx;
		width: 190rpx;
		height: 40rpx;
		line-height: 40rpx;
		border: #1890ff solid 1rpx;
		border-radius: 5%;
	}

	._btn+._btn {
		margin-top: 30rpx;
	}

	.bus-list .bus-list-item.disabled .btns {
		background-color: #c5c5c5;
	}

	._label {
		color: #005cb3;
	}
</style>
