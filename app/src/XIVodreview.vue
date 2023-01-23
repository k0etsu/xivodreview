<script setup lang="ts">
import NavigationBar from "./components/NavigationBar.vue";
import FFlogsReport from "./components/FFlogsReport.vue";
</script>

<template>
  <NavigationBar
    class="navHeader"
    msg="GitHub"
    :googleAuthToken="googleAuthToken"
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
            <div
              id="google-homepage-shit"
              class="row align-items-center justify-content-center"
            >
              <div data-bs-theme="dark" class="col-10 offset-md-1 text-body">
                <h5>Usage</h5>
                <p>
                  This application is used for aligning livestream archives
                  (Twitch/YouTube) with FFLogs reporting tool for reviewing
                  fights and their mechanics. Input a link to both the VOD and
                  the FFLogs report and then submit. If you need to use a
                  YouTube livestream, you might need to authenticate with Google
                  first depending on the privacy settings for the VOD.
                </p>
                <p>
                  Encounters can be saved for easier use if switching between
                  POV's or coming back at a later time.
                </p>
                <br />
                <p>
                  <strong> Regarding Google Authentication </strong>
                </p>
                <p>
                  This site uses Sign In with Google to authenticate with
                  Google's YouTube Data API. This is necessary for users that
                  want to use xivodreview with private YouTube livestreams
                  (assume this would be the case for teams that are racing or
                  for those that use copious plugins). No user data is stored by
                  this application. Authentication with Google is strictly used
                  to reach the YouTube Data API on behalf of the user.
                </p>
              </div>
              <div class="col-1"></div>
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
          :vodStartTime="vodStartTime"
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
      vodStartTime: 0,
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
      googleTokenClient: {},
      googleAuthToken: {},
      googleAuthTokenTimer: 0,
    };
  },
  created() {
    this.getCachedFights();
    this.getCachedGoogleToken();
    const google = window.google;
    this.googleTokenClient = google.accounts.oauth2.initTokenClient({
      client_id:
        "613134000150-vledb3pl871faha1bj3q1vfsbjfemnss.apps.googleusercontent.com",
      scope: "https://www.googleapis.com/auth/youtube.readonly",
      callback: (tokenResponse) => {
        this.googleAuthToken = tokenResponse;
        this.googleAuthToken["expires_in"] =
          this.googleAuthToken["expires_in"] * 1000;
        this.googleAuthToken["created_time"] = Date.now();
        localStorage.setItem(
          "cachedGoogleAuthToken",
          JSON.stringify(this.googleAuthToken)
        );
        clearTimeout(this.googleAuthTokenTimer);
        const tokenTimeout = this.googleAuthToken["expires_in"];
        this.googleAuthTokenTimer = setTimeout(
          this.clearGoogleAuthToken,
          tokenTimeout
        );
      },
    });
  },
  watch: {
    reportData(newValue) {
      const fightsPerInstance = {};
      if (newValue) {
        newValue.data.reportData.report.fights.forEach((fight: Object) => {
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
        console.log(error);
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
          this.vodStartTime = parseInt(this.twitchData.timeArr[0].startTime);
          this.getTwitchPlayer(this.twitchId);
        });
    },
    async getTwitchPlayer(videoId: string) {
      const Twitch = window.Twitch;
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
      this.vod_url = "";
      this.fflogs_url = "";
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
      element.style.display = "";
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
      this.googleTokenClient.requestAccessToken();
      this.googleAuthData = googleAuthData;
      this.googleAuthData["expires_in"] =
        this.googleAuthData["expires_in"] * 1000;
      this.googleAuthData["created_time"] = Date.now();
      localStorage.setItem(
        "cachedGoogleAuth",
        JSON.stringify(this.googleAuthData)
      );
    },
    getCachedGoogleToken() {
      const cachedGoogleAuthToken = localStorage.getItem(
        "cachedGoogleAuthToken"
      );
      if (cachedGoogleAuthToken) {
        const cachedGoogleAuthObj = JSON.parse(cachedGoogleAuthToken);
        if (
          cachedGoogleAuthObj["created_time"] +
            cachedGoogleAuthObj["expires_in"] >
          Date.now()
        ) {
          this.googleAuthToken = JSON.parse(cachedGoogleAuthToken);
          var tokenTimeout =
            this.googleAuthToken["created_time"] +
            this.googleAuthToken["expires_in"] -
            Date.now();
          this.googleAuthTokenTimer = setTimeout(
            this.clearGoogleAuthToken,
            tokenTimeout
          );
        } else {
          localStorage.removeItem("cachedGoogleAuthToken");
        }
      }
    },
    clearGoogleAuthToken() {
      if (this.googleAuthTokenTimer) {
        clearTimeout(this.googleAuthTokenTimer);
      }
      this.googleAuthToken = {};
      this.googleAuthTokenTimer = 0;
    },
    async getYoutubeId(youtubeUrl: string) {
      try {
        const url = new URL(youtubeUrl);
        if (youtubeUrl.includes("youtube.com")) {
          var video = url.href.split("watch?")[1];
          var queries = video.split("&");
          for (const query of queries) {
            if (query.includes("v=")) {
              this.youtubeId = query.replace("v=", "");
            }
          }
        } else if (youtubeUrl.includes("youtu.be")) {
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
      var authToken = "";
      var getUrl = "";
      if (Object.keys(this.googleAuthToken).length != 0) {
        authToken = this.googleAuthToken.access_token;
        getUrl = `https://api.yamanote.co/youtube?videoId=${videoId}&authToken=${authToken}`;
      } else {
        getUrl = `https://api.yamanote.co/youtube?videoId=${videoId}`;
      }
      fetch(getUrl)
        .then(async (response) => {
          this.youtubeData = await response.json();
        })
        .catch((error) => {
          console.error("there was an error fetching youtube data: ", error);
        })
        .finally(() => {
          if (this.youtubeData.res.pageInfo.totalResults > 0) {
            this.vodStartTime = parseInt(this.youtubeData.timeArr[0].startTime);
            this.getYoutubePlayer(this.youtubeId);
          } else {
            alert(
              "You might be trying to use a private YoutTube VOD or URL is incorrect. Please double check YouTube URL or authenticate with the correct account."
            );
            this.googleTokenClient.requestAccessToken();
            this.showGoogleWarning();
          }
        });
    },
    getYoutubePlayer(videoId: string) {
      const YT = window.YT;
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
  padding-top: 56.25%;
  position: relative;
  height: 0;
  background: black;
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

#google-homepage-shit {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  text-align: justify;
  text-justify: auto;
}
</style>
