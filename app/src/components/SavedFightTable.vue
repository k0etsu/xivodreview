<script setup lang="ts">
import SavedFightRow from "./SavedFightRow.vue";
</script>

<template>
  <table class="table mb-0 table-striped table-hover">
    <thead>
      <tr>
        <th scope="col">Saved Name</th>
        <th scope="col">Select</th>
        <th scope="col">Edit</th>
        <th scope="col">Delete</th>
      </tr>
    </thead>
    <tbody class="table-group-divider">
      <SavedFightRow
        v-for="fight in cachedFights"
        :fightName="fight.fightName"
        @selected-fight="selectedFight"
        @edit-fight="editFight"
        @delete-fight="deleteFight"
      />
    </tbody>
  </table>
</template>

<script lang="ts">
export default {
  data() {
    return {
    };
  },
  props: [
    "cachedFights",
    "vodLink",
    "fflogsLink",
    "offset",
  ],
  emits: [
    "selectedFight",
    "updateCachedFights",
  ],
  methods: {
    selectedFight(fightName) {
      this.$emit("selectedFight", fightName)
    },
    editFight(fightName, newFightName) {
      console.log("editFight", fightName, newFightName);
    },
    deleteFight(fightName) {
      console.log("deleteFight", fightName);
      delete this.cachedFights[fightName];
      this.updateFights(this.cachedFights);
    },
    updateFights(updatedFights) {
      this.$emit("updateCachedFights", updatedFights);
    }
  },
  components: {
    SavedFightRow
  },
  created() {
    for (const fight in this.cachedFights) {
      this.cachedFights[fight].fightName = fight;
    }
  },
  updated() {
  },
};
</script>
