import Vue from 'vue'
import axios from 'axios'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import Transitions from 'vue2-transitions'
import VueNativeSock from 'vue-native-websocket'
import Prompt from '@/components/Prompt'
import autofocus from 'vue-autofocus-directive'

import App from './App'
import store from './store'
import EventBus from './event-bus'

Vue.use(Antd)
Vue.use(Transitions)
Vue.use(VueNativeSock, 'ws://', {
  connectManually: true,
  store,
  passToStoreHandler: function (eventName, event, next) {
    if (!eventName.startsWith('SOCKET_')) { return }
    EventBus.$emit(eventName.substr(7), event)
  }
})
Vue.use(Prompt)
Vue.directive('autofocus', autofocus)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  store,
  template: '<App/>'
}).$mount('#app')
