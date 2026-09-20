<template>
    <div
      class="relative overflow-hidden bg-white rounded-3xl border border-slate-200/70 p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 group"
    >
      <!-- Glow -->
      <div
        :class="[
          'absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20',
          glowClass
        ]"
      ></div>
  
      <div class="relative flex justify-between items-start">
        <div>
          <p
            class="text-xs font-bold text-slate-400 uppercase tracking-wider"
          >
            {{ title }}
          </p>
  
          <h2
            class="text-3xl font-black text-slate-900 mt-3"
          >
            {{ value }}
          </h2>
  
          <div class="flex items-center gap-1.5 mt-3">
            <TrendingUp
              v-if="positive"
              :size="14"
              class="text-emerald-500"
            />
  
            <span
              :class="[
                'text-xs font-semibold',
                positive
                  ? 'text-emerald-500'
                  : 'text-slate-400'
              ]"
            >
              {{ description }}
            </span>
          </div>
        </div>
  
        <div
          :class="[
            'w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300',
            iconClass
          ]"
        >
          <component
            :is="icon"
            :size="22"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { TrendingUp } from 'lucide-vue-next';
  
  defineProps({
    title: {
      type: String,
      required: true
    },
  
    value: {
      type: [String, Number],
      required: true
    },
  
    description: {
      type: String,
      default: ''
    },
  
    icon: {
      required: true
    },
  
    iconClass: {
      type: String,
      default: 'bg-indigo-500'
    },
  
    glowClass: {
      type: String,
      default: 'bg-indigo-500'
    },
  
    positive: {
      type: Boolean,
      default: true
    }
  });
  </script>