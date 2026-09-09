const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  leader: { type: String, required: true },
  memberCount: { type: Number, required: true },
});

module.exports = mongoose.model('Team', teamSchema);