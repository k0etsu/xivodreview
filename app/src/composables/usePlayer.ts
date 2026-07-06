import { ref, nextTick, onMounted, onBeforeUnmount, type Ref } from "vue";

const API_URL = import.meta.env.VITE_API_URL ?? "https://api.yamanote.co";

export function usePlayer(googleAuthToken: Ref<Record<string, any>>) {
  const player = ref<any>(null);
  const playerType = ref("");
  const isPlaying = ref(false);
  const vodStartTime = ref(0);
  const showWelcome = ref(true);
  const twitchId = ref("");
  const twitchData = ref<any>(null);
  const youtubeId = ref("");
  const youtubeData = ref<any>(null);

  const seekTime = ref(0);

  const focusPlay = ref<HTMLElement | null>(null);
  const focusPause = ref<HTMLElement | null>(null);

  function focusPlayButton() {
    nextTick(() => focusPlay.value?.focus());
  }

  function focusPauseButton() {
    nextTick(() => focusPause.value?.focus());
  }

  function hideGoogleWarning() {
    showWelcome.value = false;
  }

  function showGoogleWarning() {
    showWelcome.value = true;
  }

  function playVod() {
    if (playerType.value == "twitch") {
      player.value.play();
    } else if (playerType.value == "yubtub") {
      player.value.playVideo();
    }
    isPlaying.value = true;
    focusPauseButton();
  }

  function pauseVod() {
    if (playerType.value == "twitch") player.value.pause();
    else if (playerType.value == "yubtub") player.value.pauseVideo();
    isPlaying.value = false;
    focusPlayButton();
  }

  function playPause() {
    if (isPlaying.value) {
      pauseVod();
    } else {
      playVod();
    }
  }

  function jumpForward() {
    const currTime = player.value.getCurrentTime();
    if (playerType.value == "twitch") {
      player.value.seek(currTime + 5);
    } else if (playerType.value == "yubtub") {
      player.value.seekTo(currTime + 5);
    }
  }

  function jumpBackward() {
    const currTime = player.value.getCurrentTime();
    if (playerType.value == "twitch") {
      player.value.seek(currTime - 5);
    } else if (playerType.value == "yubtub") {
      player.value.seekTo(currTime - 5);
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.target as HTMLElement | null)?.tagName.toLowerCase() === "input") {
      return;
    }
    switch (e.key) {
      case " ":
        playPause();
        break;
      case "ArrowLeft":
        jumpBackward();
        break;
      case "ArrowRight":
        jumpForward();
        break;
    }
  }

  async function getTwitchId(twitchUrl: string) {
    try {
      const url = new URL(twitchUrl);
      const video = url.pathname.split("/");
      let videoIndex = video.indexOf("videos");
      if (videoIndex == -1) {
        videoIndex = video.indexOf("video");
      }
      twitchId.value = video[videoIndex + 1];
    } catch (error) {
      console.error(error);
      twitchId.value = "Please enter a valid Twitch VOD URL";
    } finally {
      getTwitchData(twitchId.value);
    }
  }

  async function getTwitchData(videoId: string) {
    try {
      const response = await fetch(`${API_URL}/twitch?videoId=${videoId}`);
      twitchData.value = await response.json();
      vodStartTime.value = parseInt(twitchData.value.timeArr[0].startTime);
      getTwitchPlayer(twitchId.value);
    } catch (error) {
      console.error("there was an error fetching twitch data: ", error);
    }
  }

  async function getTwitchPlayer(videoId: string) {
    const Twitch = window.Twitch;
    const options = {
      width: "100%",
      height: "100%",
      video: videoId,
      autoplay: false,
      parent: [window.location.hostname],
    };
    if (player.value) {
      removePlayer();
    }
    player.value = new Twitch.Player("twitch-player", options);
    const element = document.getElementById("twitch-player")!;
    element.style.position = "absolute";
    element.style.width = "100%";
    element.style.height = "100%";
    element.style.top = "0";

    const onPlay = () => {
      isPlaying.value = true;
      focusPauseButton();
    };

    player.value.addEventListener(Twitch.Player.READY, () => {
      player.value.setQuality("chunked");
      playerType.value = "twitch";
    });
    player.value.addEventListener(Twitch.Player.PLAY, onPlay);
    player.value.addEventListener(Twitch.Player.PLAYING, onPlay);
    player.value.addEventListener(Twitch.Player.SEEK, () => {
      setTimeout(() => {
        seekTime.value = player.value.getCurrentTime();
      }, 200);
    });
    player.value.addEventListener(Twitch.Player.PAUSE, () => {
      isPlaying.value = false;
      focusPlayButton();
    });
  }

  async function getYoutubeId(youtubeUrl: string) {
    try {
      const url = new URL(youtubeUrl);
      if (youtubeUrl.includes("youtube.com")) {
        if (youtubeUrl.includes("watch?")) {
          const video = url.href.split("watch?")[1];
          const queries = video.split("&");
          for (const query of queries) {
            if (query.includes("v=")) {
              youtubeId.value = query.replace("v=", "");
            }
          }
        } else if (youtubeUrl.includes("/live/")) {
          youtubeId.value = url.href.split("/live/")[1].split("?")[0];
        }
      } else if (youtubeUrl.includes("youtu.be")) {
        youtubeId.value = url.pathname.split("/")[1];
      }
    } catch (error) {
      console.error(error);
      youtubeId.value = "Please enter a valid YouTube VOD URL";
    } finally {
      getYoutubeData(youtubeId.value);
    }
  }

  function getYoutubeData(videoId: string) {
    let authToken = "";
    let getUrl = "";
    if (Object.keys(googleAuthToken.value).length != 0) {
      authToken = googleAuthToken.value.access_token;
      getUrl = `${API_URL}/youtube?videoId=${videoId}&authToken=${authToken}`;
    } else {
      getUrl = `${API_URL}/youtube?videoId=${videoId}`;
    }
    fetch(getUrl)
      .then(async (response) => {
        youtubeData.value = await response.json();
      })
      .catch((error) => {
        console.error("there was an error fetching youtube data: ", error);
      })
      .finally(() => {
        if (youtubeData.value.res.pageInfo.totalResults > 0) {
          vodStartTime.value = parseInt(youtubeData.value.timeArr[0].startTime);
          getYoutubePlayer(youtubeId.value);
        } else {
          alert(
            "You might be trying to use a private YoutTube VOD or URL is incorrect. Please double check YouTube URL or authenticate with the correct account."
          );
          showGoogleWarning();
        }
      });
  }

  function getYoutubePlayer(videoId: string) {
    const YT = window.YT;
    const options = {
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
    };
    player.value = new YT.Player("youtube-player", {
      height: "390",
      width: "640",
      videoId: videoId,
      playerVars: options,
    });
    const element = document.getElementById("youtube-player")!;
    element.style.position = "absolute";
    element.style.width = "100%";
    element.style.height = "100%";
    element.style.top = "0";
    player.value.addEventListener("onReady", () => {
      player.value.setPlaybackQuality("highres");
      playerType.value = "yubtub";
    });
    player.value.addEventListener("onStateChange", (value: any) => {
      if (value.data == YT.PlayerState.PLAYING) {
        playVod();
      } else if (value.data == YT.PlayerState.PAUSED) {
        pauseVod();
      }
    });
  }

  function removePlayer() {
    const twitchPlayer = document.getElementById("twitch-player")!;
    twitchPlayer.innerHTML = "";
    const youtubePlayer = document.getElementById("youtube-player-wrapper")!;
    youtubePlayer.innerHTML = "";
    const div = document.createElement("div");
    div.id = "youtube-player";
    youtubePlayer.append(div);
    player.value = null;
    playerType.value = "";
  }

  function goToTimestamp(timestamp: string) {
    const vodTime = parseInt(timestamp);
    player.value.seek(vodTime);
  }

  onMounted(() => {
    window.addEventListener("keydown", handleKeydown);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKeydown);
  });

  return {
    player,
    playerType,
    isPlaying,
    vodStartTime,
    showWelcome,
    twitchId,
    twitchData,
    youtubeId,
    youtubeData,
    seekTime,
    focusPlay,
    focusPause,
    getTwitchId,
    getTwitchData,
    getTwitchPlayer,
    getYoutubeId,
    getYoutubeData,
    getYoutubePlayer,
    playVod,
    pauseVod,
    playPause,
    jumpForward,
    jumpBackward,
    removePlayer,
    goToTimestamp,
    handleKeydown,
    hideGoogleWarning,
    showGoogleWarning,
  };
}
