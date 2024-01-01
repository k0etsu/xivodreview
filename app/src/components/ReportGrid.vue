<script setup lang="ts">
import ReportPull from "./ReportPull.vue";
</script>

<template>
  <div class="accordion-item">
    <h2 class="accordion-header" :id="fightTitle.replace(/[^a-zA-Z0-9]/g, '')">
      <button
        class="accordion-button collapsed"
        type="button"
        data-bs-toggle="collapse"
        :data-bs-target="`#collapse-${fightTitle.replace(/[^a-zA-Z0-9]/g, '')}`"
        aria-expanded="false"
        :aria-controls="`collapse-${fightTitle.replace(/[^a-zA-Z0-9]/g, '')}`"
      >
        {{ fightTitle }}
      </button>
    </h2>
    <div
      :id="`collapse-${fightTitle.replace(/[^a-zA-Z0-9]/g, '')}`"
      class="accordion-collapse collapse"
      :aria-labelledby="fightTitle.replace(/[^a-zA-Z0-9]/g, '')"
    >
      <div class="accordion-body px-0">
        <div class="row g-0 justify-content-start log-pulls">
          <ReportPull
            v-for="fightEntry in fightEntries"
            :key="reportId + fightTitle + fightEntry.id"
            :selectedId="selectedId"
            :fightEntry="fightEntry"
            :deathData="deathData"
            :reportId="reportId"
            :reportStart="reportStart"
            :vodStartTime="vodStartTime"
            :timeBeforePull="timeBeforePull"
            :player="player"
            @get-pull-deaths="getPullDeaths"
          />
        </div>
      </div>
    </div>
  </div>
  <!-- <h4>{{ fightTitle }}</h4>
  <div class="row g-0 justify-content-start log-pulls">
    <ReportPull
      v-for="fightEntry in fightEntries"
      :key="reportId + fightTitle + fightEntry.id"
      :fightEntry="fightEntry"
      :deathData="deathData"
      :reportId="reportId"
      :reportStart="reportStart"
      :vodStartTime="vodStartTime"
      :timeBeforePull="timeBeforePull"
      :player="player"
      @get-pull-deaths="getPullDeaths"
    />
  </div> -->
</template>

<script lang="ts">
export default {
  props: [
    "selectedId",
    "fightTitle",
    "fightEntries",
    "deathData",
    "reportId",
    "reportStart",
    "vodStartTime",
    "timeBeforePull",
    "player",
  ],
  emits: ["getPullDeaths"],
  components: {
    ReportPull,
  },
  methods: {
    getPullDeaths(pullId, pullNum) {
      this.$emit("getPullDeaths", pullId, pullNum);
    },
  },
  created() {
    console.log(this.fightEntries);
  },
};
</script>

<style scoped>
.log-pulls {
  margin-bottom: 1.5em;
}
</style>
