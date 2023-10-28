<template>
	<view>
		<!-- 按钮菜单模板 -->
		<view class="uni-padding-wrap uni-common-mt">
			<view class="uni-btn-v">
				<navigator v-for="(it,idx) in menuList" :key="idx"
					:url="'/pages/device/InOut/InOutPort/InOutPort?param=' +it.param + '&devName=' + devName" hover-class="navigator-hover">
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
				menuList: [
					{text: '输入端口', param: '0'},
					{text: '输出端口1', param: '1'},
					{text: '输出端口2', param: '2'},
					{text: '输出端口3', param: '3'},
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
