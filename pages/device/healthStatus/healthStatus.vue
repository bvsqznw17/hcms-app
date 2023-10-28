<template>
	<view>
<!-- 		<uni-forms v-if="page.tabData && page.tabData.length > 0"
			label-position="left" labelAlign="center" labelWidth="375upx">
			<uni-forms-item style="margin-right: 10px;" v-for="(it,idx) in page.tabData" :key="idx"
				:name="it.paramName" :label="it.paramName">
				<uni-easyinput class="inputCss" type="text" v-model="it.paramValue" @focus="focusInput(it.id)"
					@change="changeInput(it)" />
			</uni-forms-item>
		</uni-forms> -->
	</view>
</template>

<script>
	import {
		listParamValue,
		updateParamValue
	} from "@/api/device/paramValue.js";
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			
		}
	}
</script>

<style>

</style>
