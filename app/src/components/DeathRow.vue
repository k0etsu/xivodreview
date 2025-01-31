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
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-person-slash" viewBox="0 0 16 16" style="display: inline-block; vertical-align: -0.125em">
          <path fill-rule="evenodd" d="M13.879 10.414a2.501 2.501 0 0 0-3.465 3.465zm.707.707-3.465 3.465a2.501 2.501 0 0 0 3.465-3.465m-4.56-1.096a3.5 3.5 0 1 1 4.949 4.95 3.5 3.5 0 0 1-4.95-4.95ZM11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m.256 7a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10q.39 0 .74.025c.226-.341.496-.65.804-.918Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1z"/>
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
