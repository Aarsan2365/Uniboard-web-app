<template>
  <!-- RouterView renders the matched view; all layout (Navbar etc.)
       lives inside individual views so Login/Register can stay full-screen
       without a navbar. -->
  <router-view />
</template>

<script setup>
// No logic needed here — App.vue is purely a shell for the router.
</script>
