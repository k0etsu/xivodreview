<template>
  <tr>
    <th>{{ deathData.player }}</th>
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
    "deathData",
    "reportStart",
    "vodStartTime",
    "timeBeforePull",
    "player",
  ],
  methods: {
    goToTimestamp(pullTimeInVod: Number) {
      if (typeof this.player.seek === "function") {
        this.player.seek(pullTimeInVod);
      } else {
        this.player.seekTo(pullTimeInVod);
      }
    },
  },
  created() {
    this.pullTimeInVod =
      Math.floor(
        (this.reportStart - this.vodStartTime + this.deathData.timestamp)
      ) - this.timeBeforePull;
    this.timestamp = new Date(this.pullTimeInVod)
      .toISOString()
      .slice(11, 19);
  },
  updated() {
    this.pullTimeInVod =
      Math.floor(
        (this.reportStart - this.vodStartTime + this.deathData.timestamp)
      ) - this.timeBeforePull;
    this.timestamp = new Date(this.pullTimeInVod)
      .toISOString()
      .slice(11, 19);
  },
};
</script>
