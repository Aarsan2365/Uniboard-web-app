<template>
  <AppLayout>
    <div class="max-w-[1500px] mx-auto p-5 md:p-8 page-enter">
      <section class="relative overflow-hidden rounded-[30px] bg-[#111111] border border-[#292929] text-white p-7 md:p-10 shadow-xl">
        <div class="absolute -right-20 -top-24 w-96 h-96 bg-yellow-400/10 blur-[120px] rounded-full"></div>
        <div class="relative z-10 flex flex-col xl:flex-row justify-between xl:items-center gap-10">
          <div>
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-[#D4D4D4]">
              <AppIcon name="activity" :size="14" /> University Notice Management System
            </div>
            <h1 class="text-3xl md:text-5xl font-black tracking-tight mt-6 text-white">
              Welcome back, <span class="text-[#FFD60A]">{{ firstName }}</span> 👋
            </h1>
            <p class="mt-4 text-[#BDBDBD] max-w-2xl leading-relaxed">
              Stay connected with university announcements, academic updates, events and important notices from one centralized digital platform.
            </p>
            <div class="flex flex-wrap gap-3 mt-7">
              <router-link v-if="user?.role === 'admin'" to="/admin" class="premium-btn-primary">Create / Manage Announcements</router-link>
              <router-link to="/feed" class="flex items-center gap-2 bg-[#FFD60A] text-[#0A0A0A] px-5 py-3 rounded-xl font-bold text-sm hover:bg-[#FFEA70] transition">
                <AppIcon name="megaphone" :size="17" /> Browse Notices
              </router-link>
              <router-link to="/events" class="flex items-center gap-2 bg-transparent border border-[#3A3A3A] text-white px-5 py-3 rounded-xl font-bold text-sm hover:border-[#FFD60A] hover:text-[#FFD60A] transition">
                <AppIcon name="calendar" :size="17" /> View Events
              </router-link>
            </div>
          </div>

          <div class="w-full xl:w-[330px] bg-[#222222] border border-[#3A3A3A] rounded-3xl p-6">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-xs text-[#A3A3A3] font-semibold">Today's Overview</p>
                <h3 class="text-xl font-black mt-1 text-white">Campus Activity</h3>
              </div>
              <div class="w-12 h-12 rounded-2xl bg-[#FFD60A] text-[#0A0A0A] flex items-center justify-center">
                <AppIcon name="activity" :size="22" />
              </div>
            </div>
            <div class="mt-7 space-y-5">
              <div>
                <div class="flex justify-between text-xs mb-2"><span class="text-[#A3A3A3]">Notices viewed</span><span class="font-bold">{{ viewedPercent }}%</span></div>
                <div class="h-2 bg-white/10 rounded-full overflow-hidden"><div class="h-full bg-[#FFD60A] rounded-full" :style="{ width: `${viewedPercent}%` }"></div></div>
              </div>
              <div>
                <div class="flex justify-between text-xs mb-2"><span class="text-[#A3A3A3]">Notices saved</span><span class="font-bold">{{ savedPercent }}%</span></div>
                <div class="h-2 bg-white/10 rounded-full overflow-hidden"><div class="h-full bg-[#F5F5F5] rounded-full" :style="{ width: `${savedPercent}%` }"></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <button class="premium-btn-secondary mt-5" :disabled="loading" @click="loadDashboard">Refresh dashboard</button>
      <section class="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-7">
        <DashboardStatCard title="Total Notices" :value="stats.total" description="Available to your account" icon-name="megaphone" />
        <DashboardStatCard title="Unread Notices" :value="stats.unread" description="Needs your attention" icon-name="bell" />
        <DashboardStatCard title="University Events" :value="stats.events" description="Event announcements" icon-name="calendar" />
        <DashboardStatCard title="Saved Notices" :value="stats.saved" description="Your collection" :positive="false" icon-name="bookmark" />
      </section>

      <section class="grid xl:grid-cols-[1fr_370px] gap-6 mt-7">
        <div class="bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden transition-colors duration-300">
          <div class="p-6 flex justify-between items-center border-b border-[var(--border)]">
            <div>
              <h2 class="text-xl font-black text-[var(--text-main)]">Recent Notices</h2>
              <p class="text-xs text-[var(--text-secondary)] mt-1">Latest announcements from your university</p>
            </div>
            <router-link to="/feed" class="flex items-center gap-1 text-sm font-bold text-[#8A7200] dark:text-[#FFD60A] hover:underline">
              View all <AppIcon name="arrow-right" :size="15" />
            </router-link>
          </div>

          <div v-if="loading" class="p-6 text-sm text-[var(--text-secondary)]">Loading recent notices...</div>
          <div v-if="error" role="alert" class="p-6 text-red-500">{{ error }} <button class="underline" @click="loadDashboard">Retry</button></div>
          <div v-if="!loading && !error && recentNotices.length === 0" class="p-8 text-center text-[var(--text-secondary)]">No notices available yet.</div>
          <div v-if="!loading && recentNotices.length" class="divide-y divide-[var(--border)]">
            <router-link v-for="notice in recentNotices" :key="notice.id" to="/feed" class="block p-6 hover:bg-[var(--surface-hover)] transition cursor-pointer group">
              <div class="flex gap-4">
                <div class="w-12 h-12 rounded-2xl shrink-0 bg-[#FFD60A] text-[#0A0A0A] flex items-center justify-center">
                  <AppIcon :name="noticeIcon(notice.category)" :size="20" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap gap-2">
                    <span class="px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-wider bg-[#FFD60A] text-[#0A0A0A]">{{ notice.category }}</span>
                    <span class="px-3 py-1 rounded-full text-[10px] font-semibold bg-[var(--surface-soft)] text-[var(--text-secondary)]">{{ relativeDate(notice.createdAt) }}</span>
                  </div>
                  <h3 class="font-bold text-[var(--text-main)] mt-3 group-hover:text-[#8A7200] dark:group-hover:text-[#FFD60A] transition">{{ notice.title }}</h3>
                  <p class="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed line-clamp-2">{{ notice.body }}</p>
                </div>
                <AppIcon name="chevron-right" :size="19" class="hidden md:block self-center text-[var(--text-muted)] group-hover:text-[#FFD60A] transition" />
              </div>
            </router-link>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-[var(--surface)] rounded-3xl border border-[var(--border)] p-6 shadow-sm transition-colors duration-300">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-black text-[var(--text-main)]">Upcoming Events</h2>
                <p class="text-xs text-[var(--text-secondary)] mt-1">Important university dates</p>
              </div>
              <div class="w-10 h-10 rounded-xl bg-[#FFD60A] text-[#0A0A0A] flex items-center justify-center"><AppIcon name="calendar" :size="19" /></div>
            </div>
            <p v-if="!events.length" class="mt-6 text-sm text-[var(--text-secondary)]">No upcoming events yet.</p>
            <div v-else class="space-y-5 mt-6">
              <router-link v-for="event in events" :key="event.id" to="/events" class="flex items-center gap-4 hover:opacity-80 transition">
                <div class="w-14 h-16 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border)] flex flex-col items-center justify-center shrink-0">
                  <span class="text-[10px] text-[#8A7200] dark:text-[#FFD60A] uppercase font-bold">{{ eventMonth(event.eventDate) }}</span>
                  <span class="text-xl font-black text-[var(--text-main)]">{{ eventDay(event.eventDate) }}</span>
                </div>
                <div><h3 class="text-sm font-bold text-[var(--text-main)]">{{ event.title }}</h3><p class="text-xs text-[var(--text-secondary)] mt-1">{{ event.eventLocation || 'Location to be announced' }}</p></div>
              </router-link>
            </div>
            <router-link to="/events" class="inline-block mt-5 text-sm font-bold text-[#8A7200] dark:text-[#FFD60A]">View all events →</router-link>
          </div>

          <div class="relative overflow-hidden bg-[#202020] rounded-3xl p-6 text-white border border-[#303030]">
            <div class="relative">
              <div class="w-12 h-12 rounded-2xl bg-[#FFD60A] text-[#0A0A0A] flex items-center justify-center"><AppIcon name="zap" :size="22" /></div>
              <h2 class="text-xl font-black text-white mt-5">Never miss an update</h2>
              <p class="text-sm text-[#BDBDBD] leading-relaxed mt-2">Keep checking UniBoard for important academic announcements and university updates.</p>
              <router-link to="/feed" class="inline-flex items-center gap-2 mt-5 px-4 py-3 bg-[#FFD60A] text-[#0A0A0A] rounded-xl text-sm font-bold hover:bg-[#FFEA70] transition">
                Open Notice Feed <AppIcon name="arrow-right" :size="15" />
              </router-link>
            </div>
          </div>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import AppLayout from '../layouts/AppLayout.vue';
import DashboardStatCard from '../components/DashboardStatCard.vue';
import AppIcon from '../components/AppIcon.vue';
import authService from '../services/authService';
import noticeService from '../services/noticeService';

const user = computed(() => authService.getCurrentUser());
const firstName = computed(() => user.value?.name?.split(' ')[0] || 'Student');
const loading = ref(false);
const error = ref('');
const recentNotices = ref([]);
const stats = reactive({ total: 0, unread: 0, events: 0, saved: 0 });
const events = ref([]);
const eventMonth = date => new Date(date).toLocaleString('en-GB', { month: 'short' });
const eventDay = date => new Date(date).getDate();

const viewedPercent = computed(() => stats.total ? Math.max(0, Math.min(100, Math.round(((stats.total - stats.unread) / stats.total) * 100))) : 0);
const savedPercent = computed(() => stats.total ? Math.min(100, Math.round((stats.saved / stats.total) * 100)) : 0);

const relativeDate = (value) => {
  if (!value) return 'Recently';
  const diff = Date.now() - new Date(value).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'Yesterday' : `${days} days ago`;
};

const noticeIcon = (category) => {
  if (category === 'Events') return 'party';
  if (category === 'Exam Schedules' || category === 'Academic') return 'book';
  if (category === 'Sports') return 'activity';
  return 'megaphone';
};

const loadDashboard = async () => {
  loading.value = true;
  error.value = '';
  try {
    const results = await Promise.allSettled([
      noticeService.getAll({ page: 1, limit: 3 }),
      noticeService.getUnreadCount(),
      noticeService.getUpcomingEvents(),
      noticeService.getSaved()
    ]);
    const [noticeResult, unread, eventsResult, savedResult] = results.map(r => r.status === 'fulfilled' ? r.value : {});
    if (results[0].status === 'rejected') throw results[0].reason;
    if (results.some(r => r.status === 'rejected')) error.value = 'Some dashboard counts could not load. Please retry.';
    recentNotices.value = noticeResult.data || [];
    stats.total = noticeResult.meta?.total || 0;
    stats.unread = typeof unread === 'number' ? unread : 0;
    stats.events = eventsResult.meta?.total || 0;
    stats.saved = savedResult.data?.length || 0;
    events.value = (eventsResult.data || []).slice(0, 3);
  } catch (err) {
    error.value = err.response?.data?.message || 'Unable to load your dashboard.';
  } finally { loading.value = false; }
};

const refreshOnFocus = () => { if (!loading.value) loadDashboard(); };
onMounted(() => { loadDashboard(); window.addEventListener('focus', refreshOnFocus); });
onUnmounted(() => window.removeEventListener('focus', refreshOnFocus));
</script>
