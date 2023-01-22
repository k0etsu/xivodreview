<script setup lang="ts">
import ReportTable from "./ReportTable.vue";
</script>

<template>
  <ReportTable
    v-for="(fightEntries, fightTitle) in fightData"
    :key="fightTitle"
    :fightTitle="fightTitle"
    :fightEntries="fightEntries"
    :deathData="deathData"
    :reportId="reportId"
    :reportStart="reportStart"
    :vodStartTime="vodStartTime"
    :timeBeforePull="timeBeforePull"
    :player="player"
  />
</template>

<script lang="ts">
export default {
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
    ReportTable,
  },
};
</script>
