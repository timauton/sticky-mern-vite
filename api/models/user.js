const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: false, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
