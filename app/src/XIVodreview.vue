<script setup lang="ts">
  import Navigation from "./components/Navigation.vue";
  import FFlogsReport from "./components/FFlogsReport.vue"
</script>

<template>
  <Navigation class="navHeader" msg="GitHub" />
  <div class="container-fluid overflow-hidden">
    <div class="no-scroll row">
      <div class="col-9">
        <div class="row g-0">
          <div class="vod-player col-12">
            <div id="twitch-player"></div>
          </div>
        </div>
        <div class="row g-0">
          <div class="deadspace col-12">
            <div class="form-group form-floating">
              <input class="twitchUrl form-control" v-model.lazy.trim="twitch_url" placeholder="Twitch VOD URL" />
              <label for="twitchUrl">Twitch VOD URL</label>
            </div>
            <div class="form-group form-floating">
              <input class="fflogsUrl form-control" v-model.lazy.trim="fflogs_url" placeholder="FFLogs Report URL" />
              <label for="fflogsUrl">FFLogs Report URL</label>
            </div>
            <div class="row align-items-center g-0">
              <div class="form-group form-floating col-md-3">
                <input id="timeBeforePull" class="form-control" type="number" v-model="timeBeforePull" />
                <label for="timeBeforePull">Time before pull (in seconds)</label>
              </div>
              <div class="col-md-8 offset-md-1">
                <button class="btn btn-outline-primary col-md-1" @click="submitURLs">Submit</button>
                <button class="btn btn-outline-secondary col-md-1 offset-md-1" @click="resetURLs">Reset</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="fflogs-report overflow-auto col-3" v-if="fightData && player">
        <FFlogsReport
          :fightData="fightData"
          :reportId="reportId"
          :reportStart="reportStart"
          :twitchVodStart="twitchVodStart"
          :timeBeforePull="timeBeforePull"
          :player="player"
        />
      </div>
    </div>
    <!-- <div class="row no-gutters">
      <div class="test-fflogs-report col" v-if="fightData && player">
        <FFlogsReport
          :fightData="fightData"
          :reportId="reportId"
          :reportStart="reportStart"
          :twitchVodStart="twitchVodStart"
          :timeBeforePull="timeBeforePull"
          :player="player"
        />
      </div>
    </div> -->
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      twitch_url: 'https://www.twitch.tv/videos/1674096298',
      twitchId: '',
      twitchData: null,
      twitchVodStart: 0,
      player: null,
      fflogs_url: 'https://www.fflogs.com/reports/6x8YXNjwctfLMdCB',
      reportId: '',
      reportData: null,
      reportStart: 0,
      reportEnd: 0,
      fightData: {},
      timeBeforePull: 0,
      vodButtons: [],
    }
  },
  watch: {
    reportData(newValue, oldValue) {
      const fightsPerInstance = {};
      newValue.data.reportData.report.fights.forEach(fight => {
        fightsPerInstance[fight.name] = fightsPerInstance[fight.name] || [];
        fightsPerInstance[fight.name].push(fight);
      });
      this.fightData = fightsPerInstance;
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
      } finally {
        this.getTwitchData(this.twitchId)
      }
    },
    getTwitchData(videoId: string) {
      fetch("https://api.yamanote.co/twitch?videoId=" + videoId)
        .then(async response => {
          this.twitchData = await response.json();
          console.log(this.twitchData)
        })
        .catch(error => {
          console.error("there was an error fetching twitch data: ", error);
        })
        .finally(() => {
          this.twitchVodStart = parseInt(this.twitchData.timeArr[0].startTime);
          this.getTwitchPlayer(this.twitchId)
        })
    },
    async getTwitchPlayer(videoId: string) {
      var options = {
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
      this.player = new Twitch.Player("twitch-player", options);
      var element = document.getElementById('twitch-player');
      element.style.position = 'absolute';
      element.style.width = "100%";
      element.style.height = "100%";
      element.style.top = "0";
      // player.setVolume(0.5);
    },
    submitURLs() {
      this.getTwitchId(this.twitch_url);
      this.getReportId(this.fflogs_url);
    },
    resetURLs() {
      this.removeIframes();
      // TODO: Clear logs 
    },
    removeIframes() {
      var iframes = document.querySelectorAll('iframe');
      for (var i = 0; i < iframes.length; i++) {
        iframes[i].parentNode.removeChild(iframes[i])
      }
      this.player = null
    },
    testData() {
      console.log(this.twitchData.res.data);
      console.log(this.twitchData.timeArr[0].startTime);
      console.log(this.reportData.data.rateLimitData);
      console.log(this.reportData.data.reportData);
      console.log(this.twitchVodStart);
      console.log(this.reportStart);
    },
    goToTimestamp(timestamp: string) {
      const vodTime = parseInt(timestamp)
      this.player.seek(vodTime)
    },
    getReportId(fflogsUrl: string) {
      try {
        const url = new URL(fflogsUrl);
        var report = url.pathname.split('/');
        var reportIndex = report.indexOf('reports');
        console.log(report[reportIndex + 1]);
        this.reportId = report[reportIndex + 1];
      } catch (error) {
        this.reportId = 'Please enter a valid FFLogs report URL';
      } finally {
        this.getReportData(this.reportId)
      }
    },
    getReportData(reportId: string) {
      fetch("https://api.yamanote.co/fflogs?reportId=" + reportId)
        .then(async response => {
          this.reportData = await response.json();
          console.log(this.reportData)
        })
        .catch(error => {
          console.error("there was an error fetching fflogs data: ", error);
        })
        .finally(() => {
          this.reportStart = parseInt(this.reportData.data.reportData.report.startTime);
          this.reportEnd = parseInt(this.reportData.data.reportData.report.endTime);
          this.getReportDeathData(this.reportId, 0, this.reportEnd - this.reportStart)
        })
    },
    getReportDeathData(reportId, startTime, endTime) {
      fetch(`https://api.yamanote.co/fflogs?reportId=${reportId}&startTime=${startTime}&endTime=${endTime}`)
        .then(async response => {
          this.reportData = await response.json();
          console.log(this.reportData)
        })
        .catch(error => {
          console.error("there was an error fetching fflogs data w/ deaths: ", error);
        })
    },
  }
}
</script>

<style scoped>
/* .navHeader {
  height: 2.5vh;
} */
.no-scroll {
  height: 95.5vh;
}
.vod-player {
  height: 100%;
}

.deadspace {
  height: 100%;
  padding-top: 0.25em;
}

.fflogs-report {
  max-height: 100%;
  padding-left: 1em;
}

.vod-player {
  padding-top: 56.25%;
  position: relative;
  height: 0;
}

.inputForm {
  min-width: 25em;
}

.resetButton {
  min-width: 10em;
  text-align: center;
}

.timeLabel {
  margin-bottom: 0em;
}
</style>
