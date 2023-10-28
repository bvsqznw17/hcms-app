<template>
	<view>
		<uni-list>
			<uni-list-item v-for="item in fileList" :key="item.id" :title="item.fileName" :clickable="true"
				:thumb="'/static/svg/file.svg'" @click="openFile($event, item)">
				<!-- TODO 进度条 -->
				<template v-slot:footer>
					<!-- 百分比 -->
					<!-- <view class="percent">90%</view> -->
					<!-- 状态栏 -->
					<view class="status-bar">{{item.status}}</view>
					<view class="right-icon" @click.stop="removeFile($event, item)">
						<image src="/static/svg/delete.svg"></image>
					</view>
				</template>
			</uni-list-item>
		</uni-list>
	</view>
</template>

<script>
	import {
		delDownloadList,
		listDownloadListByUserId
	} from "@/api/device/downloadList.js";
	export default {
		data() {
			return {
				fileList: []
			}
		},
		onLoad() {
			uni.$on('dtaskList', data => {
				console.log(data)
			})
			listDownloadListByUserId().then(res => {
				console.log(res)
				this.fileList = res.rows
			})
		},
		methods: {
			openFile(e, item) {
				console.log('trigger openFile')
				console.log(item)
				if(item.status == '下载完成'){
					console.log('call openFile')
					console.log(item.filePath)
					plus.runtime.openFile(item.filePath, {}, res=>{
						console.log(res)
					})
				}else if(item.status == '正在下载'){
					uni.showToast({
						title: '文件正在下载'
					})
				}else{
					uni.showToast({
						title: '文件下载失败'
					})
				}
	
			},
			removeFile(e, file) {
				console.log(file)
				let index;
				this.fileList.map((it, idx)=>{
					if (it.id == file.id) {
						index = idx
					}
				})
				let that = this
				this.$modal.confirm('是否移除该文件？').then(function() {
					that.fileList.splice(index, 1)
					console.log('trigger removeFile')
					// 移除本条记录并修改到数据库
					delDownloadList(file.id).then(res=>{
						console.log(res)
					})
				}).catch(err => {
					console.log(err)
					uni.showModal({
						content: '移除失败',
						showCancel: false
					})
				});

			}
		}
	}
</script>

<style>
	.right-icon {
		margin-right: 60rpx;
		display: flex;
		align-items: center;
		}
	.right-icon image {
			width: 36rpx;
			height: 36rpx;
		}
	.status-bar{
		margin-left: 10px;
		margin-right: 10px;
		font-size: 14px;
		color: #717c82;
		width: 60px;
		line-height: 200%;
	}
	.percent{
		line-height: 200%;
		font-size: 14px;
		color: #717c82;
	}
</style>
