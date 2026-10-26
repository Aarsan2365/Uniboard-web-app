<template>
  <div class="min-h-screen bg-[var(--app-bg)] text-[var(--text-main)] transition-colors duration-300">
    <Sidebar :sidebar-open="sidebarOpen" @close="sidebarOpen = false" />

    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black/60 lg:hidden"
      @click="sidebarOpen = false"
    ></div>

    <div class="min-h-screen lg:ml-[270px]">
      <TopHeader
        :notification-refresh-key="notificationRefreshKey"
        @toggle-sidebar="sidebarOpen = true"
      />
      <main><slot /></main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import TopHeader from '../components/TopHeader.vue';

defineProps({
  notificationRefreshKey: { type: Number, default: 0 },
});

const sidebarOpen = ref(false);
</script>
