<template>
  <div class="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-16 animate-fade-in">
    <Navbar />
    <main class="max-w-3xl mx-auto px-6 py-10 space-y-8">
      <div class="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 class="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Admin Console</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1.5">Compose new announcements, edit published notices, and review read receipts.</p>
      </div>

      <NoticeForm
        :initial-notice="editingNotice"
        @submit="handleSubmit"
        @cancel="editingNotice = null"
      />

      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h2 class="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight">Manage Notices</h2>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              v-model="search"
              @input="debouncedSearch"
              type="text"
              placeholder="Filter by title..."
              class="premium-input pl-8 py-1.5 w-52"
            />
          </div>
        </div>

        <div v-if="loading" class="space-y-4">
          <div v-for="i in 2" :key="i" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-2.5 animate-pulse">
            <div class="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
            <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
          </div>
        </div>
        
        <div v-else class="space-y-4 animate-slide-up">
          <NoticeCard
            v-for="notice in notices"
            :key="notice.id"
            :notice="notice"
            :editable="true"
            @edit="editingNotice = $event"
            @delete="handleDelete"
            @show-reads="viewingReadsFor = $event"
          />
        </div>

        <Pagination :page="page" :total-pages="totalPages" @change="loadNotices" />
      </div>
    </main>

    <ReadReceiptsModal
      v-if="viewingReadsFor"
      :notice-id="viewingReadsFor.id"
      @close="viewingReadsFor = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Navbar from '../components/Navbar.vue';
import NoticeForm from '../components/NoticeForm.vue';
import NoticeCard from '../components/NoticeCard.vue';
import Pagination from '../components/Pagination.vue';
import ReadReceiptsModal from '../components/ReadReceiptsModal.vue';
import noticeService from '../services/noticeService';

const notices = ref([]);
const loading = ref(false);
const editingNotice = ref(null);
const viewingReadsFor = ref(null);
const search = ref('');
const page = ref(1);
const totalPages = ref(1);

let searchDebounceTimer = null;
const debouncedSearch = () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => loadNotices(1), 350);
};

const loadNotices = async (targetPage = page.value) => {
  loading.value = true;
  try {
    const { data, meta } = await noticeService.getAll({
      search: search.value || undefined,
      page: targetPage,
      limit: 10,
    });
    notices.value = data;
    page.value = meta.page;
    totalPages.value = meta.pages || 1;
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async (formData) => {
  if (editingNotice.value) {
    await noticeService.update(editingNotice.value.id, formData);
    editingNotice.value = null;
  } else {
    await noticeService.create(formData);
  }
  await loadNotices(1);
};

const handleDelete = async (notice) => {
  if (!confirm(`Delete "${notice.title}"? This cannot be undone.`)) return;
  await noticeService.remove(notice.id);
  await loadNotices();
};

onMounted(() => loadNotices(1));
</script>
