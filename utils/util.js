function formatTime(time) {
	if (typeof time !== 'number' || time < 0) {
		return time
	}

	var hour = parseInt(time / 3600)
	time = time % 3600
	var minute = parseInt(time / 60)
	time = time % 60
	var second = time

	return ([hour, minute, second]).map(function (n) {
		n = n.toString()
		return n[1] ? n : '0' + n
	}).join(':')
}

function formatLocation(longitude, latitude) {
	if (typeof longitude === 'string' && typeof latitude === 'string') {
		longitude = parseFloat(longitude)
		latitude = parseFloat(latitude)
	}

	longitude = longitude.toFixed(2)
	latitude = latitude.toFixed(2)

	return {
		longitude: longitude.toString().split('.'),
		latitude: latitude.toString().split('.')
	}
}
var dateUtils = {
	UNITS: {
		'年': 31557600000,
		'月': 2629800000,
		'天': 86400000,
		'小时': 3600000,
		'分钟': 60000,
		'秒': 1000
	},
	humanize: function (milliseconds) {
		var humanize = '';
		for (var key in this.UNITS) {
			if (milliseconds >= this.UNITS[key]) {
				humanize = Math.floor(milliseconds / this.UNITS[key]) + key + '前';
				break;
			}
		}
		return humanize || '刚刚';
	},
	format: function (dateStr) {
		var date = this.parse(dateStr)
		var diff = Date.now() - date.getTime();
		if (diff < this.UNITS['天']) {
			return this.humanize(diff);
		}
		var _format = function (number) {
			return (number < 10 ? ('0' + number) : number);
		};
		return date.getFullYear() + '/' + _format(date.getMonth() + 1) + '/' + _format(date.getDate()) + '-' +
			_format(date.getHours()) + ':' + _format(date.getMinutes());
	},
	parse: function (str) { //将"yyyy-mm-dd HH:MM:ss"格式的字符串，转化为一个Date对象
		var a = str.split(/[^0-9]/);
		return new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
	}
};

//防抖函数
const debounce = (func, delay) => {
	let timeout; //定时器
	return function (data) {
		// 判断定时器是否存在，存在的话进行清除，重新进行定时器计数
		if (timeout) clearTimeout(timeout); //清除之前的事件
		timeout = setTimeout(() => {
			func.call(this, data); //执行事件
		}, delay);
	}
}

// js深拷贝
const deepCopy = function (obj) {
	// 只拷贝对象 typeof对于数组和对象都返回object
	if (typeof obj !== 'object') return;
	// 根据obj的类型判断是新建一个数组还是一个对象
	let newObj = obj instanceof Array ? [] : {};
	for (let key in obj) {
		// 遍历obj,并且判断是obj的属性才拷贝
		// hasOwnProperty()不攀升原型链，只查看自己的属性
		if (obj.hasOwnProperty(key)) {
			// 判断obj[key]的类型，如果还是数组或者对象就递归调用
			// 不是就执行newObj[key] = obj[key]
			newObj[key] = typeof obj[key] === 'object' ? deepCopy(obj[key]) : obj[key];
		}
	}
	return newObj;
}

// 根据decimal格式化number
const formatNumber = (num, decimal = 0) => {
	num = (+num / Math.pow(10, decimal)).toFixed(decimal);
	return num
}

// 过滤小数点转为整数
const trimPoint = (v) => {
	return parseInt(String(v).replace('.', ''))
}

export {
	formatTime,
	formatLocation,
	dateUtils,
	debounce,
	deepCopy,
	formatNumber,
	trimPoint
}
