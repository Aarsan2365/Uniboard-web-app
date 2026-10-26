<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <g v-if="name === 'graduation'">
      <path d="M2 10l10-5 10 5-10 5-10-5z" />
      <path d="M6 12v5c3 2 9 2 12 0v-5" />
    </g>
    <g v-else-if="name === 'dashboard'">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </g>
    <g v-else-if="name === 'megaphone'">
      <path d="M3 11v2a2 2 0 0 0 2 2h2l2 4h2l-1-4 8-3V8l-8-3H5a2 2 0 0 0-2 2v4z" />
      <path d="M18 9a3 3 0 0 1 0 6" />
    </g>
    <g v-else-if="name === 'bookmark'">
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
    </g>
    <g v-else-if="name === 'calendar'">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </g>
    <g v-else-if="name === 'shield'">
      <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </g>
    <g v-else-if="name === 'settings'">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z" />
    </g>
    <g v-else-if="name === 'close'">
      <path d="M18 6L6 18M6 6l12 12" />
    </g>
    <g v-else-if="name === 'menu'">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </g>
    <g v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </g>
    <g v-else-if="name === 'sun'">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </g>
    <g v-else-if="name === 'moon'">
      <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
    </g>
    <g v-else-if="name === 'chevron-down'">
      <path d="M6 9l6 6 6-6" />
    </g>
    <g v-else-if="name === 'chevron-right'">
      <path d="M9 18l6-6-6-6" />
    </g>
    <g v-else-if="name === 'logout'">
      <path d="M10 17l5-5-5-5M15 12H3" />
      <path d="M13 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
    </g>
    <g v-else-if="name === 'user'">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </g>
    <g v-else-if="name === 'bell'">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </g>
    <g v-else-if="name === 'activity'">
      <path d="M3 12h4l2-7 4 14 2-7h6" />
    </g>
    <g v-else-if="name === 'trend-up'">
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </g>
    <g v-else-if="name === 'arrow-right'">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </g>
    <g v-else-if="name === 'book'">
      <path d="M4 4h6a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4z" />
      <path d="M20 4h-6a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h6z" />
    </g>
    <g v-else-if="name === 'party'">
      <path d="M4 20l4-12 8 8-12 4z" />
      <path d="M14 4l1-2M18 6l3-1M17 10l2 2M9 5L7 3" />
    </g>
    <g v-else-if="name === 'alert'">
      <path d="M12 3l10 18H2L12 3z" />
      <path d="M12 9v4M12 17h.01" />
    </g>
    <g v-else-if="name === 'zap'">
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </g>
    <g v-else-if="name === 'key'">
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l9-9M16 7l2 2M14 9l2 2" />
    </g>
    <g v-else-if="name === 'lock'">
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </g>
    <g v-else-if="name === 'eye'">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </g>
    <g v-else-if="name === 'eye-off'">
      <path d="M3 3l18 18M10.6 10.6A3 3 0 0 0 14.4 14.4M9.9 4.2A10.9 10.9 0 0 1 12 4c6 0 10 8 10 8a17.7 17.7 0 0 1-2.1 3M6.7 6.7C3.9 8.6 2 12 2 12s4 8 10 8a9.8 9.8 0 0 0 3.3-.6" />
    </g>
    <g v-else-if="name === 'mail'">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </g>
    <g v-else-if="name === 'inbox'">
      <path d="M4 4h16l2 10v6H2v-6L4 4z" />
      <path d="M2 14h5l2 3h6l2-3h5" />
    </g>
    <g v-else-if="name === 'file-plus'">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M12 12v6M9 15h6" />
    </g>
    <g v-else>
      <circle cx="12" cy="12" r="9" />
    </g>
  </svg>
</template>

<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  strokeWidth: { type: [Number, String], default: 2 },
});
</script>
