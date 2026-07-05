<script setup lang="ts">
import NavigationBar from "./components/NavigationBar.vue";
import FFlogsReport from "./components/FFlogsReport.vue";
import SavedFightTable from "./components/SavedFightTable.vue";
</script>

<template>
  <NavigationBar
    class="navHeader"
    :googleAuthToken="googleAuthToken"
    :fflogsAuthToken="fflogsAuthToken"
    @google-auth-success="storeGoogleAuthToken"
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
                v-show="showWelcome"
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
                <div id="timeline-indicator" v-show="showHoverTimestamp"></div>
                <span id="pull-scrub-span" :style="{ width: scrubPercent + '%' }"></span>
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
            <div id="pull-timestamp" v-show="showHoverTimestamp">00:00</div>
            <div class="row align-items-center g-0" style="margin-top: 4px">
              <div
                class="col-auto"
                style="position: relative; width: 50px; top: -19px"
              >
                <button
                  id="play-button"
                  v-show="!isPlaying"
                  class="btn btn-outline-primary"
                  @click="playVod"
                  ref="focusPlay"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    fill="currentColor"
                    class="bi bi-play"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"
                    />
                  </svg>
                </button>
                <button
                  id="pause-button"
                  v-show="isPlaying"
                  class="btn btn-outline-primary"
                  @click="pauseVod"
                  ref="focusPause"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    fill="currentColor"
                    class="bi bi-pause"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"
                    />
                  </svg>
                </button>
              </div>
              <div class="col-auto" style="margin-left: 10px">
                <div id="current-timestamp">{{ currentTimestampDisplay }}</div>
              </div>
              <div class="col-auto" style="margin-left: 15px">
                <button
                  id="jump-backward"
                  class="btn btn-outline-secondary"
                  @click="jumpBackward"
                >
                  <svg
                    width="30px"
                    height="30px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.91 10.8301H10.85L10.09 13.1201H12.38C13.22 13.1201 13.91 13.8001 13.91 14.6501C13.91 15.4901 13.23 16.1801 12.38 16.1801H10.09"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                    <path
                      d="M10.02 4.46997L12 2"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                    <path
                      d="M4.91 7.79999C3.8 9.27999 3.10999 11.11 3.10999 13.11C3.10999 18.02 7.09 22 12 22C16.91 22 20.89 18.02 20.89 13.11C20.89 8.19999 16.91 4.21997 12 4.21997C11.32 4.21997 10.66 4.31002 10.02 4.46002"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                  </svg>
                </button>
                <button
                  id="jump-forward"
                  class="btn btn-outline-secondary"
                  @click="jumpForward"
                  style="margin-left: 5px"
                >
                  <svg
                    width="30px"
                    height="30px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.98 4.46997L12 2"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                    <path
                      d="M19.0899 7.79999C20.1999 9.27999 20.8899 11.11 20.8899 13.11C20.8899 18.02 16.9099 22 11.9999 22C7.08988 22 3.10986 18.02 3.10986 13.11C3.10986 8.19999 7.08988 4.21997 11.9999 4.21997C12.6799 4.21997 13.3399 4.31002 13.9799 4.46002"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                    <path
                      d="M13.91 10.8301H10.85L10.0901 13.1201H12.3801C13.2201 13.1201 13.91 13.8001 13.91 14.6501C13.91 15.4901 13.2301 16.1801 12.3801 16.1801H10.0901"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                  </svg>
                </button>
              </div>
              <div class="col-auto" style="margin-left: 30px">Offset (ms)</div>
              <div class="col-auto" style="margin-left: 25px; width: 10em">
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
                    <button
                      class="btn btn-outline-info float-end"
                      type="button"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#savedEncountersOffcanvas"
                      aria-controls="savedEncountersOffcanvas"
                    >
                      Saved Encounters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- <div class="accordion-item">
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
                      Save
                    </button>
                    <button
                      class="btn btn-outline-danger float-end"
                      @click="removeCachedFight"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div> -->
        </div>
        <div
          class="offcanvas offcanvas-end"
          tabindex="-1"
          id="savedEncountersOffcanvas"
          aria-labelledby="savedEncounterOffcanvasLabel"
        >
          <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="savedEncountersOffcanvasLabel">
              Saved Encounters
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div class="offcanvas-body">
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
              <div class="col">
                <button
                  class="btn btn-outline-primary me-1"
                  @click="addCachedFight"
                >
                  Save
                </button>
                <button
                  class="btn btn-outline-secondary me-1"
                  @click="clearCachedFight"
                >
                  Clear
                </button>
              </div>
            </div>
            <SavedFightTable
              :key="String(cachedFights)"
              :cachedFights="cachedFights"
              @selected-fight="selectFight"
              @update-cached-fights="updateCachedFights"
            />
          </div>
        </div>
        <div v-if="fightData && player" style="margin-top: 1.5rem">
          <FFlogsReport
            :key="reportId"
            :fightData="fightData"
            :deathData="deathData"
            :phaseMap="phaseMap"
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
      api_url: import.meta.env.VITE_API_URL ?? "https://api.yamanote.co",
      vod_url: "",
      twitchId: "",
      twitchData: null,
      youtubeId: "",
      youtubeData: null,
      vodStartTime: 0,
      player: null,
      playerType: "",
      scrubTimer: 0,
      pullTimestamp: 0,
      playerTimeRef: 0,
      playerTimeWallClock: 0,
      scrubX: 0,
      hoverTimestampMs: 0,
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
      phaseMap: {},
      deathData: {},
      currentPull: {},
      timeBeforePull: 0,
      cachedFights: {},
      cachedFightName: "",
      cachedFightSelected: null,
      googleAuthToken: {},
      googleAuthTokenTimer: 0,
      fflogsAuthState: "",
      fflogsCodeVerifier: "",
      fflogsCodeChallenge: "",
      fflogsAuthUrl: null as (URL | null),
      fflogsAuthCode: "",
      fflogsAuthToken: {},
      fflogsAuthTokenTimer: 0,
      isPlaying: false,
      scrubPercent: 0,
      currentTimestampDisplay: '00:00 / 00:00',
      showHoverTimestamp: false,
      showWelcome: true,
    };
  },
  emits: ['clearGoogleAuthToken', 'getFflogsAuthToken', 'clearFflogsAuthToken'],
  computed: {
    pullStartTime(): number {
      if (!this.currentPull || !this.currentPull.startTime) return 0;
      return (this.currentPull.startTime + this.reportStart - this.vodStartTime - this.timeBeforePull) / 1000;
    },
    pullEndTime(): number {
      if (!this.currentPull || !this.currentPull.endTime) return 0;
      return (this.currentPull.endTime + this.reportStart - this.vodStartTime - this.timeBeforePull) / 1000;
    },
  },
  created() {
    this.getCachedFights();
    this.getCachedGoogleToken();
    this.getCachedFflogsAuthToken();
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
    encounterData(newValue: any) {
      const worldData = newValue.data.worldData;
      this.encounterMap = {};
      for (const encounter in worldData) {
        if (worldData[encounter] !== null) {
          const difficulties: Record<number, string> = {};
          for (const difficulty of worldData[encounter]["zone"]["difficulties"]) {
            difficulties[difficulty.id] = difficulty.name;
          }
          const encounterInfo = {
            name: worldData[encounter]["name"],
            difficulties: difficulties,
          };
          this.encounterMap[worldData[encounter]["id"]] = encounterInfo;
        }
      }
      this.getFightData();
    },
    cachedFightSelected(encounter: any) {
      if (encounter != null) {
        this.cachedFightName = encounter;
        this.vod_url = this.cachedFights[encounter].vod;
        this.fflogs_url = this.cachedFights[encounter].fflogs;
        this.timeBeforePull = this.cachedFights[encounter].offset || 0;
        this.submitURLs();
        this.cachedFightSelected = null;
      }
    },
    timeBeforePull(newValue: number) {
      if (this.cachedFights[this.cachedFightName]) {
        this.cachedFights[this.cachedFightName]["offset"] = newValue;
        localStorage.setItem("cachedFights", JSON.stringify(this.cachedFights));
      }
    },
    async fflogsAuthCode(code: string) {
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
          redirect_uri: `${window.location.origin}/oauth-callback.html`,
          grant_type: "authorization_code",
          code: code,
        }),
      }).then(async (res) => {
        this.fflogsAuthToken = await res.json();
        this.fflogsAuthToken["expires_in"] = this.fflogsAuthToken["expires_in"] * 1000;
        this.fflogsAuthToken["created_time"] = Date.now();
        localStorage.setItem(
          "cachedFflogsAuthToken",
          JSON.stringify(this.fflogsAuthToken)
        );
      });
    },
    currentPull(newValue: any) {
      if (Object.keys(newValue).length > 0) {
        if (this.pullTimestamp < this.pullStartTime || this.pullTimestamp > this.pullEndTime) {
          this.pullTimestamp = this.pullStartTime;
        }
        clearInterval(this.scrubTimer);
        this.scrubTimer = setInterval(() => {
          this.updateScrubTime();
          this.updateTimestamp();
        }, 200);
      }
    },
    pullTimestamp(newValue: number) {
      const range = this.pullEndTime - this.pullStartTime;
      this.scrubPercent = range > 0 ? ((newValue - this.pullStartTime) / range) * 100 : 0;
    },
  },
  methods: {
    playVod() {
      if (this.playerType == "twitch") {
        this.player.play();
      } else if (this.playerType == "yubtub") {
        this.player.playVideo();
      }
      this.isPlaying = true;
      this.$nextTick(() => this.focusPauseButton());
    },
    pauseVod() {
      if (this.playerType == "twitch") this.player.pause();
      else if (this.playerType == "yubtub") this.player.pauseVideo();
      this.isPlaying = false;
      this.$nextTick(() => this.focusPlayButton());
    },
    playPause() {
      if (this.isPlaying) {
        this.pauseVod();
      } else {
        this.playVod();
      }
    },
    jumpForward() {
      const currTime = this.player.getCurrentTime();
      if (this.playerType == "twitch") {
        this.player.seek(currTime + 5);
      } else if (this.playerType == "yubtub") {
        this.player.seekTo(currTime + 5);
      }
    },
    jumpBackward() {
      const currTime = this.player.getCurrentTime();
      if (this.playerType == "twitch") {
        this.player.seek(currTime - 5);
      } else if (this.playerType == "yubtub") {
        this.player.seekTo(currTime - 5);
      }
    },
    handleKeydown(e: KeyboardEvent) {
      if (e.target.tagName.toLowerCase() === "input") {
        return;
      }
      switch (e.key) {
        case " ":
          this.playPause();
          break;
        case "ArrowLeft":
          this.jumpBackward();
          break;
        case "ArrowRight":
          this.jumpForward();
          break;
      }
    },
    focusPlayButton() {
      const focusButton = this.$refs.focusPlay;
      focusButton.focus();
    },
    focusPauseButton() {
      const focusButton = this.$refs.focusPause;
      focusButton.focus();
    },
    strPadLeft(value: number, pad: string, length: number): string {
      return (new Array(length + 1).join(pad) + String(value)).slice(-length);
    },
    updateTimestamp() {
      const pullLength = this.currentPull.endTime - this.currentPull.startTime;
      const endTimestamp = new Date(pullLength).toISOString().slice(14, 19);
      const vodTime =
        this.player.getCurrentTime() -
        (this.reportStart -
          this.vodStartTime +
          this.currentPull.startTime -
          this.timeBeforePull) /
          1000;
      const minutes = Math.floor(vodTime / 60);
      const seconds = Math.floor(vodTime - minutes * 60);
      let currentTimestamp =
        this.strPadLeft(minutes, "0", 2) + ":" + this.strPadLeft(seconds, "0", 2);
      if (vodTime > pullLength / 1000) {
        currentTimestamp = endTimestamp;
      } else if (vodTime < 0) {
        currentTimestamp = "00:00";
      }
      this.currentTimestampDisplay = currentTimestamp + " / " + endTimestamp;
    },
    getPullNum(pullId: number) {
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
      if (Object.keys(this.currentPull).length > 0) {
        this.showHoverTimestamp = true;
      }
    },
    hideTimestamp() {
      this.showHoverTimestamp = false;
    },
    scrubMousePos(e: MouseEvent) {
      const scrubEl = document.getElementById("pull-scrub");
      const timelineWidth = scrubEl.offsetWidth;
      this.scrubX = (e.offsetX / timelineWidth) * 100;
      if (Object.keys(this.currentPull).length > 0) {
        const pullLength = this.currentPull.endTime - this.currentPull.startTime;
        this.hoverTimestampMs = (pullLength * this.scrubX) / 100;
        const timestamp = document.getElementById("pull-timestamp");
        const indicator = document.getElementById("timeline-indicator");
        const scrubY = scrubEl.getBoundingClientRect().y;
        timestamp.style.left = e.clientX - 24 + "px";
        timestamp.style.top = scrubY - 30 + "px";
        timestamp.innerHTML = new Date(this.hoverTimestampMs)
          .toISOString()
          .slice(14, 19);
        indicator.style.left = e.clientX + "px";
        indicator.style.top = scrubY + "px";
      }
    },
    scrubClick() {
      this.scrubGotoTime(this.scrubX);
      this.$nextTick(() => {
        if (!this.isPlaying) {
          this.focusPlayButton();
        } else {
          this.focusPauseButton();
        }
      });
    },
    updateScrubTime() {
      if (this.player == null) return;
      if (this.playerType === "twitch") {
        if (this.isPlaying && this.playerTimeWallClock > 0) {
          this.pullTimestamp = this.playerTimeRef + (Date.now() - this.playerTimeWallClock) / 1000;
        } else {
          this.pullTimestamp = this.playerTimeRef;
        }
      } else {
        this.pullTimestamp = this.player.getCurrentTime();
      }
    },
    scrubGotoTime(percentage: number) {
      const newTime =
        (this.pullEndTime - this.pullStartTime) * (percentage / 100) + this.pullStartTime;
      if (this.playerType === "twitch") {
        this.playerTimeRef = newTime;
        this.playerTimeWallClock = this.isPlaying ? Date.now() : 0;
        this.pullTimestamp = newTime;
        this.player.seek(newTime);
      } else if (this.playerType === "yubtub") {
        this.player.seekTo(newTime);
      }
    },
    clearScrubTimer() {
      this.scrubPercent = 0;
      clearInterval(this.scrubTimer);
      this.scrubTimer = 0;
    },
    async getTwitchId(twitchUrl: string) {
      try {
        const url = new URL(twitchUrl);
        const video = url.pathname.split("/");
        let videoIndex = video.indexOf("videos");
        if (videoIndex == -1) {
          videoIndex = video.indexOf("video");
        }
        this.twitchId = video[videoIndex + 1];
      } catch (error) {
        console.error(error);
        this.twitchId = "Please enter a valid Twitch VOD URL";
      } finally {
        this.getTwitchData(this.twitchId);
      }
    },
    async getTwitchData(videoId: string) {
      try {
        const response = await fetch(`${this.api_url}/twitch?videoId=${videoId}`);
        this.twitchData = await response.json();
        this.vodStartTime = parseInt(this.twitchData.timeArr[0].startTime);
        this.getTwitchPlayer(this.twitchId);
      } catch (error) {
        console.error("there was an error fetching twitch data: ", error);
      }
    },
    async getTwitchPlayer(videoId: string) {
      const Twitch = window.Twitch;
      const options = {
        width: "100%",
        height: "100%",
        video: videoId,
        autoplay: false,
        parent: [window.location.hostname],
      };
      if (this.player) {
        this.removePlayer();
      }
      this.player = new Twitch.Player("twitch-player", options);
      const element = document.getElementById("twitch-player")!;
      element.style.position = "absolute";
      element.style.width = "100%";
      element.style.height = "100%";
      element.style.top = "0";

      const onPlay = () => {
        if (this.player.isPaused()) return;
        this.isPlaying = true;
        this.playerTimeWallClock = Date.now();
        this.$nextTick(() => this.focusPauseButton());
        setTimeout(() => {
          if (!this.isPlaying) return;
          this.getPullNumber(this.player.getCurrentTime() + this.timeBeforePull / 1000);
        }, 500);
      };

      this.player.addEventListener(Twitch.Player.READY, () => {
        this.player.setQuality("chunked");
        this.playerType = "twitch";
      });
      this.player.addEventListener(Twitch.Player.PLAY, onPlay);
      this.player.addEventListener(Twitch.Player.PLAYING, onPlay);
      this.player.addEventListener(Twitch.Player.PAUSE, () => {
        this.isPlaying = false;
        this.playerTimeRef = this.player.getCurrentTime();
        this.playerTimeWallClock = 0;
        this.$nextTick(() => this.focusPlayButton());
        this.getPullNumber(this.playerTimeRef + this.timeBeforePull / 1000);
      });
    },
    getPullNumber(timestamp: number) {
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
      this.fightData = {};
      if (this.vod_url.includes("twitch")) {
        this.getTwitchId(this.vod_url);
      } else if (
        this.vod_url.includes("youtube") ||
        this.vod_url.includes("youtu.be")
      ) {
        this.getYoutubeId(this.vod_url);
      }
      this.getReportId(this.fflogs_url);
      if (
        this.cachedFightName != "" &&
        (this.cachedFights[this.cachedFightName]["vod"] != this.vod_url ||
          this.cachedFights[this.cachedFightName]["fflogs"] != this.fflogs_url)
      ) {
        this.cachedFightName = "";
      }
    },
    resetURLs() {
      this.removePlayer();
      this.vod_url = "";
      this.fflogs_url = "";
      this.cachedFightName = "";
      this.cachedFightSelected = null;
      this.playerType = "";
      this.twitchId = "";
      this.youtubeId = "";
      this.currentPull = {};
      this.fightData = {};
      this.timeBeforePull = 0;
      this.showGoogleWarning();
      this.clearScrubTimer();
      window.history.pushState({}, document.title, window.location.origin);
      // TODO: Clear logs
    },
    hideGoogleWarning() {
      this.showWelcome = false;
    },
    showGoogleWarning() {
      this.showWelcome = true;
    },
    removePlayer() {
      const twitchPlayer = document.getElementById("twitch-player");
      twitchPlayer.innerHTML = "";
      const youtubePlayer = document.getElementById("youtube-player-wrapper");
      youtubePlayer.innerHTML = "";
      const div = document.createElement("div");
      div.id = "youtube-player";
      youtubePlayer.append(div);
      this.player = null;
      this.playerType = "";
    },
    goToTimestamp(timestamp: string) {
      const vodTime = parseInt(timestamp);
      this.player.seek(vodTime);
    },
    getReportId(fflogsUrl: string) {
      try {
        const url = new URL(fflogsUrl);
        const report = url.pathname.split("/");
        const reportIndex = report.indexOf("reports");
        this.reportId = report[reportIndex + 1];
      } catch (error) {
        this.reportId = "Please enter a valid FFLogs report URL";
      } finally {
        this.getReportData(this.reportId);
      }
    },
    getReportData(reportId: string) {
      let getUrl = "";
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
    getReportDeathData(reportId: string, startTime: number, endTime: number, authToken: string | Record<string, never>) {
      let getUrl = "";
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
      let getUrl = `${this.api_url}/encounters?`;
      const encounterIds = new Set<number>();
      this.reportData.data.reportData.report.fights.forEach((fight: Object) => {
        if (!encounterIds.has(fight.encounterID)) {
          encounterIds.add(fight.encounterID);
          getUrl = getUrl + `id=${fight.encounterID}&`;
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
    },
    getFightData() {
      const fightsPerInstance = {};
      let pullNum = 1;
      if ("phases" in this.reportData.data.reportData.report) {
        const phaseMap = this.reportData.data.reportData.report.phases;
        phaseMap.forEach((encounter: Object) => {
          const encounterID = encounter.encounterID.toString();
          if (!(encounterID in this.phaseMap)) {
            this.phaseMap[encounterID] = [];
          }
          encounter.phases.forEach((phase: Object) => {
            this.phaseMap[encounterID].push(phase.name);
          });
        });
      }
      if (this.reportData) {
        this.reportData.data.reportData.report.fights.forEach(
          (fight: Object) => {
            let encounterName = "";
            fight["pullNum"] = pullNum++;
            if (this.encounterMap[fight.encounterID]) {
              const encounter = this.encounterMap[fight.encounterID];
              if (Object.keys(encounter.difficulties).length > 1) {
                const difficulty =
                  " - " + encounter.difficulties[fight.difficulty];
                encounterName =
                  this.encounterMap[fight.encounterID].name + difficulty;
              } else {
                encounterName = this.encounterMap[fight.encounterID].name;
              }
            } else {
              encounterName = fight.name;
            }
            fightsPerInstance[encounterName] =
              fightsPerInstance[encounterName] || [];
            const fightPercentage = 100 - fight.fightPercentage;
            let fightClass = "";
            if (fightPercentage < 25) {
              fightClass = "common";
            } else if (fightPercentage < 50) {
              fightClass = "uncommon";
            } else if (fightPercentage < 75) {
              fightClass = "rare";
            } else if (fightPercentage < 90) {
              fightClass = "epic";
            } else if (fightPercentage < 99) {
              fightClass = "legendary";
            } else if (fightPercentage < 100) {
              fightClass = "astounding";
            }
            fight["class"] = fightClass;
            if (fight.encounterID in this.phaseMap) {
              fight["phaseName"] =
                this.phaseMap[fight.encounterID][
                  fight.lastPhaseAsAbsoluteIndex
                ];
            }
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
            cachedFightsObj[fightName]["vod"] =
              cachedFightsObj[fightName]["twitch"];
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
          fightName: this.cachedFightName,
        };
        localStorage.setItem("cachedFights", JSON.stringify(this.cachedFights));
      }
    },
    removeCachedFight() {
      this.cachedFightSelected = null;
      delete this.cachedFights[this.cachedFightName];
      this.cachedFightName = "";
      localStorage.setItem("cachedFights", JSON.stringify(this.cachedFights));
    },
    updateCachedFights(updatedFights: Record<string, any>) {
      this.cachedFights = updatedFights;
      // TODO: make sure this works when editing a fight name, or just remove edit button
      this.cachedFightName = "";
      localStorage.setItem("cachedFights", JSON.stringify(this.cachedFights));
    },
    selectFight(selectedFight: string) {
      this.cachedFightSelected = selectedFight;
    },
    clearCachedFight() {
      this.cachedFightSelected = null;
      this.cachedFightName = "";
    },
    storeGoogleAuthToken(tokenResponse: Record<string, any>) {
      this.googleAuthToken = tokenResponse;
      this.googleAuthToken["expires_in"] = this.googleAuthToken["expires_in"] * 1000;
      this.googleAuthToken["created_time"] = Date.now();
      localStorage.setItem("cachedGoogleAuthToken", JSON.stringify(this.googleAuthToken));
      clearTimeout(this.googleAuthTokenTimer);
      this.googleAuthTokenTimer = setTimeout(this.clearGoogleAuthToken, this.googleAuthToken["expires_in"]);
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
          const tokenTimeout =
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
            const video = url.href.split("watch?")[1];
            const queries = video.split("&");
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
        console.error(error);
        this.youtubeId = "Please enter a valid YouTube VOD URL";
      } finally {
        this.getYoutubeData(this.youtubeId);
      }
    },
    getYoutubeData(videoId: string) {
      let authToken = "";
      let getUrl = "";
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
      const element = document.getElementById("youtube-player")!
      element.style.position = "absolute";
      element.style.width = "100%";
      element.style.height = "100%";
      element.style.top = "0";
      this.player.addEventListener("onReady", () => {
        this.player.setPlaybackQuality("highres");
        this.playerType = "yubtub";
      });
      this.player.addEventListener("onStateChange", (value: any) => {
        if (value.data == YT.PlayerState.PLAYING) {
          this.playVod();
          setTimeout(() => {
            this.getPullNumber(
              this.player.getCurrentTime() + this.timeBeforePull / 1000
            );
          }, 2000);
        } else if (value.data == YT.PlayerState.PAUSED) {
          this.pauseVod();
          setTimeout(() => {
            this.getPullNumber(
              this.player.getCurrentTime() + this.timeBeforePull / 1000
            );
          }, 2000);
        }
      });
    },
    dec2hex(dec: number): string {
      return ("0" + dec.toString(16)).substr(-2);
    },
    generateCodeVerifier() {
      const array = new Uint32Array(56 / 2);
      window.crypto.getRandomValues(array);
      return Array.from(array, this.dec2hex).join("");
    },
    sha256(plain: string): Promise<ArrayBuffer> {
      const encoder = new TextEncoder();
      const data = encoder.encode(plain);
      return window.crypto.subtle.digest("SHA-256", data);
    },
    base64urlencode(a: ArrayBuffer): string {
      let str = "";
      const bytes = new Uint8Array(a);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        str += String.fromCharCode(bytes[i]);
      }
      return btoa(str)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    },
    async generateCodeChallengeFromVerifier(v: string): Promise<string> {
      const hashed = await this.sha256(v);
      const base64encoded = this.base64urlencode(hashed);
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
        `${window.location.origin}/oauth-callback.html`
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
          try {
            const href = fflogsPopup.window.location.href;
            if (href.includes("oauth-callback.html")) {
              const url = new URL(href);
              const state = url.searchParams.get("state");
              clearInterval(checkPopup);
              fflogsPopup.close();
              if (state === this.fflogsAuthState) {
                this.fflogsAuthCode = url.searchParams.get("code");
              } else {
                console.error("FFLogs auth state mismatch");
              }
            }
          } catch {
            // Popup is still on fflogs.com (cross-origin) — keep polling
          }
          if (fflogsPopup.closed) clearInterval(checkPopup);
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
          const tokenTimeout =
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
      let vodId = "";
      let vodType = "";
      if (this.twitchId != "") {
        vodId = this.twitchId;
        vodType = "twitch";
      } else if (this.youtubeId != "") {
        vodId = this.youtubeId;
        vodType = "youtube";
      }
      const shareUrl = `${window.location.origin}?${vodType}=${vodId}&fflogs=${this.reportId}&offset=${this.timeBeforePull}`;
      navigator.clipboard.writeText(shareUrl);
      alert(`Copied "${shareUrl}" to clipboard.`);
    },
  },
  beforeMount() {
    window.addEventListener("keydown", this.handleKeydown, null);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeydown);
    clearInterval(this.scrubTimer);
    clearTimeout(this.googleAuthTokenTimer);
    clearTimeout(this.fflogsAuthTokenTimer);
  },
  mounted() {
    const bootstrap = window.bootstrap;
    const queryObj = new URLSearchParams(window.location.search);
    if (window.location.search != "") {
      const check: Record<string, any> = { offset: 0 };
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
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(function (tooltipTriggerEl) {
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
  backface-visibility: hidden;
  z-index: 9999999;
  cursor: pointer;
  background: #3f3f3f;
  border: 2px solid black;
  text-align: center;
}

#timeline-indicator {
  height: 3vh;
  width: 1px;
  background: black;
  position: absolute;
  backface-visibility: hidden;
  z-index: 9999999;
  cursor: pointer;
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
#play-button {
  position: absolute;
  top: 0px;
  left: 0px;
  padding: 4px 6px 4px 7px;
}
#pause-button {
  position: absolute;
  top: 0px;
  left: 0px;
  padding: 4px 6px 4px 7px;
}
#jump-forward {
  padding: 3px 6px 4px 7px;
}
#jump-backward {
  padding: 3px 6px 4px 7px;
}
</style>
