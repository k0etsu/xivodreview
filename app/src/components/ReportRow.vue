<script setup lang="ts">
import DeathTable from "./DeathTable.vue";
</script>

<template>
  <tr>
    <th scope="row">{{ fightEntry.id }}</th>
    <td v-if="fightEntry.fightPercentage == null">null</td>
    <td v-else>{{ `${Number(fightEntry.fightPercentage).toFixed(2)}%` }}</td>
    <td>
      <button
        class="btn btn-outline-primary"
        @click="goToTimestamp(pullTimeInVod)"
      >
        {{ timestamp }}
      </button>
    </td>
    <td>
      <button
        class="btn btn-outline-danger"
        type="button"
        data-bs-toggle="collapse"
        :data-bs-target="'#deaths-' + fightEntry.id"
        aria-expanded="false"
      >
        Expand
      </button>
    </td>
    <td id="fflogs-link">
      <a
        :href="
          'https://www.fflogs.com/reports/' +
          reportId +
          '/#fight=' +
          fightEntry.id
        "
        class="btn btn-outline-info"
        role="button"
        target="_blank"
        >Report</a
      >
    </td>
  </tr>
  <tr class="collapse" :id="'deaths-' + fightEntry.id">
    <DeathTable
      :fightId="fightEntry.id"
      :deathData="deathData"
      :reportStart="reportStart"
      :twitchVodStart="twitchVodStart"
      :timeBeforePull="timeBeforePull"
      :player="player"
    />
  </tr>
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
    "twitchVodStart",
    "timeBeforePull",
    "player",
  ],
  components: {
    DeathTable,
  },
  methods: {
    goToTimestamp(pullTimeInVod: Number) {
      if (typeof this.player.seek === 'function') {
        this.player.seek(pullTimeInVod);
      }
      else {
        console.log(this.reportStart)
        console.log(this.twitchVodStart)
        console.log(this.fightEntry.startTime)
        console.log(this.timeBeforePull)
        this.player.seekTo(pullTimeInVod / 1000);
      }
    },
  },
  created() {
    this.pullTimeInVod =
      Math.floor(
        (this.reportStart - this.twitchVodStart + this.fightEntry.startTime) /
          1000
      ) - this.timeBeforePull;
    this.timestamp = new Date(this.pullTimeInVod * 1000)
      .toISOString()
      .slice(11, 19);
  },
  updated() {
    this.pullTimeInVod =
      Math.floor(
        (this.reportStart - this.twitchVodStart + this.fightEntry.startTime) /
          1000
      ) - this.timeBeforePull;
    this.timestamp = new Date(this.pullTimeInVod * 1000)
      .toISOString()
      .slice(11, 19);
  },
};
</script>
