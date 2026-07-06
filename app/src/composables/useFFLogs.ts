import { ref, watch, type Ref } from "vue";

const API_URL = import.meta.env.VITE_API_URL ?? "https://api.yamanote.co";

export function useFFLogs(
  fflogsAuthToken: Ref<Record<string, any>>,
  vodStartTime: Ref<number>
) {
  const fflogs_url = ref("");
  const reportId = ref("");
  const reportData = ref<any>(null);
  const reportStart = ref(0);
  const reportEnd = ref(0);
  const fightData = ref<Record<string, any>>({});
  const playerData = ref<any[]>([]);
  const abilityData = ref<any[]>([]);
  const npcData = ref<any[]>([]);
  const encounterData = ref<Record<string, any>>({});
  const encounterMap = ref<Record<string, any>>({});
  const phaseMap = ref<Record<string, any>>({});
  const deathData = ref<Record<string, any>>({});
  const currentPull = ref<Record<string, any>>({});
  const timeBeforePull = ref(0);

  function getReportId(fflogsUrl: string) {
    try {
      const url = new URL(fflogsUrl);
      const report = url.pathname.split("/");
      const reportIndex = report.indexOf("reports");
      reportId.value = report[reportIndex + 1];
    } catch (error) {
      reportId.value = "Please enter a valid FFLogs report URL";
    } finally {
      getReportData(reportId.value);
    }
  }

  function getReportData(id: string) {
    let getUrl = "";
    if (Object.keys(fflogsAuthToken.value).length != 0) {
      getUrl = `${API_URL}/fflogs?reportId=${id}&authToken=${fflogsAuthToken.value.access_token}`;
    } else {
      getUrl = `${API_URL}/fflogs?reportId=${id}`;
    }
    fetch(getUrl)
      .then(async (response) => {
        reportData.value = await response.json();
        await getEncounterData();
      })
      .catch((error) => {
        console.error("there was an error fetching fflogs data: ", error);
      })
      .finally(() => {
        if (reportData.value.errors) {
          alert(
            reportData.value.errors[0].message +
              "\n\nTry authenticating with FF Logs if this report is private."
          );
        } else {
          reportStart.value = parseInt(
            reportData.value.data.reportData.report.startTime
          );
          reportEnd.value = parseInt(
            reportData.value.data.reportData.report.endTime
          );
          if (fflogsAuthToken.value) {
            getReportDeathData(
              reportId.value,
              0,
              reportEnd.value - reportStart.value,
              fflogsAuthToken.value.access_token
            );
          } else {
            getReportDeathData(
              reportId.value,
              0,
              reportEnd.value - reportStart.value,
              {}
            );
          }
        }
      });
  }

  function getReportDeathData(
    id: string,
    startTime: number,
    endTime: number,
    authToken: string | Record<string, never>
  ) {
    let getUrl = "";
    if (authToken) {
      getUrl = `${API_URL}/fflogs?reportId=${id}&startTime=${startTime}&endTime=${endTime}&authToken=${authToken}`;
    } else {
      getUrl = `${API_URL}/fflogs?reportId=${id}&startTime=${startTime}&endTime=${endTime}`;
    }
    fetch(getUrl)
      .then(async (response) => {
        reportData.value = await response.json();
        getExtraReportData();
      })
      .catch((error) => {
        console.error(
          "there was an error fetching fflogs data w/ deaths: ",
          error
        );
      });
  }

  function getEncounterData() {
    let getUrl = `${API_URL}/encounters?`;
    const encounterIds = new Set<number>();
    reportData.value.data.reportData.report.fights.forEach((fight: any) => {
      if (!encounterIds.has(fight.encounterID)) {
        encounterIds.add(fight.encounterID);
        getUrl = getUrl + `id=${fight.encounterID}&`;
      }
    });
    return fetch(getUrl)
      .then(async (response) => {
        encounterData.value = await response.json();
      })
      .catch((error) => {
        console.error(
          "there was an error fetching fflogs encounter data: ",
          error
        );
      });
  }

  function getExtraReportData() {
    playerData.value = reportData.value.data.reportData.report.masterData.players;
    abilityData.value =
      reportData.value.data.reportData.report.masterData.abilities;
    npcData.value = reportData.value.data.reportData.report.masterData.npcs;
    deathData.value = reportData.value.data.reportData.report.events.data;
    const playerMap = new Map();
    const abilityMap = new Map();
    const npcMap = new Map();
    for (const player of playerData.value) {
      playerMap.set(player.id, player.name);
    }
    for (const ability of abilityData.value) {
      abilityMap.set(ability.gameID, ability.name);
    }
    for (const npc of npcData.value) {
      npcMap.set(npc.id, npc.name);
    }
    for (const death in deathData.value) {
      deathData.value[death]["player"] = playerMap.get(
        deathData.value[death].targetID
      );
      deathData.value[death]["ability"] = abilityMap.get(
        deathData.value[death].killingAbilityGameID
      );
      deathData.value[death]["source"] = npcMap.get(
        deathData.value[death].sourceID
      );
      deathData.value[death]["killer"] = npcMap.get(
        deathData.value[death].killerID
      );
    }
    const finalDeathData: Record<string, any> = {};
    for (const death in deathData.value) {
      finalDeathData[deathData.value[death].fight] =
        finalDeathData[deathData.value[death].fight] || [];
      finalDeathData[deathData.value[death].fight].push(deathData.value[death]);
    }
    deathData.value = finalDeathData;
  }

  function getFightData() {
    const fightsPerInstance: Record<string, any> = {};
    let pullNum = 1;
    if ("phases" in reportData.value.data.reportData.report) {
      const phases = reportData.value.data.reportData.report.phases;
      phases.forEach((encounter: any) => {
        const encounterID = encounter.encounterID.toString();
        if (!(encounterID in phaseMap.value)) {
          phaseMap.value[encounterID] = [];
        }
        encounter.phases.forEach((phase: any) => {
          phaseMap.value[encounterID].push(phase.name);
        });
      });
    }
    if (reportData.value) {
      reportData.value.data.reportData.report.fights.forEach((fight: any) => {
        let encounterName = "";
        fight["pullNum"] = pullNum++;
        if (encounterMap.value[fight.encounterID]) {
          const encounter = encounterMap.value[fight.encounterID];
          if (Object.keys(encounter.difficulties).length > 1) {
            const difficulty = " - " + encounter.difficulties[fight.difficulty];
            encounterName = encounterMap.value[fight.encounterID].name + difficulty;
          } else {
            encounterName = encounterMap.value[fight.encounterID].name;
          }
        } else {
          encounterName = fight.name;
        }
        fightsPerInstance[encounterName] = fightsPerInstance[encounterName] || [];
        const fightPercentage = 100 - fight.fightPercentage;
        let fightClass = "";
        if (fightPercentage < 25) {
          fightClass = "common";
        } else if (fightPercentage < 50) {
          fightClass = "uncommon";
        } else if (fightPercentage < 75) {
          fightClass = "rare";
        } else if (fightPercentage < 90) {
          fightClass = "epic";
        } else if (fightPercentage < 99) {
          fightClass = "legendary";
        } else if (fightPercentage < 100) {
          fightClass = "astounding";
        }
        fight["class"] = fightClass;
        if (fight.encounterID in phaseMap.value) {
          fight["phaseName"] =
            phaseMap.value[fight.encounterID][fight.lastPhaseAsAbsoluteIndex];
        }
        fightsPerInstance[encounterName].push(fight);
      });
      fightData.value = fightsPerInstance;
    }
  }

  function getPullNum(pullId: number) {
    currentPull.value = reportData.value.data.reportData.report.fights[pullId - 1];
  }

  function getPullNumber(timestamp: number) {
    reportData.value.data.reportData.report.fights.every((fight: any) => {
      if (
        vodStartTime.value + timestamp * 1000 <=
        reportStart.value + fight.endTime
      ) {
        currentPull.value = fight;
        return false;
      }
      return true;
    });
  }

  watch(encounterData, (newValue: any) => {
    const worldData = newValue.data.worldData;
    encounterMap.value = {};
    for (const encounter in worldData) {
      if (worldData[encounter] !== null) {
        const difficulties: Record<number, string> = {};
        for (const difficulty of worldData[encounter]["zone"]["difficulties"]) {
          difficulties[difficulty.id] = difficulty.name;
        }
        const encounterInfo = {
          name: worldData[encounter]["name"],
          difficulties: difficulties,
        };
        encounterMap.value[worldData[encounter]["id"]] = encounterInfo;
      }
    }
    getFightData();
  });

  return {
    fflogs_url,
    reportId,
    reportData,
    reportStart,
    reportEnd,
    fightData,
    playerData,
    abilityData,
    npcData,
    encounterData,
    encounterMap,
    phaseMap,
    deathData,
    currentPull,
    timeBeforePull,
    getReportId,
    getReportData,
    getReportDeathData,
    getEncounterData,
    getExtraReportData,
    getFightData,
    getPullNum,
    getPullNumber,
  };
}
