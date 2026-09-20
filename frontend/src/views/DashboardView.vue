<template>
    <AppLayout>
  
      <div class="max-w-[1600px] mx-auto p-5 md:p-8">
  
        <!-- Hero -->
        <section
          class="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#10172a] via-[#312e81] to-[#581c87] text-white p-7 md:p-10 shadow-2xl shadow-indigo-900/20"
        >
  
          <!-- Glow -->
          <div
            class="absolute -right-20 -top-24 w-96 h-96 bg-indigo-400/30 blur-[110px] rounded-full"
          ></div>
  
          <div
            class="absolute left-1/3 -bottom-40 w-80 h-80 bg-purple-400/20 blur-[100px] rounded-full"
          ></div>
  
          <div
            class="relative z-10 flex flex-col xl:flex-row justify-between xl:items-center gap-10"
          >
  
            <!-- Left -->
            <div>
              <div
                class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 backdrop-blur-lg rounded-full text-xs font-semibold text-indigo-200"
              >
                <Sparkles :size="14" />
  
                University Notice Management System
              </div>
  
              <h1
                class="text-3xl md:text-5xl font-black tracking-tight mt-6"
              >
                Welcome back,
                <span
                  class="bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent"
                >
                  Student
                </span>
                👋
              </h1>
  
              <p
                class="mt-4 text-slate-300 max-w-2xl leading-relaxed"
              >
                Stay connected with university announcements,
                academic updates, events and important notices
                from one centralized digital platform.
              </p>
  
              <div class="flex flex-wrap gap-3 mt-7">
  
                <router-link
                  to="/feed"
                  class="flex items-center gap-2 bg-white text-slate-900 px-5 py-3 rounded-xl font-bold text-sm shadow-xl hover:-translate-y-0.5 transition"
                >
                  <Megaphone :size="17" />
  
                  Browse Notices
                </router-link>
  
                <button
                  class="flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-lg px-5 py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition"
                >
                  <CalendarDays :size="17" />
  
                  View Events
                </button>
  
              </div>
            </div>
  
            <!-- Activity Card -->
            <div
              class="w-full xl:w-[330px] bg-white/10 border border-white/10 backdrop-blur-xl rounded-3xl p-6"
            >
  
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-xs text-indigo-200 font-semibold">
                    Today's Overview
                  </p>
  
                  <h3 class="text-xl font-black mt-1">
                    Campus Activity
                  </h3>
                </div>
  
                <div
                  class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center"
                >
                  <Activity :size="22" />
                </div>
              </div>
  
              <!-- Progress -->
              <div class="mt-7">
  
                <div
                  class="flex justify-between text-xs mb-2"
                >
                  <span class="text-slate-300">
                    Notices viewed
                  </span>
  
                  <span class="font-bold">
                    76%
                  </span>
                </div>
  
                <div
                  class="h-2 bg-white/10 rounded-full overflow-hidden"
                >
                  <div
                    class="h-full w-[76%] bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full"
                  ></div>
                </div>
  
              </div>
  
              <div class="mt-5">
  
                <div
                  class="flex justify-between text-xs mb-2"
                >
                  <span class="text-slate-300">
                    Weekly activity
                  </span>
  
                  <span class="font-bold">
                    64%
                  </span>
                </div>
  
                <div
                  class="h-2 bg-white/10 rounded-full overflow-hidden"
                >
                  <div
                    class="h-full w-[64%] bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                  ></div>
                </div>
  
              </div>
  
            </div>
          </div>
        </section>
  
        <!-- Statistics -->
        <section
          class="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-7"
        >
  
          <DashboardStatCard
            title="Total Notices"
            value="24"
            description="+12% this month"
            :icon="Megaphone"
            icon-class="bg-gradient-to-br from-indigo-500 to-indigo-700"
            glow-class="bg-indigo-500"
          />
  
          <DashboardStatCard
            title="Unread Notices"
            value="08"
            description="3 added today"
            :icon="BellRing"
            icon-class="bg-gradient-to-br from-rose-500 to-pink-600"
            glow-class="bg-rose-500"
          />
  
          <DashboardStatCard
            title="Campus Events"
            value="05"
            description="+2 this week"
            :icon="CalendarDays"
            icon-class="bg-gradient-to-br from-violet-500 to-purple-700"
            glow-class="bg-purple-500"
          />
  
          <DashboardStatCard
            title="Saved Notices"
            value="11"
            description="Your collection"
            :positive="false"
            :icon="Bookmark"
            icon-class="bg-gradient-to-br from-emerald-500 to-teal-600"
            glow-class="bg-emerald-500"
          />
  
        </section>
  
        <!-- Content -->
        <section
          class="grid xl:grid-cols-[1fr_370px] gap-6 mt-7"
        >
  
          <!-- Recent Notices -->
          <div
            class="bg-white rounded-3xl border border-slate-200/70 shadow-sm overflow-hidden"
          >
  
            <div
              class="p-6 flex justify-between items-center border-b border-slate-100"
            >
              <div>
                <h2 class="text-xl font-black text-slate-900">
                  Recent Notices
                </h2>
  
                <p class="text-xs text-slate-400 mt-1">
                  Latest announcements from your university
                </p>
              </div>
  
              <router-link
                to="/feed"
                class="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700"
              >
                View all
  
                <ArrowRight :size="15" />
              </router-link>
            </div>
  
            <div class="divide-y divide-slate-100">
  
              <div
                v-for="notice in notices"
                :key="notice.title"
                class="p-6 hover:bg-slate-50 transition cursor-pointer group"
              >
  
                <div class="flex gap-4">
  
                  <div
                    :class="[
                      'w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center',
                      notice.iconBackground
                    ]"
                  >
                    <component
                      :is="notice.icon"
                      :size="20"
                      :class="notice.iconColor"
                    />
                  </div>
  
                  <div class="flex-1 min-w-0">
  
                    <div class="flex flex-wrap gap-2">
  
                      <span
                        :class="[
                          'px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-wider',
                          notice.badge
                        ]"
                      >
                        {{ notice.category }}
                      </span>
  
                      <span
                        class="px-3 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500"
                      >
                        {{ notice.time }}
                      </span>
  
                    </div>
  
                    <h3
                      class="font-bold text-slate-800 mt-3 group-hover:text-indigo-600 transition"
                    >
                      {{ notice.title }}
                    </h3>
  
                    <p
                      class="text-sm text-slate-500 mt-2 leading-relaxed"
                    >
                      {{ notice.description }}
                    </p>
  
                  </div>
  
                  <ChevronRight
                    :size="19"
                    class="hidden md:block self-center text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition"
                  />
  
                </div>
  
              </div>
  
            </div>
          </div>
  
          <!-- Right -->
          <div class="space-y-6">
  
            <!-- Upcoming -->
            <div
              class="bg-white rounded-3xl border border-slate-200/70 p-6 shadow-sm"
            >
              <div class="flex items-center justify-between">
  
                <div>
                  <h2 class="text-lg font-black text-slate-900">
                    Upcoming Events
                  </h2>
  
                  <p class="text-xs text-slate-400 mt-1">
                    Important university dates
                  </p>
                </div>
  
                <div
                  class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"
                >
                  <CalendarDays :size="19" />
                </div>
  
              </div>
  
              <div class="space-y-5 mt-6">
  
                <div
                  v-for="event in events"
                  :key="event.title"
                  class="flex items-center gap-4"
                >
  
                  <div
                    class="w-14 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center shrink-0"
                  >
  
                    <span
                      class="text-[10px] text-indigo-500 uppercase font-bold"
                    >
                      {{ event.month }}
                    </span>
  
                    <span
                      class="text-xl font-black text-indigo-700"
                    >
                      {{ event.day }}
                    </span>
  
                  </div>
  
                  <div>
                    <h3
                      class="text-sm font-bold text-slate-800"
                    >
                      {{ event.title }}
                    </h3>
  
                    <p
                      class="text-xs text-slate-400 mt-1"
                    >
                      {{ event.location }}
                    </p>
                  </div>
  
                </div>
  
              </div>
            </div>
  
            <!-- Purple Card -->
            <div
              class="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20"
            >
  
              <div
                class="absolute -right-16 -top-16 w-40 h-40 bg-white/20 rounded-full blur-3xl"
              ></div>
  
              <div class="relative">
  
                <div
                  class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center"
                >
                  <Zap :size="22" />
                </div>
  
                <h2 class="text-xl font-black mt-5">
                  Never miss an update
                </h2>
  
                <p
                  class="text-sm text-indigo-100 leading-relaxed mt-2"
                >
                  Keep checking UniBoard for important
                  academic announcements and university updates.
                </p>
  
                <router-link
                  to="/feed"
                  class="inline-flex items-center gap-2 mt-5 px-4 py-3 bg-white text-indigo-700 rounded-xl text-sm font-bold hover:scale-[1.03] transition"
                >
                  Open Notice Feed
  
                  <ArrowRight :size="15" />
                </router-link>
  
              </div>
  
            </div>
  
          </div>
  
        </section>
  
      </div>
  
    </AppLayout>
  </template>
  
  <script setup>
  import {
    Megaphone,
    BellRing,
    CalendarDays,
    Bookmark,
    Sparkles,
    Activity,
    ArrowRight,
    ChevronRight,
    BookOpen,
    PartyPopper,
    AlertTriangle,
    Zap
  } from 'lucide-vue-next';
  
  import AppLayout from '../layouts/AppLayout.vue';
  
  import DashboardStatCard from '../components/DashboardStatCard.vue';
  
  const notices = [
    {
      category: 'Academic',
      title: 'Semester Examination Timetable Released',
      description:
        'The examination timetable for the current semester has been published. Students are advised to check their examination dates carefully.',
      time: '2 hours ago',
      icon: BookOpen,
      iconBackground: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      badge: 'bg-indigo-50 text-indigo-600'
    },
  
    {
      category: 'Event',
      title: 'Annual Engineering Technology Exhibition',
      description:
        'Students are invited to participate in the upcoming university engineering exhibition and showcase their innovative projects.',
      time: 'Yesterday',
      icon: PartyPopper,
      iconBackground: 'bg-purple-50',
      iconColor: 'text-purple-600',
      badge: 'bg-purple-50 text-purple-600'
    },
  
    {
      category: 'Important',
      title: 'Library Maintenance Announcement',
      description:
        'The university library system will undergo scheduled maintenance during the weekend.',
      time: '2 days ago',
      icon: AlertTriangle,
      iconBackground: 'bg-amber-50',
      iconColor: 'text-amber-600',
      badge: 'bg-amber-50 text-amber-600'
    }
  ];
  
  const events = [
    {
      month: 'SEP',
      day: '23',
      title: 'Project Evaluation',
      location: 'Engineering Faculty'
    },
  
    {
      month: 'SEP',
      day: '27',
      title: 'Technology Exhibition',
      location: 'Main Auditorium'
    },
  
    {
      month: 'OCT',
      day: '02',
      title: 'Academic Workshop',
      location: 'Computer Engineering'
    }
  ];
  </script>