<template>
  <AppLayout :notification-refresh-key="notificationRefreshKey">
    <div class="max-w-5xl mx-auto px-5 md:px-8 py-8 md:py-10 page-enter">
      <div class="mb-8">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFD60A] text-[#0A0A0A] text-xs font-bold mb-4">
          <AppIcon name="megaphone" :size="14" /> Campus Announcements
        </div>
        <h1 class="text-3xl md:text-4xl font-black text-[var(--text-main)] tracking-tight">Notice Feed</h1>
        <p class="text-sm text-[var(--text-secondary)] mt-2">Stay up-to-date with the latest campus announcements, sorted by date.</p>
      </div>

      <div class="bg-[var(--surface)] rounded-3xl border border-[var(--border)] p-5 md:p-6 shadow-sm mb-7">
        <div class="relative">
          <AppIcon name="search" :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            v-model="search"
            @input="debouncedSearch"
            type="text"
            placeholder="Search titles or announcement content..."
            class="premium-input pl-11"
          />
        </div>

        <div class="mt-5"><CategoryFilter v-model="selectedCategory" @update:modelValue="() => loadNotices(1)" /></div>

        <div v-if="user?.role === 'student' && user?.batch && user.batch !== 'N/A'" class="flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-4 mt-4">
          <span class="text-xs font-semibold text-[var(--text-secondary)]">Audience:</span>
          <button type="button" @click="setBatchFilter('')" :class="batchButtonClass(selectedBatch === '')">All My Feeds</button>
          <button type="button" @click="setBatchFilter(user.batch)" :class="batchButtonClass(selectedBatch === user.batch)">Batch {{ user.batch }}</button>
        </div>

        <div v-else-if="user?.role === 'admin'" class="flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-4 mt-4">
          <span class="text-xs font-semibold text-[var(--text-secondary)] mr-1">Audience:</span>
          <button v-for="batch in batches" :key="batch" type="button" @click="setBatchFilter(batch === 'All' ? '' : batch)" :class="batchButtonClass((selectedBatch === '' && batch === 'All') || selectedBatch === batch)">
            {{ batch === 'All' ? 'All Batches' : `Batch ${batch}` }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="space-y-5">
        <div v-for="i in 3" :key="i" class="bg-[var(--surface)] rounded-3xl border border-[var(--border)] p-6 space-y-4 animate-pulse">
          <div class="h-6 w-20 bg-[var(--surface-soft)] rounded-full"></div>
          <div class="h-6 bg-[var(--surface-soft)] rounded-lg w-3/4"></div>
          <div class="h-4 bg-[var(--surface-soft)] rounded-lg w-full"></div>
        </div>
      </div>

      <div v-else-if="notices.length === 0" class="text-center py-16 bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-sm">
        <div class="mx-auto h-16 w-16 rounded-2xl bg-[#FFD60A] text-[#0A0A0A] flex items-center justify-center mb-4"><AppIcon name="inbox" :size="28" /></div>
        <h3 class="text-lg font-black text-[var(--text-main)]">No notices found</h3>
        <p class="text-sm text-[var(--text-secondary)] mt-2">Try changing your filters or search keywords.</p>
        <button type="button" @click="clearFilters" class="premium-btn-primary mt-5">Clear Filters</button>
      </div>

      <div v-else class="space-y-5 animate-slide-up">
        <NoticeCard v-for="notice in notices" :key="notice.id" :notice="notice" />
      </div>

      <div class="mt-8"><Pagination :page="page" :total-pages="totalPages" @change="loadNotices" /></div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import AppLayout from '../layouts/AppLayout.vue';
import AppIcon from '../components/AppIcon.vue';
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
const batches = ['All', '2021', '2022', '2023', '2024', '2025'];
const user = computed(() => authService.getCurrentUser());

const batchButtonClass = (active) => [
  'px-4 py-2 rounded-full text-xs font-bold border transition',
  active ? 'bg-[#FFD60A] text-[#0A0A0A] border-[#FFD60A]' : 'bg-[var(--surface-soft)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[#FFD60A]'
];
const setBatchFilter = (value) => { selectedBatch.value = value; loadNotices(1); };
const clearFilters = () => { search.value = ''; selectedCategory.value = ''; selectedBatch.value = ''; loadNotices(1); };
let searchDebounceTimer = null;
const debouncedSearch = () => { clearTimeout(searchDebounceTimer); searchDebounceTimer = setTimeout(() => loadNotices(1), 350); };

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
    await Promise.all(data.map((notice) => noticeService.markAsRead(notice.id).catch(() => null)));
    notificationRefreshKey.value++;
  } finally {
    loading.value = false;
  }
};

onMounted(() => loadNotices(1));
</script>
