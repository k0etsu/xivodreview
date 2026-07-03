import dotenv from "dotenv"
import got from "got"
import express from "express"
import cors from "cors"

import tokenCache from "./tokenCache.js"

dotenv.config()

const FFLOGS_CLIENT_ID = process.env.FFLOGS_CLIENT_ID;
const FFLOGS_CLIENT_SECRET = process.env.FFLOGS_CLIENT_SECRET;
const FFLOGS_AUTH = "https://www.fflogs.com/oauth/token";
const FFLOGS_CLIENT_API = "https://www.fflogs.com/api/v2/client";
const FFLOGS_USER_API = "https://www.fflogs.com/api/v2/user";
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const TWITCH_AUTH = "https://id.twitch.tv/oauth2/token";
const TWITCH_API = "https://api.twitch.tv/helix/videos";
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API = "https://youtube.googleapis.com/youtube/v3/videos";
const YOUTUBE_LIVESTREAM_API = "https://youtube.googleapis.com/youtube/v3/liveBroadcasts";

const FFLOGS_OPTS = {
  method: "POST",
  username: FFLOGS_CLIENT_ID,
  password: FFLOGS_CLIENT_SECRET,
  form: {
    grant_type: "client_credentials"
  },
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  }
}

const TWITCH_OPTS = {
  method: "POST",
  form: {
    "client_id": TWITCH_CLIENT_ID,
    "client_secret": TWITCH_CLIENT_SECRET,
    "grant_type": "client_credentials"
  },
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  }
}

console.log(FFLOGS_CLIENT_ID + ":" + FFLOGS_CLIENT_SECRET);
console.log(TWITCH_CLIENT_ID + ":" + TWITCH_CLIENT_SECRET);

const port = 3001;

function getYoutubeDuration(duration) {
  let totalSeconds = 0;
  let hours, minutes;
  duration = duration.replace("PT", "");
  console.log(duration);
  if (duration.includes('H')) {
    hours = duration.split('H')[0];
    duration = duration.split('H')[1];
    totalSeconds += parseInt(hours) * 3600;
  }
  if (duration.includes('M')) {
    minutes = duration.split('M')[0];
    duration = duration.split('M')[1];
    totalSeconds += parseInt(minutes) * 60;
  }
  const seconds = duration.split('S')[0];
  totalSeconds += parseInt(seconds);
  console.log(hours, minutes, seconds);
  return totalSeconds * 1000;
}

const fflogsToken = new tokenCache('fflogs', FFLOGS_AUTH, FFLOGS_OPTS);
const twitchToken = new tokenCache('twitch', TWITCH_AUTH, TWITCH_OPTS);

const app = express();

app.use(cors());

app.get("/fflogs", async (req, res) => {
  console.log("fflogs");
  console.log(req.query);

  if (req.query.startTime !== undefined) {
    const start = parseInt(req.query.startTime, 10);
    const end = parseInt(req.query.endTime, 10);
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: 'startTime and endTime must be integers' });
    }
  }

  try {
    let token = await fflogsToken.getToken();
    let deathQuery = '';
    if (req.query.startTime !== undefined && req.query.endTime !== undefined) {
      deathQuery = `
      events(
        dataType: Deaths
        startTime: ${parseInt(req.query.startTime, 10)}
        endTime: ${parseInt(req.query.endTime, 10)}
        limit: 10000
      ) {
        data
        nextPageTimestamp
      }
`;
    }
    const query = `{
  rateLimitData {
    limitPerHour
    pointsSpentThisHour
    pointsResetIn
  }
  reportData {
    report(code: "${req.query.reportId}") {
      startTime
      endTime
      segments
      fights(
        killType: Encounters
      ) {
        id
        startTime
        endTime
        encounterID
        difficulty
        name
        fightPercentage
        bossPercentage
        kill
        friendlyPlayers
        lastPhase
        lastPhaseAsAbsoluteIndex
        lastPhaseIsIntermission
      }
      masterData {
        logVersion
        gameVersion
        lang
        abilities {
          gameID
          name
          type
        }
        players: actors(type: "Player") {
          gameID
          icon
          id
          name
          server
          subType
        }
        npcs: actors(type: "NPC") {
          gameID
          id
          name
          subType
        }
      }
      phases {
        encounterID
        separatesWipes
        phases {
          id
          name
          isIntermission
        }
      }
      ${deathQuery}
    }
  }
}`;
    let url;
    if (req.query.authToken !== undefined) {
      token = req.query.authToken;
      url = FFLOGS_USER_API;
    } else {
      url = FFLOGS_CLIENT_API;
    }
    const options = {
      method: "GET",
      searchParams: { query },
      headers: {
        "Authorization": `Bearer ${token}`
      }
    };
    const data = await got(url, options);
    res.json(JSON.parse(data.body));
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/encounters", async (req, res) => {
  let encounters = "";
  if (Array.isArray(req.query.id)) {
    req.query.id.forEach((id) => {
      encounters += `
    id${id}: encounter(id: ${id}) {
      id
      name
      zone {
        id
        name
        difficulties {
          id
          name
          sizes
        }
      }
    }`;
    });
  } else {
    encounters = `
    encounter(id: ${req.query.id}) {
      id
      name
      zone {
        id
        name
        difficulties {
          id
          name
          sizes
        }
      }
    }`;
  }
  try {
    const token = await fflogsToken.getToken();
    const query = `{
  worldData {${encounters}
  }
}`;
    const options = {
      method: "GET",
      searchParams: { query },
      headers: {
        "Authorization": `Bearer ${token}`
      }
    };
    const data = await got(FFLOGS_CLIENT_API, options);
    res.json(JSON.parse(data.body));
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/twitch", async (req, res) => {
  console.log("twitch");
  console.log(req.query);
  try {
    const token = await twitchToken.getToken();
    const options = {
      method: "GET",
      searchParams: { id: req.query.videoId },
      headers: {
        "Authorization": `Bearer ${token}`,
        "Client-Id": TWITCH_CLIENT_ID
      }
    };
    const data = await got(TWITCH_API, options);
    const timeArr = [];
    for (const resData of JSON.parse(data.body).data) {
      console.log(resData);
      timeArr.push({
        videoId: resData.id,
        startTime: new Date(resData.created_at).getTime()
      });
    }
    console.log(timeArr);
    res.json({
      res: JSON.parse(data.body),
      timeArr
    });
  } catch (err) {
    const videoId = req.query.videoId;
    console.log(err);
    res.status(404).json({
      error: "Not Found",
      status: 404,
      message: `vods [${videoId}] not found`
    });
  }
});

app.get("/youtube", async (req, res) => {
  console.log("youtube");
  console.log(req.query);
  const options = {
    method: "GET",
    searchParams: {
      part: "snippet,contentDetails,liveStreamingDetails,status",
      id: req.query.videoId,
      key: YOUTUBE_API_KEY
    },
    headers: {
      "Accept": "application/json"
    }
  };
  if (req.query.authToken) {
    options.headers.Authorization = `Bearer ${req.query.authToken}`;
  }
  try {
    const data = await got(YOUTUBE_API, options);
    const timeArr = [];
    for (const resData of JSON.parse(data.body).items) {
      console.log(resData);
      timeArr.push({
        videoId: resData.id,
        startTime: new Date(resData.liveStreamingDetails.actualStartTime).getTime(),
      });
    }
    res.json({
      res: JSON.parse(data.body),
      timeArr,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log("server running on port 3001");
});
