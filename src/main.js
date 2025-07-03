import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { useAuthStore } from './stores/auth'
import { useProfileStore } from './stores/profile'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize stores
const authStore = useAuthStore()
const profileStore = useProfileStore()

// Initialize authentication state after Pinia is set up
authStore.initAuth()

// Initialize profiles if user is authenticated
if (authStore.isAuthenticated) {
  profileStore.fetchProfiles().then(() => {
    profileStore.initializeProfile()
  })
}

app.mount('#app') 