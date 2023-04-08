<script setup lang="ts">
import ReportGrid from "./ReportGrid.vue";
import DeathTable from "./DeathTable.vue";
</script>

<template>
  <ReportGrid
    v-for="(fightEntries, fightTitle) in fightData"
    :key="reportId + fightTitle"
    :fightTitle="fightTitle"
    :fightEntries="fightEntries"
    :deathData="deathData"
    :reportId="reportId"
    :reportStart="reportStart"
    :vodStartTime="vodStartTime"
    :timeBeforePull="timeBeforePull"
    :player="player"
    @get-pull-deaths="getPullDeaths"
  />
  <div v-if="pullId > 0" style="margin-top: 1.5rem">
    <DeathTable
      :key="reportId + pullId"
      :fightId="pullId"
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
    };
  },
  props: [
    "fightData",
    "deathData",
    "reportId",
    "reportStart",
    "vodStartTime",
    "timeBeforePull",
    "player",
  ],
  components: {
    ReportGrid,
    DeathTable,
  },
  methods: {
    getPullDeaths(pullId) {
      console.log("getpulldeaths", pullId);
      this.pullId = pullId;
    },
  },
};
</script>
