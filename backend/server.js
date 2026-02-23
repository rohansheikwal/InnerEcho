const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");

require("./config/passport");

const app = express();

// ✅ MongoDB Connection (Fixed)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err.message));

mongoose.connection.on("connected", () => {
  console.log("📦 Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.log("🚨 Mongoose error:", err);
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Auth routes
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  }
);

app.get("/api/user", (req, res) => {
  res.json(req.user || null);
});

app.get("/auth/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

// API routes
app.use("/confessions", require("./routes/confessionRoutes"));

app.listen(process.env.PORT, () => {
  console.log("🚀 Server running on port " + process.env.PORT);
  console.log("🌐 Open: http://localhost:" + process.env.PORT);
});
