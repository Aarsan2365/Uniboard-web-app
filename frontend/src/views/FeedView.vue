<template>
  <div class="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-16 animate-fade-in">
    <Navbar :notification-refresh-key="notificationRefreshKey" />
    <main class="max-w-3xl mx-auto px-6 py-10">
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Notice Feed</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1.5">Stay up-to-date with the latest campus announcements, sorted by date.</p>
      </div>

      <!-- Search and filter section -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-sm mb-6 flex flex-col gap-4">
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            v-model="search"
            @input="debouncedSearch"
            type="text"
            placeholder="Search titles or announcements content..."
            class="premium-input pl-10"
          />
        </div>
        
        <CategoryFilter v-model="selectedCategory" @update:modelValue="() => loadNotices(1)" />

        <!-- Student Batch Filter -->
        <div v-if="user?.role === 'student' && user?.batch && user.batch !== 'N/A'" class="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
          <span class="text-xs font-semibold text-slate-400 dark:text-slate-500">Audience:</span>
          <div class="flex gap-1.5">
            <button
              @click="setBatchFilter('')"
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer active:scale-95',
                selectedBatch === ''
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              ]"
            >
              All My Feeds
            </button>
            <button
              @click="setBatchFilter(user.batch)"
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer active:scale-95',
                selectedBatch === user.batch
                  ? 'bg-teal-600 text-white border-teal-600 dark:bg-teal-500 dark:border-teal-500 shadow-sm shadow-teal-500/10'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              ]"
            >
              Only Batch {{ user.batch }}
            </button>
          </div>
        </div>

        <!-- Admin Batch Filter -->
        <div v-else-if="user?.role === 'admin'" class="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-3 mt-1 flex-wrap">
          <span class="text-xs font-semibold text-slate-400 dark:text-slate-500">Audience:</span>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="b in ['All', '2021', '2022', '2023', '2024', '2025']"
              :key="b"
              @click="setBatchFilter(b === 'All' ? '' : b)"
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer active:scale-95',
                (selectedBatch === '' && b === 'All') || (selectedBatch === b)
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              ]"
            >
              {{ b === 'All' ? 'All Batches' : `Batch ${b}` }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 animate-pulse">
          <div class="flex gap-2">
            <div class="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            <div class="h-5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
          </div>
          <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4"></div>
          <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-full"></div>
          <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-5/6"></div>
          <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            <div class="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded"></div>
            <div class="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="notices.length === 0" class="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div class="inline-flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200">No notices found</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
      </div>

      <!-- Notices Cards Feed -->
      <div v-else class="space-y-4 animate-slide-up">
        <NoticeCard
          v-for="notice in notices"
          :key="notice.id"
          :notice="notice"
        />
      </div>

      <Pagination :page="page" :total-pages="totalPages" @change="loadNotices" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Navbar from '../components/Navbar.vue';
import CategoryFilter from '../components/CategoryFilter.vue';
import NoticeCard from '../components/NoticeCard.vue';
import Pagination from '../components/Pagination.vue';
import noticeService from '../services/noticeService';
import authService from '../services/authService';

const notices = ref([]);
const selectedCategory = ref('');
const selectedBatch = ref('');
const search = ref('');
const loading = ref(false);
const page = ref(1);
const totalPages = ref(1);
const notificationRefreshKey = ref(0);

const user = computed(() => authService.getCurrentUser());

const setBatchFilter = (batchVal) => {
  selectedBatch.value = batchVal;
  loadNotices(1);
};

let searchDebounceTimer = null;
const debouncedSearch = () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => loadNotices(1), 350);
};

const loadNotices = async (targetPage = page.value) => {
  loading.value = true;
  try {
    const { data, meta } = await noticeService.getAll({
      category: selectedCategory.value || undefined,
      targetBatch: selectedBatch.value || undefined,
      search: search.value || undefined,
      page: targetPage,
      limit: 10,
    });
    notices.value = data;
    page.value = meta.page;
    totalPages.value = meta.pages || 1;

    // Mark every notice on this page as read. Fire-and-forget: we
    // don't block the UI on this, and any failure just means the
    // notification bell stays slightly stale rather than the page breaking.
    await Promise.all(data.map((n) => noticeService.markAsRead(n.id)));
    notificationRefreshKey.value++;
  } finally {
    loading.value = false;
  }
};

onMounted(() => loadNotices(1));
</script>
