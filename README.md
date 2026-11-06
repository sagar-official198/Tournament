# 🏆 Kabaddi Tournament Management System

A full-stack MERN application designed for village and local Kabaddi tournaments. It provides tournament management, knockout brackets, team and player profiles, live match scoring, and real-time scoreboard updates.

## 🌐 Live Demo

- **Frontend:** https://tournament-two-theta.vercel.app/
- **Backend:** https://kabaddi-backend-kza0.onrender.com
- **Admin / Scorer Panel:** `/manage/<SCORER_KEY>` (private access only)

## ✨ Features

### 🏟️ Tournament Management
- Create and manage Kabaddi tournaments.
- Generate knockout brackets automatically.
- Support byes in knockout rounds.
- Track match schedules and ground details.
- Automatically advance winners to the next round.

### 👥 Team & Player Management
- Add and manage teams.
- Upload team logos and photos.
- Register players with their details.
- Select team captains.
- View team and player profiles.

### ⚡ Live Match Scoring
- Real-time score updates using Socket.io.
- Raid and tackle point management.
- Super raid and super tackle detection.
- Bonus point calculation.
- All-out detection.
- Player revival tracking.
- Undo functionality for scoring corrections.
- Live match event animations.

### 📺 Big Screen Display
- Live scoreboard for LED screens.
- Team information and player details.
- Match timer and score updates.
- Real-time tournament display.

### 🔐 Scorer Access
- No login required for public viewers.
- Private scorer access through a secret URL.
- Protected tournament management operations.

## 🛠️ Tech Stack

**Frontend**
- React.js
- Vite
- Tailwind CSS
- Socket.io Client
- JavaScript

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.io
- Cloudinary
- Multer

**Deployment**
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## 📁 Project Structure

```text
kabaddi-app/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── context/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── manage/
│   │   │   ├── Home
│   │   │   ├── BracketPage
│   │   │   ├── TeamsPage
│   │   │   └── MatchPage
│   │   └── App.jsx
│   ├── vite.config.js
│   └── package.json
│
├── server/
│   ├── config/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── sockets/
│   ├── utils/
│   ├── tests/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## ⚙️ Installation & Setup

### Prerequisites

- Node.js
- npm
- MongoDB Atlas account
- Cloudinary account (for image uploads)

### 1. Clone Repository

```bash
git clone https://github.com/sagar-official198/Tournament.git
cd Tournament
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the server folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
SCORER_KEY=your_long_random_secret
```

Add Cloudinary credentials if image uploads are enabled.

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

Open another terminal:

```bash
cd client
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open your browser:

```text
http://localhost:5173
```

## 🏅 How to Use the Application

### For Tournament Organizers

1. Open the private scorer/admin URL.
2. Navigate to the Teams section.
3. Add teams, team photos, players, and captains.
4. Open Tournament management.
5. Create a tournament and select participating teams.
6. Generate the knockout bracket.
7. Configure matches, match time, and ground.
8. Start the match.
9. Use the Scorer Panel to record live scoring.
10. Finish the match to advance the winner automatically.

### For Public Viewers

Visitors can directly access the website without registration.

They can:
- View tournament information.
- Explore participating teams.
- View player details.
- Check knockout brackets.
- Follow live match scores.
- Watch the scoreboard on a big screen.

## 📜 Kabaddi Scoring Rules

The application includes the following configurable scoring rules:

| Event | Points |
|---|---:|
| Touch Point | 1 per defender |
| Bonus Point | 1 |
| Tackle | 1 |
| Super Tackle | 2 |
| Super Raid | 3 or more raid points |
| All Out | 2 additional points |

Additional rules:

- Bonus points are available when the defending team has 6 or 7 players on the mat.
- Two consecutive empty raids make the next raid a do-or-die raid.
- Revival returns one player per point in the order players were eliminated.
- A tied knockout match requires extra time or a golden raid to determine the winner.

Rules can be customized in:

```text
server/config/rules.js
```

## 🚀 Deployment

### Backend Deployment – Render

- Root Directory: `server`
- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`

Configure environment variables in Render:

```env
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=https://tournament-two-theta.vercel.app
SCORER_KEY=your_strong_random_secret
```

Add Cloudinary variables if required.

### Frontend Deployment – Vercel

- Root Directory: `client`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

Environment variable:

```env
VITE_API_URL=https://kabaddi-backend-kza0.onrender.com
```

Redeploy after changing environment variables.

## 🧪 Testing

Run backend tests:

```bash
cd server
npm test
```

The tests cover the Kabaddi scoring engine and knockout bracket utilities.

## 🔒 Security

- Never commit `.env` files.
- Keep MongoDB credentials private.
- Use a strong and unique scorer secret.
- Never publish the private scorer URL.
- Validate scorer authorization on backend routes.
- Configure CORS to allow your deployed frontend.
- Do not expose private credentials in frontend environment variables.

## 👨‍💻 Developer

**Abhiraj Sagar**

GitHub: https://github.com/sagar-official198

## 📄 License

No license has been specified yet. Add a LICENSE file before permitting reuse or redistribution.

---

**Built to bring digital live scoring and tournament management to local Kabaddi tournaments!** 🏆
