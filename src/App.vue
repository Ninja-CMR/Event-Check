<script setup>
import { RouterView, useRouter } from 'vue-router'
import { QrCode, ScanLine, Users } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2 font-bold text-xl text-primary-600">
          <div class="bg-primary-600 p-1.5 rounded-lg">
            <QrCode class="w-6 h-6 text-white" />
          </div>
          <span class="hidden sm:inline">EventCheck</span>
        </div>
        
        <nav class="flex gap-2 sm:gap-4 overflow-x-auto">
          <button 
            @click="router.push('/')"
            class="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap"
            :class="$route.name === 'register' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'"
          >
            Inscription
          </button>
          <button 
            @click="router.push('/scanner')"
            class="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
            :class="$route.name === 'scanner' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'"
          >
            <ScanLine class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Scanner
          </button>
          <button 
            @click="router.push('/guests')"
            class="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
            :class="$route.name === 'guests' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'"
          >
            <Users class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Invités
          </button>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow flex flex-col items-center p-4">
      <div class="w-full max-w-lg md:max-w-xl animate-fade-in">
        <RouterView />
      </div>
    </main>
    
    <!-- Footer (Mobile Navigation helper) -->
    <footer class="sm:hidden sticky bottom-0 bg-white border-t px-4 py-2 flex justify-around items-center">
       <!-- Optionnel: on pourrait mettre les boutons ici pour mobile -->
    </footer>
  </div>
</template>

<style>
/* Custom global transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
