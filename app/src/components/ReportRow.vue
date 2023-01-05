<template>
  <tr>
    <th scope="row">{{ fightEntry.id }}</th>
    <td v-if="fightEntry.fightPercentage == null">null</td>
    <td v-else>{{ `${Number(fightEntry.fightPercentage).toFixed(2)}%` }}</td>
    <td>
      <button class="btn btn-outline-primary" @click="goToTimestamp(pullTimeInVod)">{{ timestamp }}</button>
    </td>
    <td id="fflogs-link">
      <a :href="'https://www.fflogs.com/reports/' + reportId + '/#fight=' + fightEntry.id" class="btn btn-outline-info" role="button" target="_blank">Report</a>
    </td>
  </tr>
</template>

<script lang="ts">
export default {
  data() {
    return {
      pullTimeInVod: 0,
      timestamp: '',
    }
  },
  props: [
    'fightEntry',
    'reportId',
    'reportStart',
    'twitchVodStart',
    'timeBeforePull',
    'player'
  ],
  methods: {
    goToTimestamp(pullTimeInVod: Number) {
      this.player.seek(pullTimeInVod)
    },
  },
  created() {
    this.pullTimeInVod = Math.floor((this.reportStart - this.twitchVodStart + this.fightEntry.startTime) / 1000) - this.timeBeforePull
    this.timestamp = new Date(this.pullTimeInVod * 1000).toISOString().slice(11, 19);
  },
  updated() {
    this.pullTimeInVod = Math.floor((this.reportStart - this.twitchVodStart + this.fightEntry.startTime) / 1000) - this.timeBeforePull
    this.timestamp = new Date(this.pullTimeInVod * 1000).toISOString().slice(11, 19);
  },
}
</script>
