<template>
  <AppLayout
    :notification-refresh-key="notificationRefreshKey"
  >
    <div
      class="max-w-5xl mx-auto px-5 md:px-8 py-8 md:py-10 animate-fade-in"
    >
      <!-- Header -->
      <div class="mb-8">
        <div
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-4"
        >
          <Megaphone :size="14" />
          Campus Announcements
        </div>

        <h1
          class="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight"
        >
          Notice Feed
        </h1>

        <p
          class="text-sm text-slate-500 dark:text-slate-400 mt-2"
        >
          Stay up-to-date with the latest campus announcements,
          sorted by date.
        </p>
      </div>

      <!-- Search + Filters -->
      <div
        class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 p-5 md:p-6 shadow-sm mb-7"
      >
        <!-- Search -->
        <div class="relative">
          <Search
            :size="18"
            class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            v-model="search"
            @input="debouncedSearch"
            type="text"
            placeholder="Search titles or announcement content..."
            class="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition"
          />
        </div>

        <!-- Existing Category Filter -->
        <div class="mt-5">
          <CategoryFilter
            v-model="selectedCategory"
            @update:modelValue="() => loadNotices(1)"
          />
        </div>

        <!-- Student Batch -->
        <div
          v-if="
            user?.role === 'student' &&
            user?.batch &&
            user.batch !== 'N/A'
          "
          class="flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-4"
        >
          <span
            class="text-xs font-semibold text-slate-400"
          >
            Audience:
          </span>

          <button
            @click="setBatchFilter('')"
            :class="[
              'px-4 py-2 rounded-full text-xs font-bold border transition',
              selectedBatch === ''
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            ]"
          >
            All My Feeds
          </button>

          <button
            @click="setBatchFilter(user.batch)"
            :class="[
              'px-4 py-2 rounded-full text-xs font-bold border transition',
              selectedBatch === user.batch
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            ]"
          >
            Batch {{ user.batch }}
          </button>
        </div>

        <!-- Admin Batch -->
        <div
          v-else-if="user?.role === 'admin'"
          class="flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-4"
        >
          <span
            class="text-xs font-semibold text-slate-400 mr-1"
          >
            Audience:
          </span>

          <button
            v-for="batch in batches"
            :key="batch"
            @click="
              setBatchFilter(
                batch === 'All' ? '' : batch
              )
            "
            :class="[
              'px-4 py-2 rounded-full text-xs font-bold border transition',
              (selectedBatch === '' && batch === 'All') ||
              selectedBatch === batch
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            ]"
          >
            {{
              batch === 'All'
                ? 'All Batches'
                : `Batch ${batch}`
            }}
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div
        v-if="loading"
        class="space-y-5"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-pulse"
        >
          <div class="flex gap-2">
            <div
              class="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"
            ></div>

            <div
              class="h-6 w-28 bg-slate-100 dark:bg-slate-800 rounded-full"
            ></div>
          </div>

          <div
            class="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4"
          ></div>

          <div
            class="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-full"
          ></div>

          <div
            class="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-5/6"
          ></div>
        </div>
      </div>

      <!-- Empty -->
      <div
        v-else-if="notices.length === 0"
        class="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm"
      >
        <div
          class="mx-auto h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mb-4"
        >
          <Inbox :size="28" />
        </div>

        <h3
          class="text-lg font-black text-slate-800 dark:text-slate-100"
        >
          No notices found
        </h3>

        <p
          class="text-sm text-slate-500 dark:text-slate-400 mt-2"
        >
          Try changing your filters or search keywords.
        </p>

        <button
          @click="clearFilters"
          class="mt-5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition"
        >
          Clear Filters
        </button>
      </div>

      <!-- Notices -->
      <div
        v-else
        class="space-y-5 animate-slide-up"
      >
        <NoticeCard
          v-for="notice in notices"
          :key="notice.id"
          :notice="notice"
        />
      </div>

      <!-- Pagination -->
      <div class="mt-8">
        <Pagination
          :page="page"
          :total-pages="totalPages"
          @change="loadNotices"
        />
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import {
  ref,
  onMounted,
  computed
} from 'vue';

import {
  Megaphone,
  Search,
  Inbox
} from 'lucide-vue-next';

import AppLayout from '../layouts/AppLayout.vue';

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

const batches = [
  'All',
  '2021',
  '2022',
  '2023',
  '2024',
  '2025'
];

const user = computed(() =>
  authService.getCurrentUser()
);

const setBatchFilter = (batchValue) => {
  selectedBatch.value = batchValue;

  loadNotices(1);
};

const clearFilters = () => {
  search.value = '';
  selectedCategory.value = '';
  selectedBatch.value = '';

  loadNotices(1);
};

let searchDebounceTimer = null;

const debouncedSearch = () => {
  clearTimeout(searchDebounceTimer);

  searchDebounceTimer = setTimeout(() => {
    loadNotices(1);
  }, 350);
};

const loadNotices = async (
  targetPage = page.value
) => {
  loading.value = true;

  try {
    const { data, meta } =
      await noticeService.getAll({
        category:
          selectedCategory.value || undefined,

        targetBatch:
          selectedBatch.value || undefined,

        search:
          search.value || undefined,

        page: targetPage,

        limit: 10
      });

    notices.value = data;

    page.value = meta.page;

    totalPages.value =
      meta.pages || 1;

    /*
      Mark displayed notices as read.

      This keeps your original project
      notification behaviour.
    */
    await Promise.all(
      data.map((notice) =>
        noticeService.markAsRead(notice.id)
      )
    );

    notificationRefreshKey.value++;
  } catch (error) {
    console.error(
      'Failed to load notices:',
      error
    );
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadNotices(1);
});
</script>