<template>
    <div
      class="min-h-screen bg-[#f7f8fc] dark:bg-slate-950 text-slate-900 dark:text-slate-100"
    >
      <!-- Sidebar -->
      <Sidebar
        :sidebar-open="sidebarOpen"
        @close="sidebarOpen = false"
      />
  
      <!-- Mobile overlay -->
      <div
        v-if="sidebarOpen"
        @click="sidebarOpen = false"
        class="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
      ></div>
  
      <!-- Main area -->
      <div class="lg:ml-[270px] min-h-screen">
        <TopHeader
          :notification-refresh-key="notificationRefreshKey"
          @toggle-sidebar="sidebarOpen = true"
        />
  
        <main>
          <slot />
        </main>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  import Sidebar from '../components/Sidebar.vue';
  import TopHeader from '../components/TopHeader.vue';
  
  defineProps({
    notificationRefreshKey: {
      type: Number,
      default: 0
    }
  });
  
  const sidebarOpen = ref(false);
  </script>