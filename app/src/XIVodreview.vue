<script setup lang="ts">
import NavigationBar from "./components/NavigationBar.vue";
import FFlogsReport from "./components/FFlogsReport.vue";
</script>

<template>
  <NavigationBar
    class="navHeader"
    msg="GitHub"
    :googleAuthToken="googleAuthToken"
    :fflogsAuthToken="fflogsAuthToken"
    @google-auth="getGoogleAuthToken"
    @get-google-auth-token="getGoogleAuthToken"
    @clear-google-auth-token="clearGoogleAuthToken"
    @get-fflogs-auth-token="getFflogsAuthToken"
    @clear-fflogs-auth-token="clearFflogsAuthToken"
  />
  <div class="container-fluid overflow-hidden">
    <div class="row no-scroll">
      <div class="col-9 player-input">
        <div class="row g-0 flex-row-thing">
          <div class="col-12">
            <div class="vod-player row g-0">
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
                    YouTube livestream, you might need to authenticate with
                    Google first depending on the privacy settings for the VOD.
                  </p>
                  <p>
                    Encounters can be saved for easier use if switching between
                    POV's or coming back at a later time.
                  </p>
                  <p>
                    If you wish to use a private YouTube Livestream/VOD, you
                    must ensure that you are logged into the correct Google
                    account that has been shared the video.
                    <br />
                    If you are using Firefox and want to use a private YouTube
                    VOD with this tool, you may need to whitelist this domain in
                    the "Enhanced Tracking Protection" section to allow
                    cross-site cookies. Otherwise, the player embed may not
                    work.
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
                    for those that use copious plugins). No user data is stored
                    by this application. Authentication with Google is strictly
                    used to reach the YouTube Data API on behalf of the user.
                  </p>
                </div>
                <div class="col-1"></div>
              </div>
            </div>
            <div class="row g-0">
              <div
                id="pull-scrub"
                @mousemove="scrubMousePos"
                @click="scrubClick"
                @mouseenter="showTimestamp"
                @mouseleave="hideTimestamp"
              >
                <span id="pull-scrub-span"></span>
                <div class="death-indicators">
                  <div
                    v-for="death in deathData[currentPull.id]"
                    class="death-indicator"
                    :style="{
                      width: `${Number(
                        ((death.timestamp - currentPull.startTime) /
                          (currentPull.endTime - currentPull.startTime)) *
                          100
                      )}%`,
                    }"
                    :key="
                      reportId +
                      death.player +
                      death.source +
                      death.ability +
                      death.timestamp +
                      currentPull.startTime
                    "
                  ></div>
                </div>
              </div>
            </div>
            <div id="pull-timestamp">00:00</div>
            <div class="row justify-content-center g-2">
              <div class="col-1"><p class="mt-2">Offset (ms)</p></div>
              <div class="col-4" style="width: 10em">
                <div class="input-group">
                  <button
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="decreaseOffset"
                  >
                    -
                  </button>
                  <input
                    id="timeBeforePull"
                    class="form-control"
                    v-model="timeBeforePull"
                    disabled
                    readonly
                  />
                  <button
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="increaseOffset"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- <div class="row g-0 bottom-fixed">
          <div class="deadspace col-12">
            <div class="row g-2 input-group form-group form-floating">
              <input
                id="timeBeforePull"
                class="form-control"
                type="number"
                v-model="timeBeforePull"
              />
              <label for="timeBeforePull">
                Video sync/offset (in seconds)
              </label>
            </div>
          </div>
        </div> -->
      </div>
      <div class="fflogs-report col-3">
        <div class="accordion accordion-flush" id="control-flow">
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingOne">
              <button
                class="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseOne"
                aria-expanded="true"
                aria-controls="collapseOne"
              >
                URL inputs
              </button>
            </h2>
            <div
              id="collapseOne"
              class="accordion-collapse collapse show"
              aria-labelledby="headingOne"
            >
              <div class="accordion-body">
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
                  <div class="col">
                    <button
                      class="btn btn-outline-primary me-1"
                      @click="submitURLs"
                    >
                      Submit
                    </button>
                    <button
                      class="btn btn-outline-secondary me-1"
                      @click="resetURLs"
                    >
                      Reset
                    </button>
                    <button
                      v-if="player !== null"
                      class="btn btn-outline-secondary"
                      data-bs-toggle="tooltip"
                      data-bs-title="Copy to clipboard"
                      @click="shareURLs"
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingTwo">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseTwo"
                aria-expanded="false"
                aria-controls="collapseTwo"
              >
                Saved Encounters
              </button>
            </h2>
            <div
              id="collapseTwo"
              class="accordion-collapse collapse"
              aria-labelledby="headingTwo"
            >
              <div class="accordion-body">
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
                  <div class="col">
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
        <div v-if="fightData && player" style="margin-top: 1.5rem">
          <FFlogsReport
            :key="reportId"
            :fightData="fightData"
            :deathData="deathData"
            :reportId="reportId"
            :reportStart="reportStart"
            :vodStartTime="vodStartTime"
            :timeBeforePull="timeBeforePull"
            :player="player"
            @get-pull-num="getPullNum"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      api_url: "https://api.yamanote.co",
      vod_url: "",
      twitchId: "",
      twitchData: null,
      youtubeId: "",
      youtubeData: null,
      vodStartTime: 0,
      player: null,
      playerType: "",
      scrubTimer: 0, // not sure if these timers need to be null tbh
      pullTimestamp: 0,
      fflogs_url: "",
      reportId: "",
      reportData: null,
      reportStart: 0,
      reportEnd: 0,
      fightData: {},
      playerData: [],
      abilityData: [],
      npcData: [],
      encounterData: {},
      encounterMap: {},
      deathData: {},
      currentPull: {},
      timeBeforePull: 0,
      vodButtons: [],
      cachedFights: {},
      cachedFightName: "",
      cachedFightSelected: null,
      googleAuthData: {},
      googleTokenClient: {},
      googleAuthToken: {},
      googleAuthTokenTimer: 0,
      fflogsAuthState: "",
      fflogsCodeVerifier: "",
      fflogsCodeChallenge: "",
      fflogsAuthUrl: URL,
      fflogsAuthCode: "",
      fflogsAuthToken: {},
      fflogsAuthTokenTimer: 0,
    };
  },
  created() {
    this.getCachedFights();
    this.getCachedGoogleToken();
    this.getCachedFflogsAuthToken();
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
    // reportData(newValue) {
    //   const fightsPerInstance = {};
    //   if (newValue) {
    //     newValue.data.reportData.report.fights.forEach((fight: Object) => {
    //       var encounterName = "";
    //       if (this.encounterMap.get(fight.encounterID)) {
    //         encounterName = this.encounterMap.get(fight.encounterID);
    //       } else {
    //         encounterName = fight.name;
    //       }
    //       fightsPerInstance[encounterName] = fightsPerInstance[encounterName] || [];
    //       var fightPercentage = 100 - fight.fightPercentage;
    //       var fightClass = "";
    //       if (fightPercentage < 25) {
    //         fightClass = "common";
    //       } else if (fightPercentage < 50) {
    //         fightClass = "uncommon";
    //       } else if (fightPercentage < 75) {
    //         fightClass = "rare";
    //       } else if (fightPercentage < 90) {
    //         fightClass = "epic";
    //       } else if (fightPercentage < 100) {
    //         fightClass = "legendary";
    //       }
    //       fight["class"] = fightClass;
    //       fightsPerInstance[encounterName].push(fight);
    //     });
    //     this.fightData = fightsPerInstance;
    //   }
    // },
    encounterData(newValue) {
      const worldData = newValue.data.worldData;
      this.encounterMap = {};
      for (const encounter in worldData) {
        if (worldData[encounter] !== null) {
          var difficulties = {};
          for (const difficulty of worldData[encounter]["zone"]["difficulties"]) {
            difficulties[difficulty.id] = difficulty.name
          }
          var encounterInfo = {
            name: worldData[encounter]["name"],
            difficulties: difficulties
          }
          this.encounterMap[worldData[encounter]["id"]] = encounterInfo;
        }
      }
      console.log("encounterMap", this.encounterMap);
      this.getFightData();
    },
    cachedFightSelected(encounter) {
      if (encounter != null) {
        this.cachedFightName = encounter;
        this.vod_url = this.cachedFights[encounter].vod;
        this.fflogs_url = this.cachedFights[encounter].fflogs;
        this.timeBeforePull = this.cachedFights[encounter].offset || 0;
        this.submitURLs();
        this.cachedFightSelected = null;
      }
    },
    timeBeforePull(newValue) {
      if (this.cachedFights[this.cachedFightName]) {
        this.cachedFights[this.cachedFightName]["offset"] = newValue;
        localStorage.setItem("cachedFights", JSON.stringify(this.cachedFights));
      }
    },
    async fflogsAuthCode(code) {
      const fflogsClientId = "984bcd26-7d4e-4d0a-b8aa-80b24755d685";
      await fetch("https://www.fflogs.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: fflogsClientId,
          code_verifier: this.fflogsCodeVerifier,
          redirect_uri: "https://xivodreview.com",
          grant_type: "authorization_code",
          code: code,
        }),
      }).then(async (res) => {
        this.fflogsAuthToken = await res.json();
        this.fflogsAuthToken["created_time"] = Date.now();
        localStorage.setItem(
          "cachedFflogsAuthToken",
          JSON.stringify(this.fflogsAuthToken)
        );
      });
    },
    currentPull(newValue) {
      console.log("currentPull", newValue);
      this.pullTimestamp =
        (this.currentPull.startTime +
          this.reportStart -
          this.vodStartTime -
          this.timeBeforePull) /
        1000;
      clearInterval(this.scrubTimer);
      setTimeout(() => {
        this.scrubTimer = 0;
        if (this.scrubTimer == 0) {
          this.scrubTimer = setInterval(() => {
            this.updateScrubTime();
          }, 200);
        }
      }, 1500);
      // setInterval(() => {
      //   this.updateScrubTime()
      // }, 1000);
    },
    pullTimestamp(newValue) {
      var pullStartTime =
        (this.currentPull.startTime +
          this.reportStart -
          this.vodStartTime -
          this.timeBeforePull) /
        1000;
      var pullEndTime =
        (this.currentPull.endTime +
          this.reportStart -
          this.vodStartTime -
          this.timeBeforePull) /
        1000;
      var percentage =
        ((newValue - pullStartTime) / (pullEndTime - pullStartTime)) * 100;
      var span = document.getElementById("pull-scrub-span");
      span.style.width = percentage + "%";
    },
  },
  methods: {
    getPullNum(pullId) {
      console.log("getpullnum", pullId);
      this.currentPull =
        this.reportData.data.reportData.report.fights[pullId - 1];
    },
    decreaseOffset() {
      this.timeBeforePull = this.timeBeforePull - 500;
    },
    increaseOffset() {
      this.timeBeforePull = this.timeBeforePull + 500;
    },
    showTimestamp() {
      var timestamp = document.getElementById("pull-timestamp");
      if (Object.keys(this.currentPull).length > 0) {
        timestamp.style.visibility = "visible";
      }
    },
    hideTimestamp() {
      var timestamp = document.getElementById("pull-timestamp");
      if (Object.keys(this.currentPull).length > 0) {
        timestamp.style.visibility = "hidden";
      }
    },
    scrubMousePos(e) {
      let timelineWidth = document.getElementById("pull-scrub").offsetWidth;
      this.x = (e.offsetX / timelineWidth) * 100;
      if (Object.keys(this.currentPull).length > 0) {
        var pullLength = this.currentPull.endTime - this.currentPull.startTime;
        this.currentTimestamp = pullLength * this.x / 100;
        var timestamp = document.getElementById("pull-timestamp");
        timestamp.style.left = (e.clientX - 20) + "px";
        timestamp.style.top = (document.getElementById("pull-scrub").getBoundingClientRect().y - 30) + "px";
        timestamp.innerHTML = new Date(this.currentTimestamp).toISOString().slice(14, 19); 
      }
    },
    scrubClick() {
      this.scrubGotoTime(this.x);
    },
    updateScrubTime() {
      if (this.player == null) {
        return;
      }
      // 2023-03-19 TODO: this might be easier to purely animate since twitch player is ass and doesn't like to update current time
      this.pullTimestamp = this.player.getCurrentTime();
      // var pullStartTime =
      //   (this.currentPull.startTime + this.reportStart - this.vodStartTime - this.timeBeforePull) /
      //   1000;
      // var pullEndTime =
      //   (this.currentPull.endTime + this.reportStart - this.vodStartTime - this.timeBeforePull) /
      //   1000;
      // var percentage =
      //   ((this.pullTimestamp - pullStartTime) / (pullEndTime - pullStartTime)) * 100;
      // var span = document.getElementById("pull-scrub-span");
      // span.style.width = percentage + "%";
    },
    scrubGotoTime(percentage) {
      var pullStartTime =
        (this.currentPull.startTime +
          this.reportStart -
          this.vodStartTime -
          this.timeBeforePull) /
        1000;
      var pullEndTime =
        (this.currentPull.endTime +
          this.reportStart -
          this.vodStartTime -
          this.timeBeforePull) /
        1000;
      var newTime =
        (pullEndTime - pullStartTime) * (percentage / 100) + pullStartTime;
      // this.pullTimestamp = newTime;
      if (this.playerType == "twitch") {
        this.player.seek(newTime);
      } else if (this.playerType == "yubtub") {
        this.player.seekTo(newTime);
      }
      // clearInterval(this.scrubTimer);
      // setTimeout(() => {
      //   this.scrubTimer = 0;
      //   if (this.scrubTimer == 0) {
      //     this.scrubTimer = setInterval(() => {
      //       this.updateScrubTime();
      //     }, 200);
      //   }
      // }, 1500);
    },
    clearScrubTimer() {
      var span = document.getElementById("pull-scrub-span");
      span.style.width = "0";
      clearInterval(this.scrubTimer);
      this.scrubTimer = 0;
    },
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
      fetch(`${this.api_url}/twitch?videoId=${videoId}`)
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
        this.playerType = "twitch";
      });
      // this.player.addEventListener(Twitch.Player.PLAY)
      this.player.addEventListener(Twitch.Player.PLAYING, () => {
        setTimeout(() => {
          this.getPullNumber(this.player.getCurrentTime() - this.timeBeforePull);
        }, 2000);
      });
      // this.player.addEventListener(Twitch.Player.SEEK, () => {
      //   setTimeout(() => {
      //     this.getPullNumber(this.player.getCurrentTime());
      //   }, 600);
      // });
      this.player.addEventListener(Twitch.Player.PAUSE, () => {
        setTimeout(() => {
          this.getPullNumber(this.player.getCurrentTime() - this.timeBeforePull);
        }, 2000);
      });
    },
    getPullNumber(timestamp) {
      this.reportData.data.reportData.report.fights.every((fight: Object) => {
        if (
          this.vodStartTime + timestamp * 1000 <=
          this.reportStart + fight.endTime
        ) {
          this.currentPull = fight;
          return false;
        }
        return true;
      });
    },
    submitURLs() {
      // this.resetURLs();
      this.hideGoogleWarning();
      this.clearScrubTimer();
      this.removePlayer();
      this.twitchId = "";
      this.youtubeId = "";
      this.currentPull = {};
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
      this.playerType = "";
      this.twitchId = "";
      this.youtubeId = "";
      this.currentPull = {};
      this.showGoogleWarning();
      this.clearScrubTimer();
      window.history.pushState({}, document.title, window.location.origin);
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
      var getUrl = "";
      if (Object.keys(this.fflogsAuthToken).length != 0) {
        getUrl = `${this.api_url}/fflogs?reportId=${reportId}&authToken=${this.fflogsAuthToken.access_token}`;
      } else {
        getUrl = `${this.api_url}/fflogs?reportId=${reportId}`;
      }
      fetch(getUrl)
        .then(async (response) => {
          this.reportData = await response.json();
          await this.getEncounterData();
        })
        .catch((error) => {
          console.error("there was an error fetching fflogs data: ", error);
        })
        .finally(() => {
          if (this.reportData.errors) {
            alert(
              this.reportData.errors[0].message +
                "\n\nTry authenticating with FF Logs if this report is private."
            );
          } else {
            this.reportStart = parseInt(
              this.reportData.data.reportData.report.startTime
            );
            this.reportEnd = parseInt(
              this.reportData.data.reportData.report.endTime
            );
            if (this.fflogsAuthToken) {
              this.getReportDeathData(
                this.reportId,
                0,
                this.reportEnd - this.reportStart,
                this.fflogsAuthToken.access_token
              );
            } else {
              this.getReportDeathData(
                this.reportId,
                0,
                this.reportEnd - this.reportStart,
                {}
              );
            }
          }
        });
    },
    getReportDeathData(reportId, startTime, endTime, authToken) {
      var getUrl = "";
      if (authToken) {
        getUrl = `${this.api_url}/fflogs?reportId=${reportId}&startTime=${startTime}&endTime=${endTime}&authToken=${authToken}`;
      } else {
        getUrl = `${this.api_url}/fflogs?reportId=${reportId}&startTime=${startTime}&endTime=${endTime}`;
      }
      fetch(getUrl)
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
    getEncounterData() {
      var getUrl = `${this.api_url}/encounters?`;
      var encounterIds = [];
      this.reportData.data.reportData.report.fights.forEach((fight: Object) => {
        if (!encounterIds.includes(fight.encounterID)) {
          encounterIds.push(fight.encounterID);
          getUrl = getUrl + `id=${fight.encounterID}&`;
          console.log("encounterdata", getUrl);
        }
      });
      fetch(getUrl)
        .then(async (response) => {
          this.encounterData = await response.json();
        })
        .catch((error) => {
          console.error(
            "there was an error fetching fflogs encounter data: ",
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
      console.log(this.deathData);
    },
    getFightData() {
      const fightsPerInstance = {};
      var pullNum = 1;
      if (this.reportData) {
        this.reportData.data.reportData.report.fights.forEach(
          (fight: Object) => {
            var encounterName = "";
            fight["pullNum"] = pullNum++;
            if (this.encounterMap[fight.encounterID]) {
              var encounter = this.encounterMap[fight.encounterID];
              if (Object.keys(encounter.difficulties).length > 1) {
                var difficulty = " - " + encounter.difficulties[fight.difficulty];
                encounterName = this.encounterMap[fight.encounterID].name + difficulty;
              }
              else {
                encounterName = this.encounterMap[fight.encounterID].name;
              }
            } else {
              encounterName = fight.name;
            }
            fightsPerInstance[encounterName] =
              fightsPerInstance[encounterName] || [];
            var fightPercentage = 100 - fight.fightPercentage;
            var fightClass = "";
            if (fightPercentage < 25) {
              fightClass = "common";
            } else if (fightPercentage < 50) {
              fightClass = "uncommon";
            } else if (fightPercentage < 75) {
              fightClass = "rare";
            } else if (fightPercentage < 90) {
              fightClass = "epic";
            } else if (fightPercentage < 100) {
              fightClass = "legendary";
            }
            fight["class"] = fightClass;
            fightsPerInstance[encounterName].push(fight);
          }
        );
        this.fightData = fightsPerInstance;
      }
    },
    getCachedFights() {
      const cachedFights = localStorage.getItem("cachedFights");
      if (cachedFights) {
        const cachedFightsObj = JSON.parse(cachedFights);
        Object.keys(cachedFightsObj).forEach((fightName) => {
          if (!("vod" in cachedFightsObj[fightName])) {
            cachedFightsObj[fightName]["vod"] = cachedFightsObj[fightName]["twitch"];
          }
          if (!("offset" in cachedFightsObj[fightName])) {
            cachedFightsObj[fightName]["offset"] = 0;
          }
          this.cachedFights[fightName] = cachedFightsObj[fightName];
        });
        localStorage.setItem("cachedFights", JSON.stringify(this.cachedFights));
      }
    },
    addCachedFight() {
      if (this.cachedFightName != "") {
        this.cachedFights[this.cachedFightName] = {
          vod: this.vod_url,
          fflogs: this.fflogs_url,
          offset: this.timeBeforePull,
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
    getGoogleAuthToken(googleAuthData: Object) {
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
      localStorage.removeItem("cachedGoogleAuthToken");
    },
    async getYoutubeId(youtubeUrl: string) {
      try {
        const url = new URL(youtubeUrl);
        if (youtubeUrl.includes("youtube.com")) {
          if (youtubeUrl.includes("watch?")) {
            var video = url.href.split("watch?")[1];
            var queries = video.split("&");
            for (const query of queries) {
              if (query.includes("v=")) {
                this.youtubeId = query.replace("v=", "");
              }
            }
          } else if (youtubeUrl.includes("/live/")) {
            this.youtubeId = url.href.split("/live/")[1].split("?")[0];
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
        getUrl = `${this.api_url}/youtube?videoId=${videoId}&authToken=${authToken}`;
      } else {
        getUrl = `${this.api_url}/youtube?videoId=${videoId}`;
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
        this.playerType = "yubtub";
      });
      this.player.addEventListener("onStateChange", (value) => {
        this.player.setPlaybackQuality("highres");
        if (value.data == YT.PlayerState.PLAYING) {
          this.getPullNumber(this.player.getCurrentTime() - this.timeBeforePull);
        } else if (value.data == YT.PlayerState.PAUSED) {
          this.getPullNumber(this.player.getCurrentTime() - this.timeBeforePull);
        }
      });
    },
    dec2hex(dec) {
      return ("0" + dec.toString(16)).substr(-2);
    },
    generateCodeVerifier() {
      var array = new Uint32Array(56 / 2);
      window.crypto.getRandomValues(array);
      return Array.from(array, this.dec2hex).join("");
    },
    sha256(plain) {
      // returns promise ArrayBuffer
      const encoder = new TextEncoder();
      const data = encoder.encode(plain);
      return window.crypto.subtle.digest("SHA-256", data);
    },
    base64urlencode(a) {
      var str = "";
      var bytes = new Uint8Array(a);
      var len = bytes.byteLength;
      for (var i = 0; i < len; i++) {
        str += String.fromCharCode(bytes[i]);
      }
      return btoa(str)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    },
    async generateCodeChallengeFromVerifier(v) {
      var hashed = await this.sha256(v);
      var base64encoded = this.base64urlencode(hashed);
      return base64encoded;
    },
    async createFflogsAuthUrl() {
      const fflogsClientId = "984bcd26-7d4e-4d0a-b8aa-80b24755d685";
      this.fflogsAuthState = this.generateCodeVerifier();
      this.fflogsAuthUrl = new URL("https://www.fflogs.com/oauth/authorize");
      this.fflogsAuthUrl.searchParams.set("client_id", fflogsClientId);
      this.fflogsCodeVerifier = this.generateCodeVerifier();
      this.fflogsCodeChallenge = await this.generateCodeChallengeFromVerifier(
        this.fflogsCodeVerifier
      );
      this.fflogsAuthUrl.searchParams.set(
        "code_challenge",
        this.fflogsCodeChallenge
      );
      this.fflogsAuthUrl.searchParams.set("code_challenge_method", "S256");
      this.fflogsAuthUrl.searchParams.set("state", this.fflogsAuthState);
      this.fflogsAuthUrl.searchParams.set(
        "redirect_uri",
        "https://xivodreview.com"
      );
      this.fflogsAuthUrl.searchParams.set("response_type", "code");
    },
    async getFflogsAuthToken() {
      this.createFflogsAuthUrl().then(async () => {
        const fflogsPopup = window.open(
          this.fflogsAuthUrl.href,
          "fflogsAuth",
          "popup=true,width=500, height=500"
        );
        const checkPopup = setInterval(() => {
          if (fflogsPopup.window.location.href.includes("xivodreview.com")) {
            fflogsPopup.close();
          }
          if (!fflogsPopup || !fflogsPopup.closed) return;
          clearInterval(checkPopup);
          const url = new URL(fflogsPopup.location.href);
          const state = url.searchParams.get("state");
          if (state === this.fflogsAuthState) {
            this.fflogsAuthCode = url.searchParams.get("code");
          } else {
            console.error("state does not match - abort or something");
          }
        }, 500);
      });
    },
    getCachedFflogsAuthToken() {
      const cachedfflogsAuthToken = localStorage.getItem(
        "cachedFflogsAuthToken"
      );
      if (cachedfflogsAuthToken) {
        const cachedFflogsAuthObj = JSON.parse(cachedfflogsAuthToken);
        if (
          cachedFflogsAuthObj["created_time"] +
            cachedFflogsAuthObj["expires_in"] >
          Date.now()
        ) {
          this.fflogsAuthToken = cachedFflogsAuthObj;
          var tokenTimeout =
            this.fflogsAuthToken["created_time"] +
            this.fflogsAuthToken["expires_in"] -
            Date.now();
          this.fflogsAuthTokenTimer = setTimeout(
            this.clearFflogsAuthToken,
            tokenTimeout
          );
        } else {
          localStorage.removeItem("cachedFflogsAuthToken");
        }
      }
    },
    clearFflogsAuthToken() {
      this.fflogsAuthToken = {};
      localStorage.removeItem("cachedFflogsAuthToken");
    },
    shareURLs() {
      var vodId = "";
      var vodType = "";
      if (this.twitchId != "") {
        vodId = this.twitchId;
        vodType = "twitch";
      } else if (this.youtubeId != "") {
        vodId = this.youtubeId;
        vodType = "youtube";
      }
      const shareUrl = `${window.location.origin}?${vodType}=${vodId}&fflogs=${this.reportId}&offset=${this.timeBeforePull}`;
      console.log(shareUrl);
      navigator.clipboard.writeText(shareUrl);
      alert(`Copied "${shareUrl}" to clipboard.`);
    },
  },
  mounted() {
    const bootstrap = window.bootstrap;
    const queryObj = new URLSearchParams(window.location.search);
    if (window.location.search != "") {
      var check = { offset: 0 };
      for (const [key, value] of queryObj) {
        if (key == "twitch") {
          this.vod_url = `https://www.twitch.tv/videos/${value}`;
          check["vod"] = "twitch";
        } else if (key == "youtube") {
          this.vod_url = `https://www.youtube.com/watch?v=${value}`;
          check["vod"] = "youtube";
        } else if (key == "fflogs") {
          this.fflogs_url = `https://www.fflogs.com/reports/${value}`;
          check["fflogs"] = value;
        } else if (key == "offset") {
          this.timeBeforePull = Number(value);
          check["offset"] = Number(value);
        }
      }
      if ("vod" in check && "fflogs" in check) {
        this.submitURLs();
      }
    }
    var tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  },
};
</script>

<style scoped>
.navHeader {
  height: 3.3em;
}
.no-scroll {
  height: 94vh;
}
.vod-player {
  height: 85vh;
  /* padding-top: 56.25%; */
  display: block;
  position: relative;
  width: 100%;
  background: black;
}

.deadspace {
  height: 100%;
  padding-top: 0.25em;
}

.bottom-fixed {
  position: fixed;
  bottom: 1vh;
  width: 71vw;
}

.flex-row-thing {
  display: flex;
  flex-direction: column;
  height: 100%;
}

#pull-scrub {
  height: 3vh;
  background: #3f3f3f;
  overflow: hidden;
  cursor: pointer;
  z-index: 20;
  display: flex;
  position: relative;
  /* flex-direction: column; */
}

#pull-scrub-span {
  display: inline-block;
  /* position: absolute; */
  /* top: 0;
  left: 0; */
  height: 3vh;
  width: 0;
  background: #482e66;
  z-index: 40;
}

#pull-timestamp {
  height: 30px;
  width: 48px;
  position: absolute;
  visibility: hidden;
  backface-visibility: hidden;
  z-index: 9999999;
  cursor: pointer;
  background: #3f3f3f;
  border: 2px solid black;
  text-align: center;
}

.death-indicators {
  /* left: 0;
  right: 0; */
  z-index: 50;
  height: 3vh;
  position: absolute;
  width: 100%;
}

/* .death-indicators, .death-indicator {
  position: absolute;
  top: 0;
  bottom: 0;
} */

.death-indicator {
  position: absolute;
  z-index: 60;
  width: 0px;
  height: 3vh;
  /* background: red; */
  border-right: 1px solid;
  border-left-color: transparent;
  border-top-color: transparent;
  border-bottom-color: transparent;
  border-right-color: red;
}

.player-input {
  width: 71.5vw;
}

.fflogs-report {
  max-height: 100%;
  width: 27.5vw;
  scrollbar-width: thin;
  scrollbar-gutter: stable;
  overflow: auto;
  overflow-y: overlay;
}
.fflogs-report::-webkit-scrollbar {
  width: 0.2em;
}
.fflogs-report::-webkit-scrollbar-button {
  display: none;
}
.fflogs-report::-webkit-scrollbar-track {
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}
.fflogs-report::-webkit-scrollbar-thumb {
  background-color: darkgrey;
  outline: 1px solid slategrey;
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
