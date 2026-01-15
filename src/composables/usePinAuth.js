import { ref } from 'vue'

const STORAGE_KEY = 'scanner_authenticated'
const SCANNER_PIN = import.meta.env.VITE_SCANNER_PIN || '1234'

export function usePinAuth() {
    const isAuthenticated = ref(checkAuth())
    const pinError = ref('')

    function checkAuth() {
        return sessionStorage.getItem(STORAGE_KEY) === 'true'
    }

    function authenticate(pin) {
        pinError.value = ''

        if (pin === SCANNER_PIN) {
            sessionStorage.setItem(STORAGE_KEY, 'true')
            isAuthenticated.value = true
            return true
        } else {
            pinError.value = 'Code PIN incorrect'
            return false
        }
    }

    function logout() {
        sessionStorage.removeItem(STORAGE_KEY)
        isAuthenticated.value = false
    }

    return {
        isAuthenticated,
        pinError,
        authenticate,
        logout,
        checkAuth
    }
}
