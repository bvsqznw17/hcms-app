<template>
	<div class="app-container">
		<uni-fab ref="fab" :pattern="pattern" :content="content" horizontal="right" vertical="top" direction="vertical"
			@trigger="trigger" @fabClick="fabClick" />

		<div class="main-view">
			<uni-list>
				<uni-list-item v-for="log in updateLogList" :key="log.id" :timestamp="transDate(log.dtUpdate)"
					placement="top">
					<template v-slot:body>
						<uni-card>
							<h4>{{log.content}}</h4>
							<p>{{log.operater}} 提交于 {{log.dtUpdate}}</p>
						</uni-card>
					</template>
				</uni-list-item>
			</uni-list>
		</div>
		
		<pop-date-picker :bindChange="bindDateChange" @confirm="confirmSelect" ref="pbt"></pop-date-picker>
		
		<pop-picker :dataList="devModelList" :bindChange="bindPickerChange1" @confirm="confirmSelect" ref="pb1"></pop-picker>

		<pop-picker :dataList="devNameList" :bindChange="bindPickerChange2" @confirm="confirmSelect" ref="pb2"></pop-picker>
		
		<!-- 上拉加载 -->
		<uni-load-more :status="status" :icon-size="16" :content-text="contentText" />

	</div>
</template>

<script>
	import {
		listDevChangeLog
	} from "@/api/statistic/devChangeLog";
	import {
		listDevice
	} from "@/api/device/device.js";
	import { listDevMsg } from "@/api/device/devMsg.js";
	import popPicker from "@/components/popPicker";
	import popDatePicker from "@/components/popDatePicker";

	export default {
		name: "UpdateLog",
		components: {
			popPicker: popPicker,
			popDatePicker: popDatePicker
		},
		data() {
			return {
				// 显示搜索条件
				showSearch: true,
				// 总条数
				total: 0,
				// 操作人列表
				operaterList: [],
				// 更新日志表格数据
				updateLogList: [],
				// 设备型号列表
				devModelList: [],
				// 设备名称列表
				devNameList: [],
				// 弹出层标题
				title: "",
				// 是否显示弹出层
				open: false,
				// 查询参数
				queryParams: {
					pageNum: 1,
					pageSize: 10,
					operater: null,
					content: null,
					dtUpdate: null,
					devModel: null,
					devName: null,
				},
				// 表单参数
				form: {},
				// 表单校验
				rules: {},
				content: [
					{
						text: '名称筛选',
						active: false
					},
					{
						text: '时间筛选',
						active: false
					},
					{
						text: '型号筛选',
						active: false
					},
					{
						text: '重置条件',
						active: false
					}
				],
				// pattern: {
				// 	color: '#7A7E83',
				// 	backgroundColor: '#fff',
				// 	selectedColor: '#007AFF',
				// 	buttonColor: '#007AFF',
				// 	iconColor: '#fff'
				// },
				pattern: {
					color: '#313335',
					backgroundColor: 'rgba(0,0,0,0.3)',
					selectedColor: '007AFF',
					buttonColor: 'transparent',
					iconColor: '#007AFF'
				},
				// 下拉加载相关参数
				status: 'more',
				contentText: {
					contentdown: '上拉加载更多',
					contentrefresh: '加载中',
					contentnomore: '没有更多'
				},
				reload: false,
				// 是否加载完毕
				loadAll: false,
				pk_visible: true,
			};
		},
		created() {
			this.getList();
			// 获取设备型号列表
			listDevice().then(resp => {
				// this.devModelList = resp.rows
				this.devModelList = resp.rows.map((it, idx) => {
					return it.devModel
				})
			});
			// 获取设备名称列表
			listDevMsg().then(res=>{
				this.devNameList = res.rows.map((it,idx)=>{
					return it.devName
				})
			})
		},
		onPullDownRefresh() {
			console.log('下拉刷新')
			this.reload = true;
			this.getList();
		},
		onReachBottom() {
			if (!this.loadAll) {
				this.status = 'more';
				this.getList();
				this.reload = false
			}
		},
		methods: {
			/** 查询更新日志列表 */
			getList() {
				if (this.updateLogList.length > 0) {
					this.queryParams.pageNum += this.queryParams.pageSize
				}
				this.status = 'loading'
				listDevChangeLog(this.queryParams).then(response => {
					console.log(response)
					let list = response.rows
					if (response.total > 0 && this.queryParams.pageNum <= response.total) {
						console.log('dot')
						this.updateLogList = this.reload ? list : this.updateLogList.concat(list);
						this.status = 'more'
					} else {
						console.log('another')
						if (this.updateLogList.length <= 0 || list <= 0) {
							this.updateLogList = list
						}
						this.status = 'noMore'
						this.loadAll = true
						console.log(this.updateLogList)
					}
					this.reload = false;
					// this.total = response.total;
				});
			},
			transDate(time) {
				return time.substr(0, 10);
			},
			// 取消按钮
			cancel() {
				this.open = false;
				this.reset();
			},
			/** 搜索按钮操作 */
			handleQuery() {
				this.queryParams.pageNum = 1;
				this.getList();
			},
			/** 重置按钮操作 */
			resetQuery() {
				this.resetForm("queryForm");
				this.handleQuery();
			},
			/** 修改按钮操作 */
			handleUpdate(row) {
				this.reset();
				const id = row.id || this.ids
				getUpdateLog(id).then(response => {
					this.form = response.data;
					this.open = true;
					this.title = "修改更新日志";
				});
			},
			/** picker选择事件 */
			trigger(e) {
				console.log(e)
				this.content[e.index].active = !e.item.active
				if (e.item.text == '名称筛选') {
					// 唤起名称选择器
					this.$refs.pb2.open()
				} else if (e.item.text == '时间筛选') {
					// 唤起时间选择器
					this.$refs.pbt.open()
				} else if (e.item.text == '型号筛选') {
					// 唤起型号选择器
					this.$refs.pb1.open()
				} else{
					// TODO 重置选择
					this.queryParams.pageNum = 1
					this.queryParams.dtUpdate = null
					this.queryParams.devModel = null
					this.queryParams.devName = null
					this.getList()
				}
			},
			fabClick() {
				// uni.showToast({
				// 	title: '点击了悬浮按钮',
				// 	icon: 'none'
				// })
			},
			bindDateChange: function(e) {
				console.log(e)
				const val = e.detail.value
				val[1] += 1
				val[2] += 1
				let year = val[0] + 1990
				let month = val[1] > 9 ? val[1] : '0' + val[1]
				let day = val[2] > 9 ? val[2] : '0' + val[2]
				this.queryParams.dtUpdate = year + '-' + month + '-' + day + ' 00:00:00'
				// this.getList()
			},
			bindPickerChange1(e) {
				console.log(e)
				// 使用型号筛选
				let index = e.detail.value[0]
				this.queryParams.devModel = this.devModelList[e.detail.value]
				// this.getList()
			},
			bindPickerChange2(e) {
				console.log(e)
				// 使用设备名称筛选
				let index = e.detail.value[0]
				this.queryParams.devName = this.devNameList[e.detail.value]
				// this.getList()
			},
			confirmSelect(){
				this.reload = true
				this.getList()
			}
		},
	};
</script>

<style scoped>
	.top-right-btn {
		position: absolute;
		z-index: 99999;
		right: 20px;
		top: 20px;
	}

	.main-view {
		margin-top: 15px;
	}

	.el-timeline {
		margin-left: -40upx;
	}
	.popup-view{
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
