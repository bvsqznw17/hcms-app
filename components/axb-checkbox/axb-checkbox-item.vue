<template>
	<view class="radio" :class="{'radio-width-default':widthDefault}" :style="currentStyle" @click="handleChange">
		{{name}}
	</view>
</template>

<script>
	
	/**
 * 防抖
 * @param {*} fun 
 * @param {*} delay 
 * @param {*} immediate 
 */
const debounce = function (fun, delay, immediate) {
  var timer, lasttime, context, arg
  var later = function () {
    var now = new Date().getTime(),
      l = now - lasttime
    if (l < delay && l >= 0) {
      clearTimeout(timer)
      timer = setTimeout(later, delay - l)
    } else {
      clearTimeout(timer)
      timer = null
      if (!immediate) {
        fun.apply(context, arg)
        if (!timer) context = arg = null
      }
    }
  }
  return function () {
    context = this
    arg = arguments
    lasttime = new Date().getTime()
    var callNow = immediate && !timer
    if (!timer) timer=setTimeout(later, delay)
    if (callNow) {
      fun.apply(context, arg)
      context = arg = null
    }
  }
}
	export default {
		props: {
			name: {
				type: String,
				default: ''
			},
			value: {
				default: null,
			},
			checked: {
				type: [Boolean, Number],
				default: 0
			},
		},
		computed: {
			widthDefault() {
				return this.name.length <= 3
			},
			activeStyle() {
				return `background: #d5e4fd;color: #3c7ef6;border-color: #3c7ef6;`
				},
			itemStyle() {
				return `background: #f7f7f7;color: #7d7d7d;`
			},
			disabledStyle() {
				return `background: #FF000080;color: #7d7d7d;`
			},
			// currently style
			currentStyle() {
				// 根据checked的值来判断当前使用的样式
				if (this.checked == 1) {
					return this.activeStyle
				} else if(this.checked == 2) {
					return this.disabledStyle
				} else{
					return this.itemStyle
				}
			},
		},
		data() {
			return {

			};
		},
		methods: {
			handleChange(){
				// 如果当前是禁用状态，不触发事件
				if(this.checked == 2) return;
				debounce(handleChange, 200,true).call(this)
			}
			// handleChange: debounce(handleChange, 200,true)
		}
	}

	function handleChange() {
		this.$emit('change', this.value)
	}
</script>

<style>
	.radio {
		display: inline-block;
		height: 60upx;
		line-height: 60upx;
		padding: 0 22upx;
		border-radius: 10upx;
		font-size: 26upx;
		box-sizing: border-box;
		border: 1px solid #c3c3c3;
	}

	.radio:not(:last-child) {
		margin: 0 20upx 30upx 0;
	}


	.radio-width-default {
		width: 120upx;
		text-align: center;
		padding: 0;
	}
</style>
