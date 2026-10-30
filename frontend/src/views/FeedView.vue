<template>
  <AppLayout :notification-refresh-key="notificationRefreshKey">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 page-enter">
      <header class="flex items-start justify-between gap-3 mb-5">
        <div class="min-w-0 flex-1">
          <h1 class="text-3xl md:text-4xl font-black mt-1">Notice Feed</h1>
          <p class="text-sm text-[var(--text-secondary)] mt-2"><span class="hidden sm:inline">Announcements, posters and updates for </span><span class="sm:hidden">Campus notices · </span>{{ user?.role === 'admin' ? 'your university' : user?.batch && user.batch !== 'N/A' ? `Batch ${user.batch}` : 'your campus' }}.</p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <router-link v-if="user?.role === 'admin'" to="/admin" aria-label="Create announcement" class="premium-btn-primary"><AppIcon name="file-plus" :size="17" /><span class="hidden sm:inline">Create announcement</span></router-link>
          <button aria-label="Refresh notices" class="premium-btn-secondary" :disabled="loading" @click="loadNotices(1)"><AppIcon name="activity" :size="16" /><span class="hidden sm:inline">Refresh notices</span></button>
        </div>
      </header>
      <section aria-label="Find notices" class="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-4 sm:p-5 mb-5">
        <div class="flex items-center gap-2">
          <div class="flex-1 min-w-0">
            <label for="notice-search" class="sr-only">Search notices</label>
            <input id="notice-search" v-model="search" @input="debouncedSearch" type="search" maxlength="160" placeholder="Search notices..." class="premium-input" />
          </div>
          <button type="button" class="premium-btn-secondary sm:hidden" :aria-expanded="filtersOpen" aria-controls="notice-filters" @click="filtersOpen = !filtersOpen">Filters</button>
        </div>
        <div id="notice-filters" :class="filtersOpen ? 'block' : 'hidden sm:block'">
          <div class="sm:flex sm:items-center sm:gap-3">
          <div class="mt-3 sm:w-48 shrink-0">
            <label for="notice-sort" class="sr-only">Sort notices</label>
            <select id="notice-sort" v-model="selectedSort" @change="loadNotices(1)" class="premium-select">
              <option value="newest">Newest first</option><option value="oldest">Oldest first</option>
              <option value="title-asc">Title: A to Z</option><option value="title-desc">Title: Z to A</option>
            </select>
          </div>
        <div class="mt-3 flex-1"><CategoryFilter v-model="selectedCategory" @update:modelValue="loadNotices(1)" /></div>
          </div>
        <div class="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-[var(--border)]">
          <span class="text-xs font-semibold text-[var(--text-secondary)]">Audience:</span>
          <template v-if="user?.role === 'admin'">
            <button v-for="batch in batches" :key="batch.value" type="button" @click="setBatchFilter(batch.value)" :aria-pressed="selectedBatch === batch.value" :class="batchButtonClass(selectedBatch === batch.value)">{{ batch.label }}</button>
          </template>
          <template v-else>
            <button type="button" @click="setBatchFilter('')" :aria-pressed="selectedBatch === ''" :class="batchButtonClass(selectedBatch === '')">All my notices</button>
            <button type="button" @click="setBatchFilter('All')" :aria-pressed="selectedBatch === 'All'" :class="batchButtonClass(selectedBatch === 'All')">University-wide</button>
            <button v-if="user?.batch && user.batch !== 'N/A'" type="button" @click="setBatchFilter(user.batch)" :aria-pressed="selectedBatch === user.batch" :class="batchButtonClass(selectedBatch === user.batch)">Batch {{ user.batch }}</button>
          </template>
        </div>
        </div>
      </section>
      <div class="flex justify-between items-center gap-3 mb-4 text-xs text-[var(--text-secondary)]" aria-live="polite">
        <p>{{ loading ? 'Loading announcements...' : `${total} notice${total === 1 ? '' : 's'} found` }}</p>
        <button v-if="search || selectedCategory || selectedBatch || selectedSort !== 'newest'" class="font-bold underline" @click="clearFilters">Clear filters</button>
      </div>
      <div v-if="loading" class="space-y-5" aria-busy="true">
        <div v-for="i in 2" :key="i" class="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4 animate-pulse"><div class="h-5 bg-[var(--surface-soft)] rounded w-1/3"></div><div class="h-48 bg-[var(--surface-soft)] rounded-xl"></div><div class="h-4 bg-[var(--surface-soft)] rounded w-2/3"></div></div>
      </div>
      <div v-else-if="error" role="alert" class="rounded-2xl border border-red-500/30 p-5 text-red-500">{{ error }} <button class="underline" @click="loadNotices(1)">Retry</button></div>
      <div v-else-if="!notices.length" class="text-center p-10 bg-[var(--surface)] rounded-2xl border border-[var(--border)]">
        <AppIcon name="inbox" :size="32" class="mx-auto text-[var(--text-secondary)]" /><h2 class="text-xl font-bold mt-4">No notices found</h2>
        <p class="text-sm text-[var(--text-secondary)] mt-2">{{ search || selectedCategory || selectedBatch ? 'Try different filters or search words.' : 'Published announcements will appear here. Check back for campus updates.' }}</p>
        <button v-if="search || selectedCategory || selectedBatch" @click="clearFilters" class="premium-btn-secondary mt-5">Clear filters</button>
      </div>
      <div v-else class="space-y-5">
        <NoticeCard v-for="notice in notices" :key="notice.id" :notice="notice" @saved-change="onSavedChange" @read-change="onReadChange" />
      </div>
      <div class="mt-7"><Pagination :page="page" :total-pages="totalPages" @change="loadNotices" /></div>
    </div>
  </AppLayout>
</template>
<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from '../layouts/AppLayout.vue';
import AppIcon from '../components/AppIcon.vue';
import CategoryFilter from '../components/CategoryFilter.vue';
import NoticeCard from '../components/NoticeCard.vue';
import Pagination from '../components/Pagination.vue';
import noticeService from '../services/noticeService';
import authService from '../services/authService';
const route = useRoute();
const user = computed(() => authService.getCurrentUser());
const notices = ref([]), error = ref(''), selectedCategory = ref(''), selectedBatch = ref(''), selectedSort = ref('newest');
const filtersOpen = ref(false);
const search = ref(typeof route.query.search === 'string' ? route.query.search : '');
const loading = ref(false), page = ref(1), totalPages = ref(1), total = ref(0), notificationRefreshKey = ref(0);
const batches = [{ value: '', label: 'All notices' }, { value: 'All', label: 'University-wide' }, ...['2021','2022','2023','2024','2025','2026'].map(year => ({ value: year, label: `Batch ${year}` }))];
const batchButtonClass = active => ['px-3 py-1.5 rounded-full text-xs font-bold border transition-colors', active ? 'bg-[#FFD60A] text-[#0A0A0A] border-[#FFD60A]' : 'bg-[var(--surface-soft)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[#FFD60A]'];
let debounceTimer, requestNumber = 0;
const loadNotices = async (targetPage = page.value) => {
  clearTimeout(debounceTimer);
  const request = ++requestNumber;
  loading.value = true; error.value = '';
  try {
    const result = await noticeService.getAll({ category: selectedCategory.value || undefined, targetBatch: selectedBatch.value || undefined, search: search.value || undefined, sort: selectedSort.value, page: targetPage, limit: 10 });
    if (request !== requestNumber) return;
    notices.value = result.data; total.value = result.meta.total; page.value = result.meta.page; totalPages.value = result.meta.pages || 1;
  } catch (err) { if (request === requestNumber) error.value = err.response?.data?.message || err.message || 'Unable to load notices.'; }
  finally { if (request === requestNumber) loading.value = false; }
};
const debouncedSearch = () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => loadNotices(1), 350); };
const setBatchFilter = value => { selectedBatch.value = value; loadNotices(1); };
const clearFilters = () => { search.value = ''; selectedCategory.value = ''; selectedBatch.value = ''; selectedSort.value = 'newest'; loadNotices(1); };
const onSavedChange = ({ id, isSaved }) => { notices.value = notices.value.map(n => n.id === id ? { ...n, isSaved } : n); };
const onReadChange = ({ id }) => { notices.value = notices.value.map(n => n.id === id ? { ...n, isRead: true } : n); notificationRefreshKey.value++; };
const refreshOnFocus = () => { if (!loading.value) loadNotices(page.value); };
watch(() => route.query.search, value => { search.value = typeof value === 'string' ? value : ''; loadNotices(1); });
onMounted(() => { loadNotices(1); window.addEventListener('focus', refreshOnFocus); });
onUnmounted(() => { requestNumber++; clearTimeout(debounceTimer); window.removeEventListener('focus', refreshOnFocus); });
</script>
