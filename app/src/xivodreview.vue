<script setup lang="ts">
import type { NumericLiteral } from "@babel/types";
import { RouterLink, RouterView } from "vue-router";
import Navigation from "./components/Navigation.vue";
import report_input from "./views/report_input.vue";
</script>

<template>
  <div class="container-fluid">
    <Navigation msg="test" />
    <!-- <report_input /> -->
    <div class="row no-gutters h-100">
      <div class="col-9">
        <div class="row no-gutters">
          <div class="vod-player col-12">
            <div id="twitchplayer"></div>
          </div>
        </div>
        <div class="row no-gutters">
          <div class="deadspace col-12 order-last">
            <button @click="removeIframes">reset twitch player</button>
            <input class="twitchUrl" v-model.lazy.trim="twitch_url" placeholder="Twitch VOD URL" />
          </div>
        </div>
      </div>
      <div class="fflogs-report col-3">c</div>
    </div>
  </div>
</template>

<script lang="ts">
  export default {
    data() {
      return {
        twitch_url: '',
        twitchId: '',
        player: null
      }
    },
    watch: {
      twitch_url: function(newValue, oldValue) {
        if (newValue != '') {
          var twitchId = this.getTwitchId(newValue);
          var twitchPlayer = this.getTwitchPlayer(this.twitchId);
        }
      }
    },
    methods: {
      async getTwitchId(twitchUrl: string) {
        try {
          const url = new URL(twitchUrl);
          var video = url.pathname.split('/');
          var videoIndex = video.indexOf('videos');
          console.log(video[videoIndex + 1]);
          this.twitchId = video[videoIndex + 1];
        } catch (error) {
          this.twitchId = 'Please enter a valid Twitch VOD URL';
        }
      },
      async getTwitchPlayer(videoId: string) {
        var options = {
          // width: window.innerWidth / 12 * 9,
          width: "100%",
          height: "100%",
          video: videoId,
          // only needed if your site is also embedded on embed.example.com and othersite.example.com
          // parent: ["embed.example.com"]
          autoplay: false
        };
        if (this.player != null) {
          this.removeIframes()
        }
        this.player = new Twitch.Player("twitchplayer", options);
        var element = document.getElementById('twitchplayer');
        element.style.position = 'absolute';
        element.style.width = "100%";
        element.style.height = "100%";
        element.style.top = "0";
        // player.setVolume(0.5);
      },
      removeIframes() {
        var iframes = document.querySelectorAll('iframe');
        for (var i = 0; i < iframes.length; i++) {
          iframes[i].parentNode.removeChild(iframes[i])
        }
        this.player = null
      }
    }
  }
</script>

<style scoped>
.vod-player {
    background: purple;
    height: 100%;
  }
  .deadspace {
    background: white;
    height: 100%;
  }
  .fflogs-report {
    background: teal;
    height: 100%;
  }
  .vod-player {
    padding-top: 56.25%;
    position: relative;
    height: 0;
  }
  /* .vod-player iframe {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
  } */
</style>
