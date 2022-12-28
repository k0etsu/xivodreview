import dotenv from "dotenv"
import https from "https"
import got from "got"
import express from "express"
import axios from "axios"
import cors from "cors"

import tokenCache from "./tokenCache.js"
// import { ApolloClient, gql, InMemoryCache, ApolloProvider } from '@apollo/client';

dotenv.config()

const FFLOGS_CLIENT_ID = process.env.FFLOGS_CLIENT_ID;
const FFLOGS_CLIENT_SECRET = process.env.FFLOGS_CLIENT_SECRET;
const FFLOGS_AUTH = "https://www.fflogs.com/oauth/token";
const FFLOGS_API = "https://www.fflogs.com/api/v2/client";
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const TWITCH_AUTH = "https://id.twitch.tv/oauth2/token";
const TWITCH_API = "https://api.twitch.tv/helix/videos";

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

const hostname = '127.0.0.1';
const port = 3000;

const server = https.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('I did it!');
});

var fflogsToken = new tokenCache('fflogs', FFLOGS_AUTH, FFLOGS_OPTS);
var twitchToken = new tokenCache('twitch', TWITCH_AUTH, TWITCH_OPTS);

var app = express();

app.use(cors())

// basic get route off fflogs with reportId as query url parameter
app.get("/fflogs", (req, res, next) => {
  console.log("fflogs")
  console.log(req.query) // TODO: remove this eventually
  // TODO: promise chaining cause can't figure out async/await
  fflogsToken.getToken().then(token => {
    // current initial query to fflogs to get report summary information, mainly fights, timestamps and players
    var deathQuery = '';
    if (req.query.startTime != undefined && req.query.endTime != undefined) {
      deathQuery = `
      events(
        dataType: Deaths
        startTime: ${req.query.startTime}
        endTime: ${req.query.endTime}
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
      fights {
        id
        startTime
        endTime
        encounterID
        name
        fightPercentage
        bossPercentage
        kill
        friendlyPlayers
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
      ${deathQuery}
    }
  }
}`;
    // setup options to pass to got()
    const options = {
      method: "GET",
      searchParams: {query: query},
      headers: {
        "Authorization": `Bearer ${token}`
      }
    };
    return got(FFLOGS_API, options)
  // TODO: promise chaining cause can't figure out async/await
  }).then(data => {
    res.json(JSON.parse(data["body"]))
  }).catch(err => {
    console.log(err)
    res.send(err)
  });
});

app.get("/twitch", (req, res, next) => {
  console.log("twitch")
  console.log(req.query) // TODO: remove this eventually
  // TODO: promise chaining cause can't figure out async/await
  twitchToken.getToken().then(token => {
    // setup options to pass to got()
    const options = {
      method: "GET",
      searchParams: {id: req.query.videoId},
      headers: {
        "Authorization": `Bearer ${token}`,
        "Client-Id": TWITCH_CLIENT_ID
      }
    };
    return got(TWITCH_API, options)
  // TODO: promise chaining cause can't figure out async/await
  }).then(data => {
    var timeArr = []
    for (const resData of JSON.parse(data["body"])["data"]) {
      timeArr.push({
        videoId: resData.id,
        startTime: new Date(resData["created_at"]).getTime()
      });
    };
    console.log(timeArr)
    res.json({
      res: JSON.parse(data["body"]),
      timeArr: timeArr
    });
  }).catch(err => {
    var videoId = req.query.videoId
    console.log(err)
    res.json({
      error: "Not Found",
      status: 404,
      message: `vods [${videoId}] not found`
    });
  });
});

app.listen(3001, () => {
  console.log("server running on port 3001");
});
