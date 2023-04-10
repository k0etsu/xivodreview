<script setup lang="ts"></script>

<template>
  <div class="col-md-auto">
    <button class="btn pull-button" @click="goToTimestamp(pullTimeInVod)">
      <div class="pull-entry wipe">
        <div class="pull-grid-cell-container">
          <div class="percent-phase">
            <div style="display: block">
              <span
                v-if="fightEntry.fightPercentage === null"
                class="fight-grid-cell-percent common"
                >--</span
              >
              <div
                v-else-if="fightEntry.kill"
                class="fight-grid-cell-percent kill"
              >
                <span>KILL</span>
                <br />
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    fill="currentColor"
                    class="bi bi-check-circle-fill"
                    viewBox="0 0 16 16"
                    style="margin-top: -0.5em"
                  >
                    <path
                      d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"
                    />
                  </svg>
                </span>
              </div>
              <span
                v-else-if="fightEntry.lastPhase != 0"
                class="fight-grid-cell-percent"
                :class="fightEntry.class"
              >
                {{ `${Number(fightEntry.bossPercentage).toFixed(0)}%` }}
              </span>
              <span
                v-else
                class="fight-grid-cell-percent"
                :class="fightEntry.class"
                >{{
                  `${Number(100 - fightEntry.fightPercentage).toFixed(0)}%`
                }}</span
              >
              <span
                class="fight-grid-cell-phase"
                v-if="fightEntry.lastPhase != 0"
                >{{ `P${fightEntry.lastPhase}` }}</span
              >
            </div>
          </div>
          <div class="pull-info">
            <span class="fight-grid-number">{{ fightEntry.id }}</span>
            <span class="fight-grid-duration">{{
              `(${new Date(fightEntry.endTime - fightEntry.startTime)
                .toISOString()
                .slice(14, 19)})`
            }}</span>
            <span class="fight-grid-time">{{
              new Date(reportStart + fightEntry.startTime).toLocaleTimeString()
            }}</span>
          </div>
        </div>
        <div class="wipes-percent-bg">
          <div
            v-if="fightEntry.kill"
            class="wipes-percent-fg kill-bg"
            style="width: 100%"
          ></div>
          <div
            v-else
            class="wipes-percent-fg"
            :class="`${fightEntry.class}-bg`"
            :style="{
              width: `${Number(100 - fightEntry.fightPercentage).toFixed(2)}%`,
            }"
          ></div>
        </div>
      </div>
    </button>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      pullTimeInVod: 0,
      timestamp: "",
    };
  },
  props: [
    "fightEntry",
    "deathData",
    "reportId",
    "reportStart",
    "vodStartTime",
    "timeBeforePull",
    "player",
  ],
  emits: ["getPullDeaths"],
  components: {},
  methods: {
    goToTimestamp(pullTimeInVod: Number) {
      if (typeof this.player.seek === "function") {
        this.player.pause();
        this.player.seek(pullTimeInVod);
        setTimeout(() => {
          this.player.play();
        }, 500);
      } else {
        this.player.seekTo(pullTimeInVod);
      }
      this.$emit("getPullDeaths", this.fightEntry.id);
    },
  },
  created() {
    this.pullTimeInVod =
      (this.reportStart -
        this.vodStartTime +
        this.fightEntry.startTime -
        this.timeBeforePull) /
      1000;
    this.timestamp = new Date(this.pullTimeInVod * 1000)
      .toISOString()
      .slice(11, 19);
  },
  updated() {
    this.pullTimeInVod =
      (this.reportStart -
        this.vodStartTime +
        this.fightEntry.startTime -
        this.timeBeforePull) /
      1000;
    this.timestamp = new Date(this.pullTimeInVod * 1000)
      .toISOString()
      .slice(11, 19);
  },
};
</script>

<style scoped>
.pull-button {
  --bs-btn-padding-x: 0rem;
  --bs-btn-padding-y: 0rem;
}

.pull-entry {
  border: 1px solid #303030;
  float: left;
  margin: 5px 1px 1px 4px;
  background-color: #141414;
}

.pull-grid-cell-container {
  display: flex;
  flex-direction: row;
  min-width: 160px;
  justify-content: center;
  align-items: stretch;
}

.percent-phase {
  min-width: 43px;
  box-sizing: border-box;
  border-right: 1px solid #303030;
  text-align: center;
  padding: 2px 3px 0px 3px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #0d0d0d;
  flex-grow: 1;
}

.fight-grid-cell-percent {
  font-weight: 700;
  display: block;
  font-size: 14px;
}

.fight-grid-cell-phase {
  font-size: 11px;
  color: #b6b6b6;
  display: block;
  font-weight: 700;
  margin-top: -1px;
}

.fight-grid-number {
  text-align: right;
  display: inline-table;
  margin-right: 5px;
  font-size: 14px;
}

.pull-info {
  padding: 4px 3px 3px 3px;
  text-align: center;
  min-width: 109px;
  background-color: #141414;
  flex-grow: 1;
}

.fight-grid-number {
  text-align: right;
  display: inline-table;
  margin-right: 5px;
  font-size: 14px;
}

.fight-grid-duration {
  display: inline-table;
  margin-right: 0;
  font-size: 14px;
}

.fight-grid-time {
  display: table;
  margin: -1px auto 0;
  color: #b6b6b6;
  font-size: 11px;
}

.wipes-percent-bg {
  height: 3px;
  width: 100%;
  margin: 0;
  background-color: #303030;
  border: 1px solid #303030;
  box-sizing: border-box;
  border-left: none;
  border-right: none;
}

.wipes-percent-fg {
  height: 2px;
}

.wipe {
  color: #e68066 !important;
}
.kill {
  color: #80e666 !important;
}
.kill-bg {
  background-color: #80e666 !important;
}
.common {
  color: #afafaf !important;
}
.common-bg {
  background-color: #ccc !important;
}

.uncommon {
  color: #0f8000 !important;
}

.uncommon-bg {
  background-color: #0f8000 !important;
}

.rare {
  color: #0070ff !important;
}

.rare-bg {
  background-color: #0070ff !important;
}

.epic {
  color: #a335ee !important;
}

.epic-bg {
  background-color: #a335ee !important;
}

.legendary {
  color: #d7822d !important;
}

.legendary-bg {
  background-color: #ff8000 !important;
}

.kill {
  color: #60d742 !important;
}

.table-buttons {
  margin-top: 13px;
}
</style>
