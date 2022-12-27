<template>
  <div id="twitch-player"></div>
</template>

<script lang="ts">
  export default {
    props: ["player"],
    methods: {
      createTwitchEmbed() {
        const twitchPlayer = document.getElementById("twitch-player");
        twitchPlayer.style.position = "absolute";
        twitchPlayer.style.width = "100%";
        twitchPlayer.style.height = "100%";
        twitchPlayer.style.top = "0";
      }
    }
  }
</script>
