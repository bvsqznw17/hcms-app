<template>
	<view class="container">
		<uni-fab class="download-fab" ref="fab" :pattern="pattern" horizontal="right" vertical="bottom" direction="vertical"
			@fabClick="fabClick" :popMenu="false" :icon="fabIcon" />

		<view class="index-body">
			<uni-list>
				<uni-list-item v-for="item in fileList" :key="item.id" :title="item.fileName" :clickable="true"
				 :thumb="item.isFile?'/static/svg/file.svg':'/static/svg/folder.svg'">
				 <template v-slot:footer>
					 <view class="right-icon" @click="downloadFile(item)" >
					 	<image src="/static/svg/download.svg"></image>
					 </view>
				 </template>
				 </uni-list-item>
			</uni-list>
		</view>
	</view>
</template>

<script>
	import {
	  listDevFile,
	  getDownloadUrl
	} from "@/api/device/devFile";
	import {
		listDownloadList,
		addDownloadList,
		updateDownloadList,
	} from "@/api/device/downloadList.js";
	import config from '@/config'
	export default {
		data() {
			return {
				fileList: [],
				queryParams: {
					devModel: null
				},
				pattern: {
					color: '#313335',
					backgroundColor: 'rgba(0,0,0,0.3)',
					selectedColor: '007AFF',
					buttonColor: 'transparent',
					iconColor: '#007AFF'
				},
				fabIcon: 'download',
				// 下载任务列表
				dtaskList: []
			}
		},
		onLoad(options){
			console.log(options)
			// TODO 接收页面路由参数
			this.queryParams.devModel = options.devModel
			// TODO 需要一个根据devName查询相应devFile的api
			this.getList()
		},
		methods: {
			getList(){
				listDevFile(this.queryParams).then(res=>{
					console.log(res)
					this.fileList = res.rows
				})
			},
			downloadFile(item){
				console.log(item)
				// 下载时增加一条下载记录
				let obj = {
					status: '正在下载',  // 下载中
					fileName: item.fileName
				}
				let id;
				console.log("添加一条下载记录")
				// TODO  先查询是否有下载记录，如果没有，就添加一条
				listDownloadList({fileName: item.fileName}).then(res=>{
					console.log(res)
					if(res.code == 200 && res.rows.length == 0){
						addDownloadList(obj).then(res=>{
							console.log(res)
							console.log("获取url")
							uni.showToast({
								title: '已加入下载列表',
								icon: "none",
								duration: 2000
							})
							getDownloadUrl({filePath: item.filePath}).then(res=>{
								console.log(res)
								let url = config.baseUrl + res.msg
								// TODO 下载文件到本地-使用生成地址-预览图片接口
								let dtask = uni.downloadFile({
									url: url,
									success: (res) =>{
										console.log(res)
										
										uni.saveFile({
											tempFilePath: res.tempFilePath,
											success: (res) =>{
												uni.showToast({
													icon: "none",
													title: "文件已保存" + res.savedFilePath,
													duration: 3000
												})
												let filePath = res.savedFilePath
												console.log(filePath)
												// 下载完成后更改下载记录
												listDownloadList({fileName: item.fileName}).then(res=>{
													console.log(res)
													let obj = {
														id: res.rows[0].id,
														status: '下载完成',  // 下载完成
														filePath: filePath
													}
													updateDownloadList(obj).then(res=>{
														console.log(res)
													})
												})
											}
										})
									},
									fail: (res)=>{
										// 下载失败后更改下载记录
										let obj = {
											id: id,
											status: '下载失败',  // 下载失败
										}
										updateDownloadList(obj).then(res=>{
											console.log(res)
										})
									}
								})
								let obj = {}
								this.dtaskList.push({[item.id]: dtask})
								dtask.onProgressUpdate(res=>{
									console.log("当前进度："+res.progress)
								})
							})
						})
					}
				})
				
				
			},
			fabClick() {
				// TODO 直接跳转到新的页面
				uni.navigateTo({
					url: '/pages/device/downloadManage/downloadManage'
				})
				uni.$emit('dtaskList', this.dtaskList)
				// uni.showToast({
				// 	title: '点击了悬浮按钮',
				// 	icon: 'none'
				// })
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
	
</style>
