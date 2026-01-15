<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import { useGuestStore } from '@/stores/guestStore'
import { usePinAuth } from '@/composables/usePinAuth'
import ResultModal from '@/components/ResultModal.vue'
import { Camera, Users, History, RefreshCcw, CheckCircle2, Lock, LogOut } from 'lucide-vue-next'

const guestStore = useGuestStore()
const { isAuthenticated, pinError, authenticate, logout } = usePinAuth()
const html5QrCode = ref(null)
const isScanning = ref(false)
const scannerError = ref(null)
const manualId = ref('')
const showManualInput = ref(false)
const pinInput = ref('')

const onScanSuccess = async (decodedText) => {
  console.log('QR Code détecté:', decodedText)
  if (guestStore.currentScanResult) {
    console.log('Modal déjà affichée, scan ignoré')
    return
  }
  console.log('Appel de checkInGuest...')
  await guestStore.checkInGuest(decodedText)
  console.log('checkInGuest terminé, résultat:', guestStore.currentScanResult)
}

const startScanner = async () => {
  try {
    scannerError.value = null
    const config = { 
      fps: 20, // Plus rapide
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      }
    }
    
    html5QrCode.value = new Html5Qrcode("reader")
    
    await html5QrCode.value.start(
      { facingMode: "environment" }, 
      config, 
      onScanSuccess,
      () => {} 
    )
    isScanning.value = true
  } catch (err) {
    console.error("Erreur scanner:", err)
    scannerError.value = "Impossible d'accéder à la caméra arrière. Assurez-vous d'être sur un site sécurisé (HTTPS) et d'avoir autorisé la caméra."
    isScanning.value = false
  }
}

const checkInManual = () => {
  if (!manualId.value) return
  guestStore.checkInGuest(manualId.value)
  manualId.value = ''
  showManualInput.value = false
}

const handlePinSubmit = () => {
  if (authenticate(pinInput.value)) {
    pinInput.value = ''
  }
}

const handleLogout = () => {
  logout()
  if (html5QrCode.value && html5QrCode.value.isScanning) {
    html5QrCode.value.stop().catch(err => console.error(err))
  }
  isScanning.value = false
}

onMounted(() => {
  guestStore.fetchGuests()
  if (isAuthenticated.value) {
    startScanner()
  }
})

onUnmounted(async () => {
  if (html5QrCode.value && html5QrCode.value.isScanning) {
    try {
      await html5QrCode.value.stop()
    } catch (err) {
      console.error("Cleanup error:", err)
    }
  }
})

const handleCloseModal = () => {
  guestStore.clearScanResult()
}

// Compute stats
const totalGuests = ref(guestStore.guests.length)
const scannedCount = ref(guestStore.guests.filter(g => g.scanned).length)
</script>

<template>
  <!-- PIN Authentication Modal -->
  <div v-if="!isAuthenticated" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6 animate-fade-in">
      <div class="text-center">
        <div class="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock class="w-8 h-8" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Accès Restreint</h2>
        <p class="text-gray-600 text-sm">
          Cette page est réservée au personnel autorisé.<br />
          Veuillez entrer votre code PIN pour continuer.
        </p>
      </div>

      <form @submit.prevent="handlePinSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Code PIN</label>
          <input 
            v-model="pinInput"
            type="password"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="6"
            placeholder="••••"
            autofocus
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-center text-2xl font-bold tracking-widest"
            @input="pinError = ''"
          />
          <p v-if="pinError" class="mt-2 text-sm text-red-600 font-medium">{{ pinError }}</p>
        </div>

        <button 
          type="submit"
          class="w-full gradient-bg text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-primary-200/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Déverrouiller
        </button>
      </form>

      <p class="text-xs text-center text-gray-400 italic">
        Si vous êtes un participant, veuillez vous inscrire sur la page d'accueil.
      </p>
    </div>
  </div>

  <div v-else class="py-6 space-y-6">
    <!-- Header Stats -->
    <div class="flex gap-4">
      <div class="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
        <div class="bg-primary-100 p-2 rounded-xl text-primary-600">
          <Users class="w-5 h-5" />
        </div>
        <div>
          <div class="text-2xl font-bold">{{ guestStore.guests.length }}</div>
          <div class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Inscrits</div>
        </div>
      </div>
      
      <div class="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
        <div class="bg-green-100 p-2 rounded-xl text-green-600">
          <History class="w-5 h-5" />
        </div>
        <div>
          <div class="text-2xl font-bold">{{ guestStore.guests.filter(g => g.scanned).length }}</div>
          <div class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Arrivés</div>
        </div>
      </div>
    </div>

    <!-- Scanner Container -->
    <div class="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      <div class="p-6 border-b border-gray-50 flex items-center justify-between">
        <h2 class="text-xl font-bold flex items-center gap-2">
          <Camera class="w-6 h-6 text-primary-600" />
          Scanner le QR Code
        </h2>
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1.5 text-[10px] font-bold text-green-500 uppercase">
            <span class="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            Live
          </span>
          <button 
            @click="handleLogout"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-red-600"
            title="Déconnexion"
          >
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div class="p-4 bg-gray-900 aspect-square flex items-center justify-center relative">
        <div id="reader" class="w-full h-full overflow-hidden rounded-2xl"></div>
        
        <!-- Error Overlay -->
        <div v-if="scannerError" class="absolute inset-0 z-10 p-6 bg-red-50 flex flex-col items-center justify-center text-center">
          <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <Camera class="w-8 h-8" />
          </div>
          <p class="text-sm font-bold text-red-700 mb-6">{{ scannerError }}</p>
          <button 
            @click="startScanner"
            class="px-6 py-2 bg-red-600 text-white rounded-full text-sm font-bold shadow-md hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <RefreshCcw class="w-4 h-4" />
            Réessayer la caméra
          </button>
        </div>

        <!-- Scanning Overlay (Aesthetics) -->
        <div v-if="!isScanning && !scannerError" class="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-900/50">
          <div class="w-12 h-12 border-4 border-t-primary-500 border-gray-200 rounded-full animate-spin"></div>
          <p class="mt-4 font-medium italic">Accès caméra en cours...</p>
        </div>
      </div>
      
      <div class="p-6 bg-gray-50 space-y-4">
        <p v-if="!showManualInput" class="text-sm text-center text-gray-500">
          Placez le QR Code de l'invité devant la caméra pour confirmer son entrée.
        </p>

        <!-- Manual Input Toggle -->
        <div class="flex justify-center">
          <button 
            @click="showManualInput = !showManualInput"
            class="text-xs font-bold text-primary-600 hover:underline uppercase tracking-widest"
          >
            {{ showManualInput ? 'Fermer la saisie manuelle' : 'Saisie manuelle de l\'ID' }}
          </button>
        </div>

        <!-- Manual Input Form -->
        <div v-if="showManualInput" class="mt-4 flex gap-2 animate-fade-in translate-y-0">
          <input 
            v-model="manualId"
            type="text" 
            placeholder="Entrez l'ID de l'invité"
            class="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-mono"
            @keyup.enter="checkInManual"
          />
          <button 
            @click="checkInManual"
            class="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-black transition-colors"
          >
            Valider
          </button>
        </div>
      </div>
    </div>

    <!-- Recent Arrivals (Mini Feed) -->
    <div v-if="guestStore.guests.filter(g => g.scanned).length > 0" class="space-y-3">
      <h3 class="font-bold text-gray-400 text-xs px-2 uppercase tracking-widest">Dernières entrées</h3>
      <div class="space-y-2">
        <div 
          v-for="guest in [...guestStore.guests].filter(g => g.scanned).reverse().slice(0, 3)" 
          :key="guest.id"
          class="bg-white/80 backdrop-blur p-3 rounded-xl border border-gray-100 flex items-center justify-between animate-fade-in"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold">
              {{ guest.first_name?.[0] }}{{ guest.last_name?.[0] }}
            </div>
            <div>
              <div class="font-bold text-sm">{{ guest.first_name }} {{ guest.last_name }}</div>
              <div class="text-[10px] text-gray-400">{{ new Date(guest.scanned_at).toLocaleTimeString() }}</div>
            </div>
          </div>
          <div class="text-green-500">
            <CheckCircle2 class="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>

    <!-- Result Modal Overlay -->
    <Transition name="fade">
      <ResultModal 
        v-if="guestStore.currentScanResult" 
        :result="guestStore.currentScanResult"
        @close="handleCloseModal"
      />
    </Transition>
  </div>
</template>

<style scoped>
/* Reset some html5-qrcode styles for better look */
:deep(#reader) {
  border: none !important;
}
:deep(#reader__scan_region) {
  background: transparent !important;
}
:deep(#reader__dashboard_section_csr button) {
  background: white;
  border: 1px solid #e5e7eb;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
:deep(#reader__dashboard_section_csr button:hover) {
  background: #f9fafb;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
