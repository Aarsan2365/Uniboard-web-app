<!--
  components/CommentSection.vue

  Self-contained: fetches its own comments on mount, given a noticeId
  prop. Any logged-in user can post; a user can delete their own
  comment (admins can delete any), matching the backend rule exactly.
-->
<template>
  <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
    <div class="flex items-center gap-1.5">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
      <span class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Comments</span>
    </div>

    <p v-if="loading" class="text-xs text-slate-400 animate-pulse">Loading discussion...</p>

    <div v-else class="space-y-3">
      <div v-for="comment in comments" :key="comment.id" class="flex items-start gap-3 text-sm animate-slide-up group">
        <div class="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-400 flex items-center justify-center text-[10px] font-bold uppercase shrink-0 mt-0.5">
          {{ comment.author?.name ? comment.author.name[0] : '?' }}
        </div>
        
        <div class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-xl px-3 py-2">
          <div class="flex items-center justify-between gap-2 mb-1">
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-xs text-slate-800 dark:text-slate-200">{{ comment.author?.name }}</span>
              <span
                v-if="comment.author?.role === 'admin'"
                class="text-[9px] uppercase font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-full"
              >admin</span>
            </div>
            
            <button
              v-if="canDelete(comment)"
              @click="handleDelete(comment)"
              class="text-[10px] font-semibold text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              Delete
            </button>
          </div>
          
          <p class="text-slate-600 dark:text-slate-400 text-xs leading-relaxed whitespace-pre-line">{{ comment.body }}</p>
        </div>
      </div>
      
      <p v-if="comments.length === 0" class="text-xs text-slate-400 dark:text-slate-500 pl-1">No comments posted yet. Be the first to start the discussion!</p>
    </div>

    <form @submit.prevent="handleSubmit" class="flex gap-2 pt-1">
      <input
        v-model="newComment"
        type="text"
        maxlength="500"
        placeholder="Add a comment..."
        class="premium-input py-1.5 px-3"
      />
      <button
        type="submit"
        :disabled="!newComment.trim()"
        class="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-40 disabled:pointer-events-none transition-all"
      >
        Post
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import commentService from '../services/commentService';
import authService from '../services/authService';

const props = defineProps({
  noticeId: { type: [Number, String], required: true },
});

const comments = ref([]);
const newComment = ref('');
const loading = ref(true);
const currentUser = authService.getCurrentUser();

const load = async () => {
  loading.value = true;
  try {
    comments.value = await commentService.getForNotice(props.noticeId);
  } finally {
    loading.value = false;
  }
};

const canDelete = (comment) =>
  currentUser?.role === 'admin' || comment.userId === currentUser?.id;

const handleSubmit = async () => {
  const body = newComment.value.trim();
  if (!body) return;
  const created = await commentService.create(props.noticeId, body);
  comments.value.push(created);
  newComment.value = '';
};

const handleDelete = async (comment) => {
  await commentService.remove(comment.id);
  comments.value = comments.value.filter((c) => c.id !== comment.id);
};

onMounted(load);
</script>
