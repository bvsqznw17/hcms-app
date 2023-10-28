<template>
	<view>
		<!-- 按钮菜单模板 -->
		<view class="uni-padding-wrap uni-common-mt">
			<view class="uni-btn-v">
				<navigator v-for="(it,idx) in menuList" :key="idx"
					:url="'/pages/device/InOut/InOutSetting/InOutSetting?param=' +it.param + '&inOut=' + inOut + '&devName=' + devName"
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
				menuList: [],
				inOut: 0,
				devName: null,
				param: 0
			}
		},
		onLoad(opt) {
			console.log(opt)
			let param = opt.param
			this.inOut = param
			this.devName = opt.devName

			let text = '';
			if (this.inOut == 0) {
				text = '输入端口'
				this.setNavTitle('输入端口设置')
			} else {
				text = '输出端口'
				this.setNavTitle('输出端口' + param + '设置')
			}
			for (var i = 0; i < 8; i++) {
				let obj = {}
				obj.text = text + (i + 1)
				obj.param = i
				this.menuList.push(obj)
			}
		},
		methods: {
			// 设置页面标题
			setNavTitle(title) {
				uni.setNavigationBarTitle({
					title: title
				})
			},
		}
	}
</script>

<style>

</style>
