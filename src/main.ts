import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { BootstrapVue } from 'bootstrap-vue'
import Toast from 'vue-toastification'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'mdb-vue-ui-kit/css/mdb.min.css'
import 'vue-toastification/dist/index.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(Toast)
app.use(BootstrapVue as any)

app.use(router)
app.mount('#app')
