<template>
	<view>
		<!-- 按钮菜单模板 -->
		<view class="uni-padding-wrap uni-common-mt">
			<view class="uni-btn-v">
				<navigator v-for="(it,idx) in menuList" :key="idx"
					:url="'/pages/device/advancedSetting/' +it.url + '/' + it.url + '?devName=' + devName + '&param=' + it.param" 
					hover-class="navigator-hover">
					<button type="default">{{it.text}}</button>
				</navigator>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				menuList: [{
						text: '系统参数',
						url: 'systemParam',
						param: 8
					},
					{
						text: '马达模式',
						url: 'motorModel',
						param: 9
					},
					{
						text: '频率增益',
						url: 'plzy',
						param: 10
					},
					{
						text: '模块状态',
						url: 'mkStatus',
						param: 11
					},
				],
				status: 0,
				devName: null
			}
		},
		onLoad(opt) {
			let devName = uni.getStorageSync('devName')
			this.devName = devName
		},
		methods: {

		}
	}
</script>

<style>

</style>
