<script setup lang="ts">
  import ReportTable from "./ReportTable.vue"
</script>

<template>
  <ReportTable
    v-for="(fightEntries, fightTitle) in fightData"
    :fightTitle="fightTitle"
    :fightEntries="fightEntries"
    :reportId="reportId"
    :reportStart="reportStart"
    :twitchVodStart="twitchVodStart"
    :timeBeforePull="timeBeforePull"
    :player="player"
  />
</template>

<script lang="ts">
export default {
  props: [
    'fightData',
    'reportId',
    'reportStart',
    'twitchVodStart',
    'timeBeforePull',
    'player'
  ],
  components: {
    ReportTable
  },
  created() {
    console.log("logsreport created")
    console.log(this.fightData);
    console.log(this.reportStart);
    console.log(this.twitchVodStart);
    console.log(this.player);
  },
  updated() {
    console.log("logsreport updated")
    console.log(this.fightData);
    console.log(this.reportStart);
    console.log(this.twitchVodStart);
    console.log(this.player);
  }
}
</script>
