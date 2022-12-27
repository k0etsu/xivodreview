<script setup lang="ts">
  import { RouterLink } from "vue-router";
  defineProps<{
    msg: string
  }>();
</script>

<template>
  <header>
    <nav class="navBar">
      <h5 class="navLogo">xivodreview</h5>
      <a class="navLink" href="https://github.com/k0etsu/xivodreview" target="_blank">{{ msg }}</a>
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
    margin: 0.5em;
    margin-right: 1em;
  }
  .navLink {
    text-align: left;
    margin-right: 1em;
  }
</style>
