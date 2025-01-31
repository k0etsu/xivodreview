<template>
  <tr>
    <th>
      {{ deathData.player }}
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
    <td>
      <a
        :href="
          'https://www.fflogs.com/reports/' + reportId + '/#fight=' + fightId + '&type=deaths&death=' + (index+1)
        "
        class="btn btn-outline-danger table-buttons"
        role="button"
        target="_blank"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-backspace-reverse" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M9.854 5.146a.5.5 0 0 1 0 .708L7.707 8l2.147 2.146a.5.5 0 0 1-.708.708L7 8.707l-2.146 2.147a.5.5 0 0 1-.708-.708L6.293 8 4.146 5.854a.5.5 0 1 1 .708-.708L7 7.293l2.146-2.147a.5.5 0 0 1 .708 0"/>
          <path fill-rule="evenodd" d="M2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7.08a2 2 0 0 0 1.519-.698l4.843-5.651a1 1 0 0 0 0-1.302L10.6 1.7A2 2 0 0 0 9.08 1zm7.08 1a1 1 0 0 1 .76.35L14.682 8l-4.844 5.65a1 1 0 0 1-.759.35H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/>
        </svg>
      </a>
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
