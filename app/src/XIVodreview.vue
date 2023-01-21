<script setup lang="ts">
import NavigationBar from "./components/NavigationBar.vue";
import FFlogsReport from "./components/FFlogsReport.vue";
</script>

<template>
  <NavigationBar
    class="navHeader"
    msg="GitHub"
    @google-auth="googleAuthCallback"
  />
  <div class="container-fluid overflow-hidden">
    <div class="row no-scroll">
      <div class="col-9 player-input">
        <div class="row g-0">
          <div class="vod-player col-12">
            <div id="twitch-player"></div>
            <div id="youtube-player-wrapper">
              <div id="youtube-player"></div>
            </div>
            <div id="google-homepage-shit">
              <h5>Usage</h5>
              <p>
                This application is used for aligning livestream archives
                (Twitch/YouTube) with FFLogs reporting tool for reviewing fights
                and their mechanics. Input a link to both the VOD and the FFLogs
                report and then submit. If you need to use a YouTube livestream,
                you will need to authenticate with Google first.
              </p>
              <br />
              <p>
                <strong> Regarding Google Authentication </strong>
              </p>
              <p>
                This site uses Sign In with Google to authenticate with Google's
                YouTube Live Broadcasts API. This is necessary for users that
                want to use xivodreview with YouTube livestreams (especially if
                they are set to private; assume this would be the case for teams
                that are racing or for those that use copious plugins). No user
                data is stored by this application. Authentication with Google
                is strictly used to reach the YouTube Live Broadcasts API on
                behalf of the user.
              </p>
            </div>
          </div>
        </div>
        <div class="row g-0">
          <div class="deadspace col-12">
            <div class="row g-2">
              <div class="col-6">
                <div class="row align-items-center g-2">
                  <div class="form-group form-floating">
                    <input
                      class="twitchUrl form-control"
                      v-model.lazy.trim="vod_url"
                      placeholder="Twitch VOD URL"
                    />
                    <label for="twitchUrl">Twitch/YouTube VOD URL</label>
                  </div>
                </div>
                <div class="row align-items-center g-2">
                  <div class="form-group form-floating">
                    <input
                      class="fflogsUrl form-control"
                      v-model.lazy.trim="fflogs_url"
                      placeholder="FFLogs Report URL"
                    />
                    <label for="fflogsUrl">FFLogs Report URL</label>
                  </div>
                </div>
                <div class="row align-items-center g-2">
                  <div class="form-group form-floating col-lg-3">
                    <input
                      id="timeBeforePull"
                      class="form-control"
                      type="number"
                      v-model="timeBeforePull"
                    />
                    <label for="timeBeforePull"
                      >Video sync/offset (in seconds)</label
                    >
                  </div>
                  <div class="col-lg-4">
                    <button
                      class="btn btn-outline-primary me-2"
                      @click="submitURLs"
                    >
                      Submit
                    </button>
                    <button
                      class="btn btn-outline-secondary me-2"
                      @click="resetURLs"
                    >
                      Reset
                    </button>
                    <!-- <button type="button" class="btn btn-outline-warning me-2" @click="getYoutubePlayer">
                      test
                    </button> -->
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div class="row align-items-center g-2">
                  <div class="form-group form-floating">
                    <input
                      class="cachedFightName form-control"
                      v-model.trim="cachedFightName"
                      placeholder="Encounter Name"
                    />
                    <label for="cachedFightName">Encounter Name</label>
                  </div>
                </div>
                <div class="row align-items-center g-2">
                  <div class="form-group form-floating">
                    <select
                      id="cachedFights"
                      v-model="cachedFightSelected"
                      class="form-select"
                      aria-label="Cached encounters"
                    >
                      <option
                        v-for="(links, encounter) in cachedFights"
                        :key="encounter"
                        :encounter="encounter"
                        :links="links"
                      >
                        {{ encounter }}
                      </option>
                    </select>
                    <label for="cachedFights">Old Encounters</label>
                  </div>
                </div>
                <div class="row align-items-center g-2">
                  <div class="col-lg-6">
                    <button
                      class="btn btn-outline-info me-1"
                      @click="addCachedFight"
                    >
                      Save Encounter
                    </button>
                    <button
                      class="btn btn-outline-danger"
                      @click="removeCachedFight"
                    >
                      Delete Encounter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="fflogs-report overflow-auto col-3" v-if="fightData && player">
        <FFlogsReport
          :key="reportId"
          :fightData="fightData"
          :deathData="deathData"
          :reportId="reportId"
          :reportStart="reportStart"
          :twitchVodStart="twitchVodStart"
          :timeBeforePull="timeBeforePull"
          :player="player"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      vod_url: "",
      twitchId: "",
      twitchData: null,
      youtubeId: "",
      youtubeData: null,
      twitchVodStart: 0,
      player: null,
      fflogs_url: "",
      reportId: "",
      reportData: null,
      reportStart: 0,
      reportEnd: 0,
      fightData: {},
      playerData: [],
      abilityData: [],
      npcData: [],
      deathData: {},
      timeBeforePull: 0,
      vodButtons: [],
      cachedFights: {},
      cachedFightName: "",
      cachedFightSelected: "",
      googleAuthData: {},
    };
  },
  created() {
    this.getCachedFights();
    this.getCachedGoogleAuth();
  },
  watch: {
    reportData(newValue) {
      const fightsPerInstance = {};
      if (newValue) {
        newValue.data.reportData.report.fights.forEach((fight) => {
          fightsPerInstance[fight.name] = fightsPerInstance[fight.name] || [];
          fightsPerInstance[fight.name].push(fight);
        });
        this.fightData = fightsPerInstance;
      }
    },
    cachedFightSelected(encounter) {
      this.cachedFightName = encounter;
      if (encounter == "") {
        this.vod_url = "";
        this.fflogs_url = "";
      } else {
        this.vod_url = this.cachedFights[encounter].twitch;
        this.fflogs_url = this.cachedFights[encounter].fflogs;
        this.submitURLs();
      }
    },
  },
  methods: {
    async getTwitchId(twitchUrl: string) {
      try {
        const url = new URL(twitchUrl);
        var video = url.pathname.split("/");
        var videoIndex = video.indexOf("videos");
        if (videoIndex == -1) {
          videoIndex = video.indexOf("video");
        }
        this.twitchId = video[videoIndex + 1];
      } catch (error) {
        this.twitchId = "Please enter a valid Twitch VOD URL";
      } finally {
        this.getTwitchData(this.twitchId);
      }
    },
    getTwitchData(videoId: string) {
      fetch("https://api.yamanote.co/twitch?videoId=" + videoId)
        .then(async (response) => {
          this.twitchData = await response.json();
        })
        .catch((error) => {
          console.error("there was an error fetching twitch data: ", error);
        })
        .finally(() => {
          this.twitchVodStart = parseInt(this.twitchData.timeArr[0].startTime);
          this.getTwitchPlayer(this.twitchId);
        });
    },
    async getTwitchPlayer(videoId: string) {
      var options = {
        width: "100%",
        height: "100%",
        video: videoId,
        // only needed if your site is also embedded on embed.example.com and othersite.example.com
        // parent: ["embed.example.com"]
        autoplay: false,
      };
      if (this.player) {
        this.removePlayer();
      }
      this.player = new Twitch.Player("twitch-player", options);
      var element = document.getElementById("twitch-player");
      element.style.position = "absolute";
      element.style.width = "100%";
      element.style.height = "100%";
      element.style.top = "0";
      // player.setVolume(0.5);
      this.player.addEventListener(Twitch.Player.READY, () => {
        this.player.setQuality("chunked");
      });
    },
    submitURLs() {
      // this.resetURLs();
      this.hideGoogleWarning();
      this.removePlayer();
      if (this.vod_url.includes("twitch")) {
        this.getTwitchId(this.vod_url);
      } else if (
        this.vod_url.includes("youtube") ||
        this.vod_url.includes("youtu.be")
      ) {
        this.getYoutubeId(this.vod_url);
      }
      this.getReportId(this.fflogs_url);
    },
    resetURLs() {
      this.removePlayer();
      this.cachedFightName = "";
      this.cachedFightSelected = "";
      this.showGoogleWarning();
      // TODO: Clear logs
    },
    hideGoogleWarning() {
      var element = document.getElementById("google-homepage-shit");
      element.style.display = "none";
    },
    showGoogleWarning() {
      var element = document.getElementById("google-homepage-shit");
      element.style.display = "block";
    },
    removePlayer() {
      // var iframes = document.querySelectorAll("iframe");
      // for (var i = 0; i < iframes.length; i++) {
      //   iframes[i].parentNode.removeChild(iframes[i]);
      // }
      const twitchPlayer = document.getElementById("twitch-player");
      twitchPlayer.innerHTML = "";
      const youtubePlayer = document.getElementById("youtube-player-wrapper");
      youtubePlayer.innerHTML = "";
      let div = document.createElement("div");
      div.id = "youtube-player";
      youtubePlayer.append(div);
      this.player = null;
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
      const vodTime = parseInt(timestamp);
      this.player.seek(vodTime);
    },
    getReportId(fflogsUrl: string) {
      try {
        const url = new URL(fflogsUrl);
        var report = url.pathname.split("/");
        var reportIndex = report.indexOf("reports");
        this.reportId = report[reportIndex + 1];
      } catch (error) {
        this.reportId = "Please enter a valid FFLogs report URL";
      } finally {
        this.getReportData(this.reportId);
      }
    },
    getReportData(reportId: string) {
      fetch("https://api.yamanote.co/fflogs?reportId=" + reportId)
        .then(async (response) => {
          this.reportData = await response.json();
        })
        .catch((error) => {
          console.error("there was an error fetching fflogs data: ", error);
        })
        .finally(() => {
          this.reportStart = parseInt(
            this.reportData.data.reportData.report.startTime
          );
          this.reportEnd = parseInt(
            this.reportData.data.reportData.report.endTime
          );
          this.getReportDeathData(
            this.reportId,
            0,
            this.reportEnd - this.reportStart
          );
        });
    },
    getReportDeathData(reportId, startTime, endTime) {
      fetch(
        `https://api.yamanote.co/fflogs?reportId=${reportId}&startTime=${startTime}&endTime=${endTime}`
      )
        .then(async (response) => {
          this.reportData = await response.json();
          this.getExtraReportData();
        })
        .catch((error) => {
          console.error(
            "there was an error fetching fflogs data w/ deaths: ",
            error
          );
        });
    },
    getExtraReportData() {
      this.playerData =
        this.reportData.data.reportData.report.masterData.players;
      this.abilityData =
        this.reportData.data.reportData.report.masterData.abilities;
      this.npcData = this.reportData.data.reportData.report.masterData.npcs;
      this.deathData = this.reportData.data.reportData.report.events.data;
      const playerMap = new Map();
      const abilityMap = new Map();
      const npcMap = new Map();
      for (const player of this.playerData) {
        playerMap.set(player.id, player.name);
      }
      for (const ability of this.abilityData) {
        abilityMap.set(ability.gameID, ability.name);
      }
      for (const npc of this.npcData) {
        npcMap.set(npc.id, npc.name);
      }
      for (const death in this.deathData) {
        this.deathData[death]["player"] = playerMap.get(
          this.deathData[death].targetID
        );
        this.deathData[death]["ability"] = abilityMap.get(
          this.deathData[death].killingAbilityGameID
        );
        this.deathData[death]["source"] = npcMap.get(
          this.deathData[death].sourceID
        );
        this.deathData[death]["killer"] = npcMap.get(
          this.deathData[death].killerID
        );
      }
      const finalDeathData = {};
      for (const death in this.deathData) {
        finalDeathData[this.deathData[death].fight] =
          finalDeathData[this.deathData[death].fight] || [];
        finalDeathData[this.deathData[death].fight].push(this.deathData[death]);
      }
      this.deathData = finalDeathData;
    },
    getCachedFights() {
      const cachedFights = localStorage.getItem("cachedFights");
      if (cachedFights) {
        const cachedFightsObj = JSON.parse(cachedFights);
        Object.keys(cachedFightsObj).forEach((fightName) => {
          this.cachedFights[fightName] = cachedFightsObj[fightName];
        });
      }
    },
    addCachedFight() {
      if (this.cachedFightName != "") {
        this.cachedFights[this.cachedFightName] = {
          twitch: this.vod_url,
          fflogs: this.fflogs_url,
        };
        localStorage.setItem("cachedFights", JSON.stringify(this.cachedFights));
      }
    },
    removeCachedFight() {
      this.cachedFightSelected = "";
      delete this.cachedFights[this.cachedFightName];
      this.cachedFightName = "";
      localStorage.setItem("cachedFights", JSON.stringify(this.cachedFights));
    },
    googleAuthCallback(googleAuthData: Object) {
      console.log("emitting from navigation bar");
      console.log(googleAuthData);
      this.googleAuthData = googleAuthData;
      this.googleAuthData["expires_in"] =
        this.googleAuthData["expires_in"] * 1000;
      this.googleAuthData["created_time"] = Date.now();
      localStorage.setItem(
        "cachedGoogleAuth",
        JSON.stringify(this.googleAuthData)
      );
    },
    getCachedGoogleAuth() {
      const cachedGoogleAuth = localStorage.getItem("cachedGoogleAuth");
      if (cachedGoogleAuth) {
        const cachedGoogleAuthObj = JSON.parse(cachedGoogleAuth);
        if (
          cachedGoogleAuthObj["created_time"] +
            cachedGoogleAuthObj["expires_in"] >
          Date.now()
        ) {
          this.googleAuthData = JSON.parse(cachedGoogleAuth);
        } else {
          localStorage.removeItem("cachedGoogleAuth");
        }
      }
    },
    async getYoutubeId(youtubeUrl: string) {
      try {
        console.log(youtubeUrl);
        const url = new URL(youtubeUrl);
        console.log(url);
        if (youtubeUrl.includes("youtube.com")) {
          var video = url.href.split("watch?")[1];
          console.log(video);
          var queries = video.split("&");
          console.log(queries);
          for (const query of queries) {
            if (query.includes("v=")) {
              this.youtubeId = query.replace("v=", "");
            }
          }
        } else if (youtubeUrl.includes("youtu.be")) {
          console.log(youtubeUrl);
          this.youtubeId = url.pathname.split("/")[1];
        }
      } catch (error) {
        console.log(error);
        this.youtubeId = "Please enter a valid YouTube VOD URL";
      } finally {
        this.getYoutubeData(this.youtubeId);
      }
    },
    getYoutubeData(videoId: string) {
      if (Object.keys(this.googleAuthData).length !== 0) {
        var authToken = this.googleAuthData.access_token;
        fetch(
          `https://api.yamanote.co/youtube?videoId=${videoId}&authToken=${authToken}`
        )
          .then(async (response) => {
            this.youtubeData = await response.json();
            console.log(this.youtubeData);
          })
          .catch((error) => {
            console.error("there was an error fetching youtube data: ", error);
          })
          .finally(() => {
            this.twitchVodStart = parseInt(
              this.youtubeData.timeArr[0].startTime
            );
            this.getYoutubePlayer(this.youtubeId);
          });
      } else {
        alert("Authenticate with Google to use YouTube livestreams");
      }
    },
    getYoutubePlayer(videoId: string) {
      const options = {
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
      };
      this.player = new YT.Player("youtube-player", {
        height: "390",
        width: "640",
        videoId: videoId,
        playerVars: options,
      });
      var element = document.getElementById("youtube-player");
      element.style.position = "absolute";
      element.style.width = "100%";
      element.style.height = "100%";
      element.style.top = "0";
      this.player.addEventListener("onReady", () => {
        this.player.setPlaybackQuality("highres");
      });
      this.player.addEventListener("onStateChange", () => {
        this.player.setPlaybackQuality("highres");
      });
    },
  },
};
</script>

<style scoped>
.navHeader {
  height: 4vh;
}
.no-scroll {
  height: 96vh;
}
.vod-player {
  height: 100%;
}

.deadspace {
  height: 100%;
  padding-top: 0.25em;
}

.player-input {
  width: 73vw;
}

.fflogs-report {
  max-height: 100%;
  padding-left: 1em;
  width: 27vw;
}

.vod-player {
  padding-top: 56.25%;
  position: relative;
  height: 0;
}
#google-homepage-shit {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
}
</style>
