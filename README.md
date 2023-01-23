# xivodreview
![release status](https://img.shields.io/github/v/release/k0etsu/xivodreview)
![commits](https://img.shields.io/github/commits-since/k0etsu/xivodreview/latest/master)
![license](https://img.shields.io/github/license/k0etsu/xivodreview)
[![ko-fi](https://img.shields.io/static/v1?label=donate&message=ko-fi&color=ff69b4)](https://ko-fi.com/k0etsu)

Raiding (or not, up to you) tool to help with VOD review utilizing FFLogs report data and Twitch (YouTube too eventually) VODs.
<br><br>
## Overall process flow
1. Enter links to FFLogs report and Twitch VOD
2. Validate that report and VOD exist
3. Populate view for VOD and report summary panel with individual fights
4. Selecting a fight from report summary view jumps VOD to timestamp associated with fight
<br><br>
## TODO
- ~~explore fflogs api~~
- ~~explore twitch api~~ (maybe youtube as well)
- ~~specify backend framework (most likely node.js)~~
  - ~~nail down venv requirements~~
- ~~draw hello world with vue.js or react?~~
- authenticate with fflogs api for private reports (ON HOLD FOR NOW)
  - create new window for user auth?
- ~~query data from fflogs api~~
  - figure out what data is needed to recreate report view in side bar
    - https://www.fflogs.com/reports/vt1ZRXNBMbk6nKhy
- ~~create barebones route to serve fflogs data to client~~
- authenticate with twitch api (probably don't need this)
- ~~query data from twitch api~~
- ~~create barebones route to serve twitch data to client~~
- ~~accept fflogs url and parse~~
- ~~accept twitch url and parse~~
<br><br>
## Wishlist
- multiple povs per report (aka per player)
- more data from logs and interactions as well
- cache video and report so I don't get rate-limited
