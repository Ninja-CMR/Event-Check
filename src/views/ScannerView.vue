<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useGuestStore } from '@/stores/guestStore'
import ResultModal from '@/components/ResultModal.vue'
import { Camera, Users, History } from 'lucide-vue-next'

const guestStore = useGuestStore()
const scanner = ref(null)
const isScanning = ref(false)

const onScanSuccess = (decodedText) => {
  // Pause scanning while showing result
  if (guestStore.currentScanResult) return
  
  guestStore.checkInGuest(decodedText)
}

const onScanError = (errorMessage) => {
  // handle scan error - ignore for cleaner UI
}

onMounted(() => {
  const config = { 
    fps: 10, 
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0
  }
  
  scanner.value = new Html5QrcodeScanner(
    "reader", 
    config, 
    /* verbose= */ false
  )
  
  scanner.value.render(onScanSuccess, onScanError)
  isScanning.value = true
})

onUnmounted(() => {
  if (scanner.value) {
    scanner.value.clear().catch(error => {
      console.error("Failed to clear html5QrcodeScanner. ", error)
    })
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
  <div class="py-6 space-y-6">
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
        <span class="flex items-center gap-1.5 text-[10px] font-bold text-green-500 uppercase">
          <span class="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
          Live
        </span>
      </div>
      
      <div class="p-4 bg-gray-900 aspect-square flex items-center justify-center relative">
        <div id="reader" class="w-full h-full overflow-hidden rounded-2xl"></div>
        
        <!-- Overlay for aesthetics if scanner is loading -->
        <div v-if="!isScanning" class="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-900/50">
          <div class="w-12 h-12 border-4 border-t-primary-500 border-gray-200 rounded-full animate-spin"></div>
          <p class="mt-4 font-medium italic">Initialisation de la caméra...</p>
        </div>
      </div>
      
      <div class="p-6 bg-gray-50">
        <p class="text-sm text-center text-gray-500">
          Placez le QR Code de l'invité devant la caméra pour confirmer son entrée.
        </p>
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
              {{ guest.firstName[0] }}{{ guest.lastName[0] }}
            </div>
            <div>
              <div class="font-bold text-sm">{{ guest.firstName }} {{ guest.lastName }}</div>
              <div class="text-[10px] text-gray-400">{{ new Date(guest.scannedAt).toLocaleTimeString() }}</div>
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
