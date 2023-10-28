import Vue from 'vue'
import App from './App'
import store from './store' // store
import plugins from './plugins' // plugins
import './permission' // permission
// 以下路径需根据项目实际情况填写
import vShow from './common/weex-v-show.js'
// #ifdef APP-NVUE
Vue.directive('show', vShow)
// #endif

Vue.use(plugins)

Vue.config.productionTip = false
Vue.prototype.$store = store

App.mpType = 'app'

const app = new Vue({
  ...App
})

app.$mount()
