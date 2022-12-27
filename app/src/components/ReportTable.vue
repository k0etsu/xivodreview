<script setup lang="ts">
  import ReportRow from "./ReportRow.vue"
</script>

<template>
  <h4>{{ fightTitle }}</h4>
  <table class="table table-sm table-striped table-hover">
    <thead>
      <tr>
        <th scope="col">Pull</th>
        <th scope="col">Fight Percentage</th>
        <th scope="col">Goto Pull</th>
        <th scope="col">FFLogs Link</th>
      </tr>
    </thead>
    <tbody>
      <ReportRow
        v-for="fightEntry in fightEntries"
        :fightEntry="fightEntry"
        :reportId="reportId"
        :reportStart="reportStart"
        :twitchVodStart="twitchVodStart"
        :timeBeforePull="timeBeforePull"
        :player="player"
      />
    </tbody>
  </table>
</template>

<script lang="ts">
export default {
  props: [
    'fightTitle',
    'fightEntries',
    'reportId',
    'reportStart',
    'twitchVodStart',
    'timeBeforePull',
    'player'
  ],
  components: {
    ReportRow
  },
  created() {
    console.log("reporttable created");
    console.log(this.fightTitle);
    console.log(this.fightEntries);
    console.log(this.reportStart);
    console.log(this.twitchVodStart);
    console.log(this.player);
  },
  updated() {
    console.log("reporttable updated");
    console.log(this.fightTitle);
    console.log(this.fightEntries);
    console.log(this.reportStart);
    console.log(this.twitchVodStart);
    console.log(this.player);
  }
}
</script>
