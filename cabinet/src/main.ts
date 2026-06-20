import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/tokens.css'
import './assets/layout.css'
import './assets/components.css'
import './assets/features.css'
import './assets/features-dashboard.css'
import './assets/features-orders.css'
import './assets/features-account.css'
import './assets/features-auth.css'
import './assets/features-chat.css'
import './assets/responsive.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
