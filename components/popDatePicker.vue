<template>
	<view>
		<uni-popup ref="pickerView" type="bottom" style="z-index: 9999999;">
			<div class="popup-view">
				<div class="popup-view-header">
					<div class="popup-view-cancel" @click="pickerCancel"> 取消 </div>
					<div class="popup-view-confirm" @click="pickerConfirm"> 完成 </div>
				</div>
				<picker-view v-if="pk_visible" :value="value" :indicator-style="indicatorStyle" @change="bindChange"
					class="picker-view">
					<picker-view-column>
						<view class="item" v-for="(item,index) in years" :key="index">{{item}}年</view>
					</picker-view-column>
					<picker-view-column>
						<view class="item" v-for="(item,index) in months" :key="index">{{item}}月</view>
					</picker-view-column>
					<picker-view-column>
						<view class="item" v-for="(item,index) in days" :key="index">{{item}}日</view>
					</picker-view-column>
				</picker-view>
			</div>
		</uni-popup>
	</view>
</template>

<script>
	export default {
		name: "popPicker",
		props: {
			dataList: {
				type: Array,
				default () {
					return []
				}
			},
			bindChange: {
				type: Function,
			}
		},
		data() {
			const date = new Date()
			const years = []
			const year = date.getFullYear()
			const months = []
			const month = date.getMonth() + 1
			const days = []
			const day = date.getDate()
			for (let i = 1990; i <= date.getFullYear(); i++) {
				years.push(i)
			}
			for (let i = 1; i <= 12; i++) {
				months.push(i)
			}
			for (let i = 1; i <= 31; i++) {
				days.push(i)
			}
			return {
				title: 'picker-view',
				years,
				year,
				months,
				month,
				days,
				day,
				value: [9999, month - 1, day - 1],
				pk_visible: true,
				indicatorStyle: `height: 30px;`
			}
		},
		methods: {
			pickerConfirm() {
				// this.pk_visible = false
				this.$refs.pickerView.close()
				this.$emit('confirm')
			},
			pickerCancel() {
				// this.pk_visible = false
				this.$refs.pickerView.close()
				this.$emit('cancel')
			},
			open() {
				this.$refs.pickerView.open()
			},
			close() {
				this.$refs.pickerView.close()
			}
		},
	}
</script>

<style>
	.popup-view {
		width: 750rpx;
		height: 600rpx;
	}

	.popup-view-header {
		width: 100%;
		height: 101rpx;
		line-height: 101rpx;
		background-color: #fff;
		font-size: 36rpx;
		display: flex;
		justify-content: space-between;
		position: absolute;
		bottom: 500rpx;
		/* border-bottom: 1rpx solid #ADB0A7; */
		z-index: 9999;
	}

	.popup-view-cancel {
		color: #0076FF;
		padding-left: 20rpx;
		box-sizing: border-box;
		cursor: pointer;
	}

	.popup-view-confirm {
		color: #FE4533;
		padding-right: 20rpx;
		box-sizing: border-box;
		cursor: pointer;
	}


	.picker-view {
		width: 750rpx;
		height: 600rpx;
		background-color: #fff;
		/* margin-top: 20rpx; */
	}

	.item {
		height: 50px;
		align-items: center;
		justify-content: center;
		text-align: center;
		background-color: #409EFF;
	}
</style>
