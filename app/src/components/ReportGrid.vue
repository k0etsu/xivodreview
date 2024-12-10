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
        <div class="row g-0 phase-check">
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              id="flexCheckDefault"
              v-model="phaseMode"
            />
            <label class="form-check-label" for="flexCheckDefault">
              Separate pulls by phase
            </label>
          </div>
        </div>
        <div v-if="phaseMode" class="row g-0 justify-content-start log-pulls">
          <div
            class="row g-0 phase-row"
            v-for="phases in phaseEntries"
            :key="fightTitle + phases"
          >
            <h5 class="phase-title">{{ phaseMap[phases[0].encounterID][phases[0].lastPhaseAsAbsoluteIndex] }}</h5>
            <ReportPull
              v-for="phaseEntry in phases"
              :key="reportId + fightTitle + phaseEntry.id"
              :selectedId="selectedId"
              :fightEntry="phaseEntry"
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
        <div v-else class="row g-0 justify-content-start log-pulls">
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
  data() {
    return {
      phaseMode: false,
      phaseEntries: {},
    };
  },
  props: [
    "selectedId",
    "fightTitle",
    "fightEntries",
    "phaseMap",
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
    createPhaseData(fightEntries) {
      fightEntries.forEach((fight: Object) => {
        if ("phaseName" in fight){
          var phase = fight.lastPhaseAsAbsoluteIndex.toString();
          if (!(phase in this.phaseEntries)) {
            this.phaseEntries[phase] = [];
          }
          this.phaseEntries[phase].push(fight);
        }
      });
    },
  },
  created() {
    console.log("fight entries", this.fightEntries);
    this.createPhaseData(this.fightEntries);
    console.log("phase entries", this.phaseEntries);
    console.log("phase map", this.phaseMap)
  },
};
</script>

<style scoped>
.log-pulls {
  margin-bottom: 1.5em;
}
.phase-row {
  margin-top: 0.75em;
}
.phase-title {
  font-size: 1em;
}
</style>
