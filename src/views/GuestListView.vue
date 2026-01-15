<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGuestStore } from '@/stores/guestStore'
import { Search, UserCheck, UserPlus, Filter, X, ChevronRight, Mail, Calendar } from 'lucide-vue-next'

const guestStore = useGuestStore()
const searchQuery = ref('')
const filterStatus = ref('all') // 'all', 'registered', 'scanned'
let realtimeChannel = null

onMounted(async () => {
  await guestStore.fetchGuests()
  realtimeChannel = guestStore.subscribeToGuests()
})

onUnmounted(() => {
  if (realtimeChannel) {
    realtimeChannel.unsubscribe()
  }
})

const filteredGuests = computed(() => {
  return guestStore.guests.filter(guest => {
    const matchesSearch = 
      guest.first_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      guest.last_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      guest.id.substring(0, 8).toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesFilter = 
      filterStatus.value === 'all' ||
      (filterStatus.value === 'registered' && !guest.scanned) ||
      (filterStatus.value === 'scanned' && guest.scanned)
    
    return matchesSearch && matchesFilter
  }).sort((a, b) => new Date(b.registered_at) - new Date(a.registered_at))
})

const stats = computed(() => ({
  total: guestStore.guests.length,
  scanned: guestStore.guests.filter(g => g.scanned).length,
  remaining: guestStore.guests.filter(g => !g.scanned).length
}))

const clearSearch = () => {
  searchQuery.value = ''
}
</script>

<template>
  <div class="py-6 space-y-6">
    <!-- Header with Stats -->
    <div class="grid grid-cols-3 gap-3">
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div class="text-xl font-bold text-gray-900">{{ stats.total }}</div>
        <div class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total</div>
      </div>
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div class="text-xl font-bold text-green-600">{{ stats.scanned }}</div>
        <div class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Arrivés</div>
      </div>
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div class="text-xl font-bold text-primary-600">{{ stats.remaining }}</div>
        <div class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Restants</div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white p-4 rounded-2xl shadow-md border border-gray-100 space-y-4">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher un nom, email ou ID..."
          class="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
        />
        <button 
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X class="w-3 h-3 text-gray-500" />
        </button>
      </div>

      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button 
          @click="filterStatus = 'all'"
          class="px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap"
          :class="filterStatus === 'all' ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          Tous
        </button>
        <button 
          @click="filterStatus = 'registered'"
          class="px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap"
          :class="filterStatus === 'registered' ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          Non arrivés
        </button>
        <button 
          @click="filterStatus = 'scanned'"
          class="px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap"
          :class="filterStatus === 'scanned' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          Déjà arrivés
        </button>
      </div>
    </div>

    <!-- Guest List -->
    <div class="space-y-3">
      <div v-if="filteredGuests.length === 0" class="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
        <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search class="w-8 h-8 text-gray-300" />
        </div>
        <p class="text-gray-500 font-medium">Aucun invité trouvé</p>
        <button @click="clearSearch(); filterStatus = 'all';" class="mt-2 text-primary-600 text-sm font-bold hover:underline">
          Réinitialiser les filtres
        </button>
      </div>

      <div 
        v-for="guest in filteredGuests" 
        :key="guest.id"
        class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group animate-fade-in"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div 
              class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
              :class="guest.scanned ? 'bg-green-100 text-green-600' : 'bg-primary-100 text-primary-600'"
            >
              {{ guest.first_name[0] }}{{ guest.last_name[0] }}
            </div>
            <div>
              <div class="font-bold text-gray-900">{{ guest.first_name }} {{ guest.last_name }}</div>
              <div class="flex items-center gap-1.5 text-xs text-gray-500">
                <Mail class="w-3 h-3" />
                {{ guest.email }}
              </div>
            </div>
          </div>
          
          <div class="flex flex-col items-end gap-1">
            <div 
              class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest"
              :class="guest.scanned ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'"
            >
              {{ guest.scanned ? 'Arrivé' : 'Inscrit' }}
            </div>
            <div class="text-[9px] font-mono text-gray-400">ID: {{ guest.id.substring(0, 8) }}</div>
          </div>
        </div>

        <div v-if="guest.scanned" class="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px]">
          <div class="flex items-center gap-1.5 text-gray-500">
            <UserCheck class="w-3.5 h-3.5 text-green-500" />
            Vérifié à {{ new Date(guest.scanned_at).toLocaleTimeString() }}
          </div>
          <div class="text-gray-400">
            {{ new Date(guest.scanned_at).toLocaleDateString() }}
          </div>
        </div>
        <div v-else class="mt-3 pt-3 border-t border-gray-50 flex items-center gap-1.5 text-[11px] text-gray-400">
          <Calendar class="w-3.5 h-3.5" />
          Inscrit le {{ new Date(guest.registered_at).toLocaleDateString() }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
