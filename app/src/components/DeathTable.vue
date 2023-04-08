<script setup lang="ts">
import DeathRow from "./DeathRow.vue";
</script>

<template>
  <div class="row justify-content-end">
    <h5 class="col" style="padding-top: 0.25em">Pull Info</h5>
    <div class="col-md-auto">
      <a
        :href="
          'https://www.fflogs.com/reports/' + reportId + '/#fight=' + fightId
        "
        class="btn btn-outline-info table-buttons"
        role="button"
        target="_blank"
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          fill="currentColor"
          class="bi bi-box-arrow-up-right"
          viewBox="0 0 16 16"
          style="display: inline-block; vertical-align: -0.125em"
        >
          <path
            fill-rule="evenodd"
            d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"
          />
          <path
            fill-rule="evenodd"
            d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"
          />
        </svg>
        Report
      </a>
    </div>
  </div>
  <table class="table mb-0 table-striped table-hover">
    <thead>
      <tr>
        <th scope="col">Player</th>
        <th scope="col">Source</th>
        <th scope="col">Ability</th>
        <th scope="col">Timestamp</th>
      </tr>
    </thead>
    <tbody class="table-group-divider">
      <DeathRow
        v-for="death in deathData[fightId]"
        :key="
          reportId +
          death.player +
          death.source +
          death.ability +
          death.timestamp
        "
        :deathData="death"
        :reportStart="reportStart"
        :vodStartTime="vodStartTime"
        :timeBeforePull="timeBeforePull"
        :player="player"
      />
    </tbody>
  </table>
  <!-- <div class="row justify-content-end">
    <div class="col-md-auto" style="margin-top: 1em">
      <a
        :href="
          'https://www.fflogs.com/reports/' + reportId + '/#fight=' + fightId
        "
        class="btn btn-outline-info table-buttons"
        role="button"
        target="_blank"
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          fill="currentColor"
          class="bi bi-box-arrow-up-right"
          viewBox="0 0 16 16"
          style="display: inline-block; vertical-align: -0.125em"
        >
          <path
            fill-rule="evenodd"
            d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"
          />
          <path
            fill-rule="evenodd"
            d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"
          />
        </svg>
        Report
      </a>
    </div>
  </div> -->
</template>

<script lang="ts">
export default {
  props: [
    "fightId",
    "deathData",
    "reportId",
    "reportStart",
    "vodStartTime",
    "timeBeforePull",
    "player",
  ],
  components: {
    DeathRow,
  },
};
</script>
