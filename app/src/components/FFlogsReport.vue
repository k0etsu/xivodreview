<script setup lang="ts">
import ReportGrid from "./ReportGrid.vue";
import DeathTable from "./DeathTable.vue";
</script>

<template>
  <h4>Pulls {{ date }}</h4>
  <div class="accordion accordion-flush">
    <ReportGrid
      v-for="(fightEntries, fightTitle) in fightData"
      :key="reportId + fightTitle"
      :selectedId="pullId"
      :fightTitle="fightTitle"
      :fightEntries="fightEntries"
      :phaseMap="phaseMap"
      :deathData="deathData"
      :reportId="reportId"
      :reportStart="reportStart"
      :vodStartTime="vodStartTime"
      :timeBeforePull="timeBeforePull"
      :player="player"
      @get-pull-deaths="getPullDeaths"
    />
  </div>
  <div v-if="pullId > 0" style="margin-top: 1.5rem">
    <DeathTable
      :key="reportId + pullId"
      :fightId="pullId"
      :fightData="fightData"
      :pullNum="pullNum"
      :deathData="deathData"
      :reportId="reportId"
      :reportStart="reportStart"
      :vodStartTime="vodStartTime"
      :timeBeforePull="timeBeforePull"
      :player="player"
    />
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      pullId: 0,
      pullNum: 0,
      date: "",
    };
  },
  props: [
    "fightData",
    "deathData",
    "phaseMap",
    "reportId",
    "reportStart",
    "vodStartTime",
    "timeBeforePull",
    "player",
  ],
  emits: ["getPullNum"],
  components: {
    ReportGrid,
    DeathTable,
  },
  methods: {
    getPullDeaths(pullId, pullNum) {
      console.log("getpulldeaths", pullId, pullNum);
      this.pullId = pullId;
      this.pullNum = pullNum;
      this.$emit("getPullNum", pullNum);
    },
  },
  beforeCreate() {
    this.date =
      "(" + new Date(this.reportStart).toISOString().slice(0, 10) + ")";
  },
  updated() {
    this.date =
      "(" + new Date(this.reportStart).toISOString().slice(0, 10) + ")";
  },
};
</script>
