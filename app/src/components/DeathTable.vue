<script setup lang="ts">
import DeathRow from "./DeathRow.vue";
</script>

<template>
  <td colspan="5">
    <table class="table mb-0 table-striped table-hover">
      <thead>
        <tr>
          <th scope="col">Player</th>
          <th scope="col">Source</th>
          <th scope="col">Ability</th>
          <th scope="col">Goto Death</th>
        </tr>
      </thead>
      <tbody class="table-group-divider">
        <DeathRow
          v-for="death in deathData[fightId]"
          :key="death.timestamp"
          :deathData="death"
          :reportStart="reportStart"
          :vodStartTime="vodStartTime"
          :timeBeforePull="timeBeforePull"
          :player="player"
        />
      </tbody>
    </table>
  </td>
</template>

<script lang="ts">
export default {
  props: [
    "fightId",
    "deathData",
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
