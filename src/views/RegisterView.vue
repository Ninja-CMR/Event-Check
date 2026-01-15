<script setup>
import { ref, reactive } from 'vue'
import { useGuestStore } from '@/stores/guestStore'
import QrcodeVue from 'qrcode.vue'
import { CheckCircle2, Download, UserPlus, Mail, User } from 'lucide-vue-next'

const guestStore = useGuestStore()
const form = reactive({
  firstName: '',
  lastName: '',
  email: ''
})

const registeredGuest = ref(null)
const qrRef = ref(null)
const isSubmitting = ref(false)

const handleRegister = async () => {
  if (!form.firstName || !form.lastName || !form.email) return
  
  isSubmitting.value = true
  // Simuler un petit délai
  await new Promise(resolve => setTimeout(resolve, 800))
  
  registeredGuest.value = guestStore.registerGuest(form.firstName, form.lastName, form.email)
  isSubmitting.value = false
}

const downloadQR = () => {
  const canvas = document.querySelector('canvas')
  if (!canvas) return
  
  const link = document.createElement('a')
  link.download = `QR_${registeredGuest.value.firstName}_${registeredGuest.value.lastName}.png`
  link.href = canvas.toDataURL()
  link.click()
}

const resetForm = () => {
  registeredGuest.value = null
  form.firstName = ''
  form.lastName = ''
  form.email = ''
}
</script>

<template>
  <div class="py-8">
    <div v-if="!registeredGuest" class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div class="gradient-bg p-8 text-white text-center">
        <h1 class="text-3xl font-bold mb-2">Inscription Événement</h1>
        <p class="opacity-90">Réservez votre place et obtenez votre QR Code d'accès.</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="p-8 space-y-6">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Prénom</label>
          <div class="relative">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              v-model="form.firstName" 
              type="text" 
              required
              placeholder="Ex: Jean"
              class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
          <div class="relative">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              v-model="form.lastName" 
              type="text" 
              required
              placeholder="Ex: Dupont"
              class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              v-model="form.email" 
              type="email" 
              required
              placeholder="Ex: jean.dupont@email.com"
              class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="w-full gradient-bg text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-primary-200/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span v-if="!isSubmitting">S'inscrire maintenant</span>
          <span v-else class="animate-pulse">Traitement...</span>
          <CheckCircle2 v-if="!isSubmitting" class="w-5 h-5" />
        </button>
      </form>
    </div>

    <!-- Confirmation & QR Display -->
    <div v-else class="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col items-center p-8 text-center animate-fade-in">
      <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 class="w-12 h-12" />
      </div>
      
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Inscription Réussie !</h2>
      <p class="text-gray-600 mb-8">Bonjour {{ registeredGuest.firstName }}, voici votre pass d'entrée unique.</p>
      
      <div class="p-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 mb-8 relative">
        <QrcodeVue 
          :value="registeredGuest.id" 
          :size="200" 
          level="H" 
          class="rounded-lg shadow-sm"
          render-as="canvas"
        />
        <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full border shadow-sm text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          ID: {{ registeredGuest.id.substring(0, 8) }}
        </div>
      </div>
      
      <div class="flex flex-col gap-3 w-full">
        <button 
          @click="downloadQR"
          class="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-colors"
        >
          <Download class="w-5 h-5" />
          Télécharger mon QR Code
        </button>
        
        <button 
          @click="resetForm"
          class="text-gray-500 text-sm font-medium hover:text-primary-600"
        >
          Inscrire une autre personne
        </button>
      </div>
      
      <p class="mt-8 text-xs text-gray-400 italic">
        Veuillez présenter ce code à l'entrée de l'événement.
      </p>
    </div>
  </div>
</template>
