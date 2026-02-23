# 🌀 InnerEcho — Anonymous Confession Web App

> *Say what you've never said. Anonymously.*

InnerEcho is a full-stack web application where users can post anonymous confessions, react to others' confessions, and manage their own posts securely using a secret code or Google account.

---

## 🚀 Live Demo

> Run locally at `http://localhost:5000` after setup.

---

## ✨ Features

- 🔐 **Google OAuth Login** — Sign in securely with your Google account via Passport.js
- 📝 **Anonymous Confessions** — Post confessions without revealing your identity
- 🔑 **Secret Code Protection** — Set a personal secret code to edit or delete your own confession
- 🔓 **Owner Bypass** — Forgot your code? Logged-in users can verify ownership via Google account
- 😂 **Emoji Reactions** — React with 👍 ❤️ 😂 — one reaction per confession per user
- 🔄 **Toggle Reactions** — Click your reaction again to remove it
- 🔍 **Real-time Search** — Search confessions instantly as you type
- 📊 **Sort Options** — Sort by Newest, Oldest, or Most Reacted
- 🌙 **Dark / Light Mode** — Switch themes; preference saved across sessions
- 🎉 **Confetti Animation** — Fires when you successfully post a confession
- 🔔 **Toast Notifications** — Clean popup feedback for actions
- 🖼️ **Empty State Illustration** — Friendly graphic when no confessions are found
- 💬 **Rotating Quotes** — Inspirational quotes auto-rotate on the Confess page
- ✏️ **Edit Confessions** — Pre-filled edit modal with your existing text
- 🗑️ **Delete Confessions** — Securely delete with secret code verification

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB, Mongoose |
| **Authentication** | Passport.js, Google OAuth 2.0 |
| **Session** | express-session |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Fonts** | Google Fonts (Poppins) |

---

## 📁 Project Structure

```
InnerEcho/
├── backend/
│   ├── server.js              # Express server entry point
│   ├── config/
│   │   └── passport.js        # Google OAuth strategy
│   ├── models/
│   │   └── Confession.js      # Mongoose schema
│   └── routes/
│       └── confessionRoutes.js # REST API routes
├── frontend/
│   ├── index.html             # SPA shell
│   ├── style.css              # Full theme & responsive styles
│   └── script.js              # All frontend logic
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) running locally
- A Google Cloud project with OAuth credentials

### 1. Clone the repository

```bash
git clone https://github.com/rohansheikwal/InnerEcho.git
cd InnerEcho
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the environment file

Create a file at `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/confessionDB
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
```

### 4. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project → Enable **Google+ API**
3. Go to **Credentials** → Create **OAuth 2.0 Client ID**
4. Add Authorized redirect URI: `http://localhost:5000/auth/google/callback`
5. Copy the Client ID and Secret into your `.env`

### 5. Start MongoDB

```bash
# Windows (if installed as service)
net start MongoDB

# Or run manually
mongod
```

### 6. Start the server

```bash
npm start
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/user` | Get current logged-in user |
| `GET` | `/auth/google` | Initiate Google OAuth login |
| `GET` | `/auth/google/callback` | OAuth callback |
| `GET` | `/auth/logout` | Logout user |
| `GET` | `/confessions` | Get all confessions |
| `POST` | `/confessions` | Create a new confession |
| `PUT` | `/confessions/:id` | Edit a confession |
| `DELETE` | `/confessions/:id` | Delete a confession |
| `POST` | `/confessions/:id/react` | Add a reaction |
| `DELETE` | `/confessions/:id/react` | Remove a reaction |

---

## 🔒 Security Notes

- `.env` is excluded from version control via `.gitignore`
- `node_modules/` is excluded from version control
- Secret codes are stored as-is (in production, use bcrypt hashing)
- Sessions use a configurable secret key

---

## 👤 Author

**Rohan Sheikwal**  
GitHub: [@rohansheikwal](https://github.com/rohansheikwal)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
