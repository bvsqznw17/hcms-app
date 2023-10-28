## 插件使用方法：
	
 `<select-lay :value="tval" name="name" :options="datalist" @selectitem="selectitem"></select-lay>`
  
## 配置参数：
 
 属性名|类型|默认值|说明
 :--:|:--:|:--:|-
 showClearIcon|Boolean|false|是否显示全部清空按钮
 showValueClear|Boolean|true|是否显示单个删除
 zindex|Number|""|层级，默认999，防止多个组件一起使用时下拉栏穿透
 slabel|String|label|自定义列表中键值对关系，参考示例
 svalue|String|value|自定义列表中键值对关系，该值对应value，参考示例
 placeholder|String|请选择|无选项时展示的文字
 showplaceholder|Boolean|true|下拉时是否展示请选择按钮
 options|Array|无|数据列表
 disabled|Boolean|false|是否禁用
 value|Array|无|选中值及回显
 isPaging|Boolean|false|是否开启分页默认不需要
## 事件：

 事件名|说明|返回值
 :--:|:--:|-
 @change|点击项目或者删除触发的事件|返回全量选中项及只有value的选中项
 @scrolltolower|分页触底事件|发送你的请求获取分页数据
## 说明：
 
 此插件依赖scss，请务必安装！！！

 
## 示例：
 
 ```
	<template>
		<view class="content">
			<form @submit="formSubmit">
				<view class="item">写法：</view>
				<select-cy :value="tval" placeholder="请选择项目" :options="datalist" @change="change"></select-cy>
				<select-cy :value="tval" placeholder="请选择项目1" :options="datalist" @change="change"></select-cy>
				<button type="submit" @click="formSubmit">提交</button>
			</form>
		</view>
	</template>
	
	<script>
	export default {
		data() {
			return {
				//模拟数据列表
				datalist: [],
				//模拟初始数据
				tval: []
			};
		},
		onReady() {
			this.datalist = [
				{
					label: 'label1',
					value: 'value1'
				},
				{
					label: 'label2',
					value: 'value2'
				},
				{
					label: 'label3',
					value: 'value3'
				},
				{
					label: 'label4',
					value: 'value4'
				},
				{
					label: 'label5',
					value: 'value5'
				},
				{
					label: 'label6',
					value: 'value6'
				},
				{
					label: 'label7',
					value: 'value7'
				},
				{
					label: 'label8',
					value: 'value8'
				},
				{
					label: 'label9',
					value: 'value9'
				}
			];
		},
		methods: {
			formSubmit(e) {
				console.log(this.tval,'提交参数');
			},
			change(item,value) {
				console.log(item,value);
				this.tval = value;
			}
		}
	};
	</script>
	
	<style lang="scss">
	.content {
		width: 300px;
		padding: 20px 0;
		margin: 0 auto;
	
		.item {
			margin-bottom: 10px;
		}
	
		.btn {
			margin-top: 20px;
		}
	}
	</style>
	
 
 ```
 