<template>
  <AppLayout>
    <div class="max-w-5xl mx-auto px-5 md:px-8 py-8 md:py-10 page-enter">
      <div class="mb-8">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFD60A] text-[#0A0A0A] text-xs font-bold mb-4">
          <AppIcon name="shield" :size="14" /> Administration
        </div>
        <h1 class="text-3xl md:text-4xl font-black text-[var(--text-main)] tracking-tight">Admin Console</h1>
        <p class="text-sm text-[var(--text-secondary)] mt-2">Compose announcements, edit published notices and review read receipts.</p>
      </div>

      <div class="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-5 md:p-7 shadow-sm mb-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-11 h-11 rounded-2xl bg-[#FFD60A] text-[#0A0A0A] flex items-center justify-center"><AppIcon name="file-plus" :size="20" /></div>
          <div>
            <h2 class="font-black text-lg text-[var(--text-main)]">{{ editingNotice ? 'Edit Notice' : 'Create Notice' }}</h2>
            <p class="text-xs text-[var(--text-secondary)] mt-1">Publish announcements to students.</p>
          </div>
        </div>
        <NoticeForm :key="formKey" :initial-notice="editingNotice" :submitting="submitting" @submit="handleSubmit" @cancel="editingNotice = null" />
        <p v-if="formError" role="alert" class="mt-3 text-sm text-red-500">{{ formError }}</p>
        <p v-if="formSuccess" role="status" class="mt-3 text-sm text-emerald-500">{{ formSuccess }}</p>
      </div>

      <div class="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-5 md:p-7 shadow-sm">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
          <div>
            <h2 class="text-xl font-black text-[var(--text-main)]">Manage Notices</h2>
            <p class="text-xs text-[var(--text-secondary)] mt-1">Edit, delete and inspect published notices.</p>
          </div>
          <div class="relative w-full md:w-72">
            <AppIcon name="search" :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input v-model="search" @input="debouncedSearch" type="text" placeholder="Filter by title..." class="premium-input pl-10" />
          </div>
        </div>

        <div v-if="loading" class="space-y-5 mt-6">
          <div v-for="i in 2" :key="i" class="border border-[var(--border)] rounded-2xl p-5 space-y-3 animate-pulse">
            <div class="h-5 w-20 bg-[var(--surface-soft)] rounded-full"></div>
            <div class="h-6 bg-[var(--surface-soft)] rounded-lg w-2/3"></div>
          </div>
        </div>

        <p v-else-if="listError" role="alert" class="mt-6 text-sm text-red-500">{{ listError }} <button class="underline" @click="loadNotices(1)">Retry</button></p>
        <div v-else-if="notices.length === 0" class="text-center py-12">
          <div class="mx-auto h-14 w-14 rounded-2xl bg-[#FFD60A] text-[#0A0A0A] flex items-center justify-center"><AppIcon name="inbox" :size="25" /></div>
          <p class="font-bold text-[var(--text-main)] mt-4">No notices found</p>
        </div>

        <div v-else class="space-y-5 mt-6 animate-slide-up">
          <NoticeCard
            v-for="notice in notices"
            :key="notice.id"
            :notice="notice"
            :editable="true"
            @edit="startEdit"
            @delete="handleDelete"
            @show-reads="viewingReadsFor = $event"
          />
        </div>
        <div class="mt-7"><Pagination :page="page" :total-pages="totalPages" @change="loadNotices" /></div>
      </div>
    </div>

    <ReadReceiptsModal v-if="viewingReadsFor" :notice-id="viewingReadsFor.id" @close="viewingReadsFor = null" />
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AppLayout from '../layouts/AppLayout.vue';
import AppIcon from '../components/AppIcon.vue';
import NoticeForm from '../components/NoticeForm.vue';
import NoticeCard from '../components/NoticeCard.vue';
import Pagination from '../components/Pagination.vue';
import ReadReceiptsModal from '../components/ReadReceiptsModal.vue';
import noticeService from '../services/noticeService';

const startEdit = notice => { editingNotice.value = notice; formError.value = ''; formSuccess.value = ''; window.scrollTo({ top: 0, behavior: 'smooth' }); };
const notices = ref([]);
const submitting = ref(false);
const formKey = ref(0);
const formError = ref('');
const formSuccess = ref('');
const listError = ref('');
const loading = ref(false);
const editingNotice = ref(null);
const viewingReadsFor = ref(null);
const search = ref('');
const page = ref(1);
const totalPages = ref(1);
let searchDebounceTimer = null;
const debouncedSearch = () => { clearTimeout(searchDebounceTimer); searchDebounceTimer = setTimeout(() => loadNotices(1), 350); };

const loadNotices = async (targetPage = page.value) => {
  loading.value = true;
  listError.value = '';
  try {
    const { data, meta } = await noticeService.getAll({ search: search.value || undefined, page: targetPage, limit: 10 });
    notices.value = data;
    page.value = meta.page;
    totalPages.value = meta.pages || 1;
  } catch (err) {
    listError.value = err.response?.data?.message || 'Unable to load notices.';
  } finally { loading.value = false; }
};

const handleSubmit = async (formData) => {
  if (submitting.value) return;
  submitting.value = true;
  formError.value = '';
  formSuccess.value = '';
  try {
    if (editingNotice.value) {
      await noticeService.update(editingNotice.value.id, formData);
      formSuccess.value = 'Notice updated successfully.';
    } else {
      await noticeService.create(formData);
      formSuccess.value = 'Notice published successfully.';
    }
    editingNotice.value = null;
    formKey.value++;
    await loadNotices(1);
  } catch (err) {
    formError.value = err.response?.data?.message || err.message || 'Unable to save notice.';
  } finally { submitting.value = false; }
};

const handleDelete = async (notice) => {
  if (!confirm(`Delete "${notice.title}"? This cannot be undone.`)) return;
  formError.value = '';
  try {
    await noticeService.remove(notice.id);
    if (editingNotice.value?.id === notice.id) editingNotice.value = null;
    await loadNotices(notices.value.length === 1 ? Math.max(1, page.value - 1) : page.value);
  } catch (err) {
    formError.value = err.response?.data?.message || 'Unable to delete notice.';
  }
};

onMounted(() => loadNotices(1));
</script>
