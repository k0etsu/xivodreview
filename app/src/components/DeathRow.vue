<template>
  <tr>
    <th>
      <a
        :href="
          'https://www.fflogs.com/reports/' + reportId + '/#fight=' + fightId + '&type=deaths&death=' + (index+1)
        "
        class="btn btn-outline-info table-buttons"
        role="button"
        target="_blank"
      >
        {{ deathData.player }}
      </a>
    </th>
    <td>{{ deathData.source }}</td>
    <td v-if="deathData.ability == null">null</td>
    <td v-else>{{ deathData.ability }}</td>
    <td>
      <button
        class="btn btn-outline-primary"
        @click="goToTimestamp(pullTimeInVod)"
      >
        {{ timestamp }}
      </button>
    </td>
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
    "fightStart",
    "deathData",
    "reportStart",
    "vodStartTime",
    "timeBeforePull",
    "player",
    "index",
    "reportId",
    "fightId"
  ],
  methods: {
    goToTimestamp(pullTimeInVod: Number) {
      if (typeof this.player.seek === "function") {
        this.player.pause();
        this.player.seek(pullTimeInVod);
        setTimeout(() => {
          this.player.play();
        }, 500);
      } else {
        this.player.seekTo(pullTimeInVod);
      }
    },
  },
  created() {
    this.pullTimeInVod =
      (this.reportStart -
        this.vodStartTime +
        this.deathData.timestamp -
        this.timeBeforePull) /
      1000;
    this.timestamp = new Date(this.deathData.timestamp - this.fightStart)
      .toISOString()
      .slice(14, 19);
  },
  updated() {
    this.pullTimeInVod =
      (this.reportStart -
        this.vodStartTime +
        this.deathData.timestamp -
        this.timeBeforePull) /
      1000;
    // this.timestamp = new Date(this.pullTimeInVod * 1000)
    //   .toISOString()
    //   .slice(11, 19);
  },
};
</script>
