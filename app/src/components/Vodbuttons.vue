<template>
  <button @click="goToTimestamp(timestamp)"><slot></slot></button>
</template>

<script lang="ts">
export default {
  props: ['timestamp', 'player'],
  methods: {
    goToTimestamp(timestamp: string) {
      const vodTime = parseInt(timestamp)
      this.player.seek(vodTime)
    },
  }
}
</script>
