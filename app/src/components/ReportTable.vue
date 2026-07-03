<script setup lang="ts">
import ReportRow from "./ReportRow.vue";
</script>

<template>
  <h4>{{ fightTitle }}</h4>
  <table class="table table-sm table-striped table-hover">
    <thead>
      <tr>
        <th scope="col">Pull</th>
        <!-- <th scope="col">Fight Percentage</th>
        <th scope="col">Goto Pull</th> -->
        <th scope="col">Deaths</th>
        <th scope="col">FFLogs</th>
      </tr>
    </thead>
    <tbody>
      <ReportRow
        v-for="fightEntry in fightEntries"
        :key="reportId + fightTitle + fightEntry.id"
        :fightEntry="fightEntry"
        :deathData="deathData"
        :reportId="reportId"
        :reportStart="reportStart"
        :vodStartTime="vodStartTime"
        :timeBeforePull="timeBeforePull"
        :player="player"
      />
    </tbody>
  </table>
</template>

<script lang="ts">
export default {
  props: {
    fightTitle: { type: String, default: '' },
    fightEntries: { type: Array, default: () => [] },
    deathData: { type: Object, default: () => ({}) },
    reportId: { type: String, default: '' },
    reportStart: { type: Number, default: 0 },
    vodStartTime: { type: Number, default: 0 },
    timeBeforePull: { type: Number, default: 0 },
    player: { type: Object, default: null },
  },
  components: {
    ReportRow,
  },
  created() {
    console.log(this.fightEntries);
  },
};
</script>
