const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
  email: String,
  name: String,
  avatarUrl: String
});
module.exports = User;