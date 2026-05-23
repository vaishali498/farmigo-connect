const mongoose = require('mongoose');
const chatSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  sender: { type: String, required: true },
  senderName: { type: String },
  message: { type: String, required: true },
  time: { type: Date, default: Date.now }
}, { timestamps: true });
module.exports = mongoose.model('ChatMessage', chatSchema);
