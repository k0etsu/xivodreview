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
  <!-- <div v-for="(fightEntries, fightTitle) in fightData">
    <h4>{{fightTitle}}</h4>
    <table class="table">
      <thead>
        <tr>
          <th scope="col">id</th>
          <th>%</th>
          <th>Button</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="fightEntry in fightEntries">
          <th scope="row">{{ fightEntry.id }}</th>
          <td>{{fightEntry.fightPercentage}}</td>
          <td><button class='btn btn-primary'>click me</button></td>
        </tr>
      </tbody>
    </table>
  </div> -->
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
