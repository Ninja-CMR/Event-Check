<script setup>
import { computed } from 'vue'
import { CheckCircle2, AlertCircle, XCircle, X } from 'lucide-vue-next'

const props = defineProps({
  result: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const config = computed(() => {
  if (props.result.status === 'success') {
    return {
      icon: CheckCircle2,
      iconClass: 'bg-green-100 text-green-600',
      title: 'Accès Autorisé',
      titleClass: 'text-green-700',
      bgClass: 'bg-white border-green-200'
    }
  } else if (props.result.status === 'warning') {
    return {
      icon: AlertCircle,
      iconClass: 'bg-amber-100 text-amber-600',
      title: 'Déjà Scanné',
      titleClass: 'text-amber-700',
      bgClass: 'bg-white border-amber-200'
    }
  } else {
    return {
      icon: XCircle,
      iconClass: 'bg-red-100 text-red-600',
      title: 'Accès Refusé',
      titleClass: 'text-red-700',
      bgClass: 'bg-white border-red-200'
    }
  }
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
    <div 
      class="w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden border-4" 
      :class="config.bgClass"
    >
      <div class="relative p-8 flex flex-col items-center text-center">
        <!-- Close button -->
        <button 
          @click="emit('close')"
          class="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X class="w-6 h-6 text-gray-400" />
        </button>

        <div class="w-24 h-24 rounded-full flex items-center justify-center mb-6" :class="config.iconClass">
          <component :is="config.icon" class="w-14 h-14" />
        </div>
        
        <h2 class="text-2xl font-black mb-2 uppercase tracking-tight" :class="config.titleClass">
          {{ config.title }}
        </h2>
        
        <div v-if="result.fullName" class="text-xl font-bold text-gray-900 mb-1">
          {{ result.fullName }}
        </div>
        
        <p class="text-gray-600 font-medium">
          {{ result.message }}
        </p>
        
        <button 
          @click="emit('close')"
          class="mt-8 w-full py-4 rounded-2xl font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all text-white"
          :class="result.status === 'success' ? 'bg-green-600 shadow-green-200' : result.status === 'warning' ? 'bg-amber-600 shadow-amber-200' : 'bg-red-600 shadow-red-200'"
        >
          Terminer
        </button>
      </div>
    </div>
  </div>
</template>
