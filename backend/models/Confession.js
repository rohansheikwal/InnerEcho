const mongoose = require("mongoose");

const confessionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  secretCode: {
    type: String,
    required: true,
    minlength: 4
  },
  reactions: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    laugh: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Confession", confessionSchema);
