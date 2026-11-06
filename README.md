# Kabaddi Tournament App (MERN)

Village kabaddi tournament: knockout bracket, live score with animations, team photos, players and captain.
No login. Everyone opens the site directly. The person who scores uses one secret link.

## Folders (frontend and backend are separate)

```
kabaddi-app/
  server/                    Node + Express + MongoDB + Socket.io
    config/                  db, cloudinary, rules.js (kabaddi rule numbers)
    models/                  Team, Player, Tournament, Match
    controllers/             team, player, tournament, match, upload
    routes/index.js          all API routes
    middleware/              scorerKey (secret link), upload, errors
    services/                matchService (advance winner), realtime (socket emits)
    sockets/io.js            Socket.io setup
    utils/
      kabaddiEngine.js       scoring rules (pure, tested)
      bracket.js             knockout bracket + byes (pure, tested)
    tests/                   npm test
    server.js
  client/                    React + Vite + Tailwind
    src/
      api/                   fetch wrapper, socket
      hooks/                 useLiveMatch, useTournament
      utils/                 rounds, effects (animation messages)
      context/               ScorerKeyContext
      components/            Scoreboard, PlayerDots, EventBanner, Bracket, MatchCard, ...
      pages/                 Home, BracketPage, TeamsPage, TeamDetail, MatchPage
      pages/manage/          ManageShell, ManageTeams, ManageTeamEdit,
                             ManageTournament, ManageMatches, ScorerPanel
```

## Run it on your computer

1. MongoDB: make a free cluster on MongoDB Atlas and copy the connection string.
2. Cloudinary: make a free account (needed only for photo upload).
3. Server:
   ```
   cd server
   npm install
   cp .env.example .env     # then fill MONGO_URI, SCORER_KEY, Cloudinary keys
   npm run dev
   ```
   Make SCORER_KEY a long random text (for example 30+ letters and numbers).
4. Client (new terminal):
   ```
   cd client
   npm install
   npm run dev
   ```
5. Open http://localhost:5173

## How to use

- Viewers: just open the site. Home, Bracket, Teams, and each match page update live.
- Scorer link: `http://localhost:5173/manage/<SCORER_KEY>`. Share it only with the scorer. Do not post it anywhere public.
- Order of work:
  1. Teams tab: add teams, logo, team photo, players, pick the captain.
  2. Tournament tab: create the tournament, tick teams, press "Make bracket".
  3. Matches tab: set time and ground, choose who raids first, press "Start match".
  4. Scorer screen: pick how many defenders were touched, tick bonus if it counts, press "Record raid". Use Tackle and Empty raid for the other results. Undo fixes a mistake. Finish match sends the winner to the next round.

## Rules built in (server/utils/kabaddiEngine.js, numbers in server/config/rules.js)

- Touch point: 1 per defender touched. Bonus point: 1, only when the defence has 6 or 7 on the mat, and it never revives.
- Super raid: 3 or more points in one raid.
- Tackle: 1 point. Super tackle: 2 points when the defence has 3 or fewer.
- Empty raids: after 2 in a row, the next raid is do-or-die. If the raider fails, he is out and the defence gets 1 point.
- All out: 2 extra points and the whole team returns.
- Revival: one player per point, in the order they went out.
- A tied match cannot be finished (knockout needs a winner). Score the extra time or golden raid, then finish.

Your village may use slightly different rules (for example 3 empty raids for do-or-die). Change the numbers in `server/config/rules.js`.

## Deploy

- Server on Render: root folder `server`, build `npm install`, start `npm start`, add the same environment variables. Set `CLIENT_URL` to your website address.
- Client on Vercel: root folder `client`. Set `VITE_API_URL` to the Render server address. `vercel.json` already handles page refresh.

## Tests

```
cd server
npm test
```
