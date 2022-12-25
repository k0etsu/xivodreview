<script setup lang="ts">
  import { RouterLink } from "vue-router";
  defineProps<{
    msg: string
  }>();
</script>

<template>
  <header>
    <nav class="navBar">
      <p class="navLogo">xivodreview</p>
      <RouterLink class="navLink" to="/">Home</RouterLink>
      <RouterLink class="navLink" to="/">{{ msg }}</RouterLink>
    </nav>
  </header>
</template>

<style>
  .navBar {
    white-space: nowrap;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }
  .navBar * {
    display: inline;
  }
  .navLogo {
    margin: 0.5em
  }
  .navLink {
    text-align: left;
    margin-right: 1em;
  }
</style>
