<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import NavigationBar from "./components/NavigationBar.vue";
import FFlogsReport from "./components/FFlogsReport.vue";
import SavedFightTable from "./components/SavedFightTable.vue";
import { useAuth } from "./composables/useAuth";
import { usePlayer } from "./composables/usePlayer";
import { useFFLogs } from "./composables/useFFLogs";

const {
  googleAuthToken,
  fflogsAuthToken,
  storeGoogleAuthToken,
  clearGoogleAuthToken,
  getFflogsAuthToken,
  clearFflogsAuthToken,
} = useAuth();

const {
  player,
  playerType,
  isPlaying,
  vodStartTime,
  showWelcome,
  twitchId,
  youtubeId,
  seekTime,
  focusPlay,
  focusPause,
  getTwitchId,
  getYoutubeId,
  playVod,
  pauseVod,
  jumpForward,
  jumpBackward,
  removePlayer,
  hideGoogleWarning,
  showGoogleWarning,
} = usePlayer(googleAuthToken);

const {
  fflogs_url,
  reportId,
  reportStart,
  fightData,
  phaseMap,
  deathData,
  currentPull,
  timeBeforePull,
  getReportId,
  getPullNum,
} = useFFLogs(fflogsAuthToken, vodStartTime);

// VOD URL input (orchestrated across composables)
const vod_url = ref("");

// Cached fights management
const cachedFights = ref<Record<string, any>>({});
const cachedFightName = ref("");
const cachedFightSelected = ref<string | null>(null);

function getCachedFights() {
  const stored = localStorage.getItem("cachedFights");
  if (stored) {
    const cachedFightsObj = JSON.parse(stored);
    Object.keys(cachedFightsObj).forEach((fightName) => {
      if (!("vod" in cachedFightsObj[fightName])) {
        cachedFightsObj[fightName]["vod"] = cachedFightsObj[fightName]["twitch"];
      }
      if (!("offset" in cachedFightsObj[fightName])) {
        cachedFightsObj[fightName]["offset"] = 0;
      }
      cachedFights.value[fightName] = cachedFightsObj[fightName];
    });
    localStorage.setItem("cachedFights", JSON.stringify(cachedFights.value));
  }
}

function addCachedFight() {
  if (cachedFightName.value != "") {
    cachedFights.value[cachedFightName.value] = {
      vod: vod_url.value,
      fflogs: fflogs_url.value,
      offset: timeBeforePull.value,
      fightName: cachedFightName.value,
    };
    localStorage.setItem("cachedFights", JSON.stringify(cachedFights.value));
  }
}

function removeCachedFight() {
  cachedFightSelected.value = null;
  delete cachedFights.value[cachedFightName.value];
  cachedFightName.value = "";
  localStorage.setItem("cachedFights", JSON.stringify(cachedFights.value));
}

function updateCachedFights(updatedFights: Record<string, any>) {
  cachedFights.value = updatedFights;
  cachedFightName.value = "";
  localStorage.setItem("cachedFights", JSON.stringify(cachedFights.value));
}

function selectFight(selectedFight: string) {
  cachedFightSelected.value = selectedFight;
}

function clearCachedFight() {
  cachedFightSelected.value = null;
  cachedFightName.value = "";
}

// Scrubber state (to be extracted into a TimelineScrubber component later)
const scrubTimer = ref(0);
const pullTimestamp = ref(0);
const scrubX = ref(0);
const hoverTimestampMs = ref(0);
const scrubPercent = ref(0);
const currentTimestampDisplay = ref("00:00 / 00:00");
const showHoverTimestamp = ref(false);

const pullStartTime = computed((): number => {
  if (!currentPull.value || !currentPull.value.startTime) return 0;
  return (
    (currentPull.value.startTime +
      reportStart.value -
      vodStartTime.value -
      timeBeforePull.value) /
    1000
  );
});

const pullEndTime = computed((): number => {
  if (!currentPull.value || !currentPull.value.endTime) return 0;
  return (
    (currentPull.value.endTime +
      reportStart.value -
      vodStartTime.value -
      timeBeforePull.value) /
    1000
  );
});

function strPadLeft(value: number, pad: string, length: number): string {
  return (new Array(length + 1).join(pad) + String(value)).slice(-length);
}

function updateTimestamp() {
  const pullLength = currentPull.value.endTime - currentPull.value.startTime;
  const endTimestamp = new Date(pullLength).toISOString().slice(14, 19);
  const vodTime =
    player.value.getCurrentTime() -
    (reportStart.value -
      vodStartTime.value +
      currentPull.value.startTime -
      timeBeforePull.value) /
      1000;
  const minutes = Math.floor(vodTime / 60);
  const seconds = Math.floor(vodTime - minutes * 60);
  let currentTimestamp =
    strPadLeft(minutes, "0", 2) + ":" + strPadLeft(seconds, "0", 2);
  if (vodTime > pullLength / 1000) {
    currentTimestamp = endTimestamp;
  } else if (vodTime < 0) {
    currentTimestamp = "00:00";
  }
  currentTimestampDisplay.value = currentTimestamp + " / " + endTimestamp;
}

function decreaseOffset() {
  timeBeforePull.value = timeBeforePull.value - 500;
}

function increaseOffset() {
  timeBeforePull.value = timeBeforePull.value + 500;
}

function showTimestamp() {
  if (Object.keys(currentPull.value).length > 0) {
    showHoverTimestamp.value = true;
  }
}

function hideTimestamp() {
  showHoverTimestamp.value = false;
}

function scrubMousePos(e: MouseEvent) {
  const scrubEl = document.getElementById("pull-scrub")!;
  const timelineWidth = scrubEl.offsetWidth;
  scrubX.value = (e.offsetX / timelineWidth) * 100;
  if (Object.keys(currentPull.value).length > 0) {
    const pullLength = currentPull.value.endTime - currentPull.value.startTime;
    hoverTimestampMs.value = (pullLength * scrubX.value) / 100;
    const timestamp = document.getElementById("pull-timestamp")!;
    const indicator = document.getElementById("timeline-indicator")!;
    const scrubY = scrubEl.getBoundingClientRect().y;
    timestamp.style.left = e.clientX - 24 + "px";
    timestamp.style.top = scrubY - 30 + "px";
    timestamp.innerHTML = new Date(hoverTimestampMs.value)
      .toISOString()
      .slice(14, 19);
    indicator.style.left = e.clientX + "px";
    indicator.style.top = scrubY + "px";
  }
}

function scrubGotoTime(percentage: number) {
  const newTime =
    (pullEndTime.value - pullStartTime.value) * (percentage / 100) +
    pullStartTime.value;
  if (playerType.value === "twitch") {
    player.value.seek(newTime);
  } else if (playerType.value === "yubtub") {
    player.value.seekTo(newTime);
  }
}

function scrubClick() {
  scrubGotoTime(scrubX.value);
  nextTick(() => {
    if (!isPlaying.value) {
      focusPlay.value?.focus();
    } else {
      focusPause.value?.focus();
    }
  });
}

function updateScrubTime() {
  if (player.value == null) return;
  pullTimestamp.value = player.value.getCurrentTime();
}

function clearScrubTimer() {
  scrubPercent.value = 0;
  clearInterval(scrubTimer.value);
  scrubTimer.value = 0;
}

// Orchestration across composables
function submitURLs() {
  hideGoogleWarning();
  clearScrubTimer();
  removePlayer();
  twitchId.value = "";
  youtubeId.value = "";
  currentPull.value = {};
  fightData.value = {};
  if (vod_url.value.includes("twitch")) {
    getTwitchId(vod_url.value);
  } else if (
    vod_url.value.includes("youtube") ||
    vod_url.value.includes("youtu.be")
  ) {
    getYoutubeId(vod_url.value);
  }
  getReportId(fflogs_url.value);
  if (
    cachedFightName.value != "" &&
    (cachedFights.value[cachedFightName.value]["vod"] != vod_url.value ||
      cachedFights.value[cachedFightName.value]["fflogs"] != fflogs_url.value)
  ) {
    cachedFightName.value = "";
  }
}

function resetURLs() {
  removePlayer();
  vod_url.value = "";
  fflogs_url.value = "";
  cachedFightName.value = "";
  cachedFightSelected.value = null;
  playerType.value = "";
  twitchId.value = "";
  youtubeId.value = "";
  currentPull.value = {};
  fightData.value = {};
  timeBeforePull.value = 0;
  showGoogleWarning();
  clearScrubTimer();
  window.history.pushState({}, document.title, window.location.origin);
}

function shareURLs() {
  let vodId = "";
  let vodType = "";
  if (twitchId.value != "") {
    vodId = twitchId.value;
    vodType = "twitch";
  } else if (youtubeId.value != "") {
    vodId = youtubeId.value;
    vodType = "youtube";
  }
  const shareUrl = `${window.location.origin}?${vodType}=${vodId}&fflogs=${reportId.value}&offset=${timeBeforePull.value}`;
  navigator.clipboard.writeText(shareUrl);
  alert(`Copied "${shareUrl}" to clipboard.`);
}

watch(cachedFightSelected, (encounter) => {
  if (encounter != null) {
    cachedFightName.value = encounter;
    vod_url.value = cachedFights.value[encounter].vod;
    fflogs_url.value = cachedFights.value[encounter].fflogs;
    timeBeforePull.value = cachedFights.value[encounter].offset || 0;
    submitURLs();
    cachedFightSelected.value = null;
  }
});

watch(timeBeforePull, (newValue: number) => {
  if (cachedFights.value[cachedFightName.value]) {
    cachedFights.value[cachedFightName.value]["offset"] = newValue;
    localStorage.setItem("cachedFights", JSON.stringify(cachedFights.value));
  }
});

watch(currentPull, (newValue: any) => {
  if (Object.keys(newValue).length > 0) {
    if (
      pullTimestamp.value < pullStartTime.value ||
      pullTimestamp.value > pullEndTime.value
    ) {
      pullTimestamp.value = pullStartTime.value;
    }
    clearInterval(scrubTimer.value);
    scrubTimer.value = setInterval(() => {
      updateScrubTime();
      updateTimestamp();
    }, 200);
  }
});

watch(pullTimestamp, (newValue: number) => {
  const range = pullEndTime.value - pullStartTime.value;
  scrubPercent.value =
    range > 0 ? ((newValue - pullStartTime.value) / range) * 100 : 0;
});

watch(seekTime, (time: number) => {
  pullTimestamp.value = time;
});

getCachedFights();

onMounted(() => {
  const bootstrap = window.bootstrap;
  const queryObj = new URLSearchParams(window.location.search);
  if (window.location.search != "") {
    const check: Record<string, any> = { offset: 0 };
    for (const [key, value] of queryObj) {
      if (key == "twitch") {
        vod_url.value = `https://www.twitch.tv/videos/${value}`;
        check["vod"] = "twitch";
      } else if (key == "youtube") {
        vod_url.value = `https://www.youtube.com/watch?v=${value}`;
        check["vod"] = "youtube";
      } else if (key == "fflogs") {
        fflogs_url.value = `https://www.fflogs.com/reports/${value}`;
        check["fflogs"] = value;
      } else if (key == "offset") {
        timeBeforePull.value = Number(value);
        check["offset"] = Number(value);
      }
    }
    if ("vod" in check && "fflogs" in check) {
      submitURLs();
    }
  }
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});

onBeforeUnmount(() => {
  clearInterval(scrubTimer.value);
});
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
