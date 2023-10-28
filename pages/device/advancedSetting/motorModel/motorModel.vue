<template>
	<view>
		<!-- 按钮菜单模板 -->
		<view class="uni-padding-wrap uni-common-mt">
			<view class="uni-btn-v">
				<navigator v-for="(it,idx) in menuList" :key="idx"
					:url="'/pages/device/advancedSetting/motorModel/motorSubModel?param=' +it.param +'&devName=' + devName"
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
						text: '进料斗马达模式',
						param: '0'
					},
					{
						text: '称重斗马达模式',
						param: '1'
					},
					{
						text: '集料斗马达模式',
						param: '2'
					},
					{
						text: '主振马达模式',
						param: '3'
					},
				],
				devName: null
			}
		},
		onLoad(opt) {
			this.devName = opt.devName
		},
		methods: {

		}
	}
</script>

<style>

</style>
