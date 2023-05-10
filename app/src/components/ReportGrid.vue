<script setup lang="ts">
import ReportPull from "./ReportPull.vue";
</script>

<template>
  <h4>{{ fightTitle }}</h4>
  <div class="row g-0 justify-content-start log-pulls">
    <ReportPull
      v-for="fightEntry in fightEntries"
      :key="reportId + fightTitle + fightEntry.id"
      :fightEntry="fightEntry"
      :deathData="deathData"
      :reportId="reportId"
      :reportStart="reportStart"
      :vodStartTime="vodStartTime"
      :timeBeforePull="timeBeforePull"
      :player="player"
      @get-pull-deaths="getPullDeaths"
    />
  </div>
</template>

<script lang="ts">
export default {
  props: [
    "fightTitle",
    "fightEntries",
    "deathData",
    "reportId",
    "reportStart",
    "vodStartTime",
    "timeBeforePull",
    "player",
  ],
  emits: ["getPullDeaths"],
  components: {
    ReportPull,
  },
  methods: {
    getPullDeaths(pullId, pullNum) {
      this.$emit("getPullDeaths", pullId, pullNum);
    },
  },
  created() {
    console.log(this.fightEntries);
  },
};
</script>

<style scoped>
.log-pulls {
  margin-bottom: 1.5em;
}
</style>
