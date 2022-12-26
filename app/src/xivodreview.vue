<script setup lang="ts">
import type { NumericLiteral } from "@babel/types";
import { RouterLink, RouterView } from "vue-router";
import Navigation from "./components/Navigation.vue";
import Vodbuttons from "./components/Vodbuttons.vue";
import { createApp, h } from "vue"
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
            <div class="row no-gutters">
              <input class="twitchUrl inputForm" v-model.lazy.trim="twitch_url" placeholder="Twitch VOD URL" />
              <button class="resetButton" @click="removeIframes">reset twitch player</button>
            </div>
            <div class="row no-gutters">
              <input class="fflogsUrl inputForm" v-model.lazy.trim="fflogs_url" placeholder="FFLogs Report URL" />
              <button class="resetButton" @click="goToTimestamp('6905')">reset fflogs report</button>
            </div>
            <div class="row no-gutters">
              <input id="timeBeforePull" class="inputForm" type="number" v-model="timeBeforePull" />
              <label for="timeBeforePull" class="timeLabel">Time before pull (in seconds)</label>
            </div>
          </div>
        </div>
      </div>
      <div id="reportLinks" class="fflogs-report col-3">
        <!-- <div class="row no-gutters">
          <div class="col-auto">
            <div id="reportLinks" class="linksContainer"></div>
          </div>
          <div class="col">
            <div id="reportButtons" class="buttonsContainer"></div>
          </div>
        </div> -->
      <!-- <Vodbuttons v-for="button in vodButtons" :timestamp="button.timestamp", :player="button.player"/> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      twitch_url: '',
      twitchId: '',
      twitchData: null,
      twitchVodStart: 0,
      player: null,
      fflogs_url: '',
      reportId: '',
      reportData: null,
      reportStart: 0,
      timeBeforePull: 0,
      vodButtons: [],
    }
  },
  watch: {
    twitch_url: function (newValue, oldValue) {
      if (newValue != '') {
        this.getTwitchId(newValue);
        // this.getTwitchData(this.twitchId);
        // this.getTwitchPlayer(this.twitchId);
      }
    },
    fflogs_url: function (newValue, oldValue) {
      if (newValue != '') {
        this.getReportId(newValue)
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
      } finally {
        this.getTwitchData(this.twitchId)
      }
    },
    getTwitchData(videoId: string) {
      fetch("http://localhost:3001/twitch?videoId=" + videoId)
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
      fetch("http://localhost:3001/fflogs?reportId=" + reportId)
        .then(async response => {
          this.reportData = await response.json();
          console.log(this.reportData)
        })
        .catch(error => {
          console.error("there was an error fetching fflogs data: ", error);
        })
        .finally(() => {
          this.reportStart = parseInt(this.reportData.data.reportData.report.startTime);
          this.buildReportLinks()
        })
    },
    buildReportLinks() {
      const linkContainer = document.getElementById("reportLinks");
      // const buttonContainer = document.getElementById("reportButtons")
      linkContainer.innerHTML = "";
      setTimeout(() => {
        const fightIndexByName = {};
        // const timeBeforePull = document.getElementById
        const fightsPerInstance = {};
        this.reportData.data.reportData.report.fights.forEach(fight => {
          fightsPerInstance[fight.name] = fightsPerInstance[fight.name] || [];
          fightsPerInstance[fight.name].push(fight);
        });
        for (const instanceName in fightsPerInstance) {
          const title = document.createElement("h2");
          title.appendChild(document.createTextNode(instanceName));
          linkContainer.appendChild(title);
          fightsPerInstance[instanceName].forEach((fight, pull) => {
            const fightContainer = document.createElement("div");
            const linkCol = document.createElement("div");
            const reportCol = document.createElement("div");
            const buttonCol = document.createElement("div");
            fightContainer.className = "row";
            linkCol.className = "col-auto";
            reportCol.className = "col";
            buttonCol.className = "col";
            // const buttonFights = document.createElement("div");
            const pullTimeInVod = Math.floor((this.reportStart - this.twitchVodStart + fight.startTime) / 1000) - this.timeBeforePull;
            const linkVod = document.createElement("a");
            linkVod.href = this.getVodLink(this.twitchId, pullTimeInVod);
            linkVod.target = "_blank";
            linkVod.className = "vodLink";
            linkVod.appendChild(document.createTextNode(this.getFightName(fight, pull)));
            linkCol.appendChild(linkVod);
            fightContainer.appendChild(linkCol);
            const linkFflogs = document.createElement("a");
            linkFflogs.href = this.getFflogsLink(this.reportId, fight.id);
            linkFflogs.target = "_blank";
            linkFflogs.appendChild(document.createTextNode("Report"));
            reportCol.appendChild(linkFflogs);
            fightContainer.appendChild(reportCol);
            const buttonSkip = document.createElement("button");
            buttonSkip.id = String(pullTimeInVod);
            buttonSkip.setAttribute("onclick", "goToTimestamp(this.id)");
            buttonSkip.innerHTML = "goto pull"
            this.vodButtons.push({"timestamp": pullTimeInVod, "player": this.player})

            const testPlayer = this.player;
            var ComponentApp = createApp({
              setup () {
                return () => h(Vodbuttons, { timestamp: pullTimeInVod, player: testPlayer }, new Date(pullTimeInVod * 1000).toISOString().slice(11, 19))
              }
            });
            ComponentApp.mount(buttonCol);

            // buttonCol.appendChild(buttonSkip)
            fightContainer.appendChild(buttonCol);
            linkContainer?.appendChild(fightContainer);
          })
        }
      })
    },
    getVodLink(videoId, pullTimeInVod) {
      return `https://player.twitch.tv/?parent=localhost&video=${videoId}&t=${pullTimeInVod}`;
    },
    getFflogsLink(reportId, fightId) {
      return `https://www.fflogs.com/reports/${reportId}/#fight=${fightId}`;
    },
    getFightName(fight, pull) {
      return `Pull ${pull + 1} - ${fight.fightPercentage}% - ${new Date(this.reportStart + fight.startTime).toLocaleString()}`;
    },
  }
}
</script>

<style scoped>
.vod-player {
  border-style: solid;
  border-color: plum;
  height: 100%;
}

.deadspace {
  border-style: solid;
  border-color: goldenrod;
  height: 100%;
}

.fflogs-report {
  border-style: solid;
  border-color: turquoise;
  height: 100%;
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
