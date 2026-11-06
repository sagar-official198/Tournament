# 🏆 Kabaddi Tournament Management System

A full-stack MERN application designed for village and local Kabaddi tournaments, featuring knockout brackets, team and player management, live match scoring, and real-time scoreboard updates.

## 🌐 Live Demo

| Platform | Link |
|---|---|
| 🌍 Public Website | https://tournament-two-theta.vercel.app/ |
| 🔐 Admin / Scorer Panel | https://tournament-two-theta.vercel.app/manage/change-me-to-a-long-random-string |
| ⚙️ Backend API | https://kabaddi-backend-kza0.onrender.com |

### Admin / Scorer Panel

The Admin Panel is designed for the tournament organizer or authorized scorer.

**Admin capabilities:**
- Add, edit, and manage teams.
- Upload team photos and logos.
- Register players and assign captains.
- Create and configure tournaments.
- Generate knockout brackets automatically.
- Schedule matches and assign grounds.
- Start and manage live matches.
- Record raids, tackles, bonus points, and empty raids.
- Undo incorrect scoring actions.
- Finish matches and automatically advance winners.

**Public Website:** Visitors can access tournament information, teams, players, brackets, and live match scores without login.

**Admin Access:** The scorer panel uses a secret URL instead of a traditional login system. Share it only with the authorized tournament operator.

> ⚠️ Security: The admin URL above contains your original placeholder secret. Replace `SCORER_KEY` with a strong, unique random value in Render and update the admin link before publishing this README. Never publish the real secret URL publicly.

---

## ✨ Features

- Real-time Kabaddi scoring with Socket.io.
- Automatic knockout bracket generation.
- Team and player management.
- Captain selection.
- Live scoreboard with animations.
- Big Screen / LED display support.
- Automatic winner advancement.
- MongoDB data storage.
- Cloudinary image uploads.
- Scoring undo functionality.

## 🛠️ Technology Stack

**Frontend:** React.js, Vite, Tailwind CSS, Socket.io Client.

**Backend:** Node.js, Express.js, MongoDB, Mongoose, Socket.io, Cloudinary, Multer.

**Deployment:** Vercel, Render, MongoDB Atlas.

## 👨‍💻 Developer

**Abhiraj Sagar**

GitHub: https://github.com/sagar-official198

**Built to bring digital live scoring and tournament management to local Kabaddi tournaments!** 🏆
