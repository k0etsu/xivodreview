# xivodreview
tool to tie fflogs reports to a vod (inspiration from nnoggie)
<br><br>
## Overall process flow
1. Enter links to fflogs report and online vod
2. Validate that report and vod exist
3. Populate view for vod and report summary panel with individual fights
4. Selecting a fight from report summary view jumps vod to timestamp associated with fight
<br><br>
## TODO
- ~~explore fflogs api~~
- ~~explore twitch api~~ (maybe youtube as well)
- ~~specify backend framework (most likely node.js)~~
  - ~~nail down venv requirements~~
- ~~draw hello world with vue.js or react?~~
- authenticate with fflogs api
  - create new window for user auth?
  - ON HOLD FOR NOW
- query data from fflogs api
  - figure out what data is needed to recreate report view in side bar
    - https://www.fflogs.com/reports/vt1ZRXNBMbk6nKhy
- create barebones route to serve fflogs data to client
- authenticate with twitch api
- query data from twitch api
- create barebones route to serve twitch data to client
- accept fflogs url and parse
- accept twitch url and parse
<br><br>
## Wishlist
- multiple povs per report (aka per player)
- more data from logs and interactions as well
- cache video and report
