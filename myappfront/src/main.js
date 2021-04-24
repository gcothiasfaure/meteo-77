import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import DKToast from 'vue-dk-toast'

createApp(App)
    .use(router)

    // Toastr vue CLI 3 library :
    .use(DKToast, {
        duration: 3000,
        positionY: 'top',
        positionX: 'right',
        styles: {
            color: '#000',
            backgroundColor: '#ff0000'
        },
    })

    .mount('#app')