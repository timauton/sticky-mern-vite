const User = require("../models/user");
const { generateToken } = require("../lib/token");
const bcrypt = require("bcrypt")

async function createToken(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  const user = await User.findOne({ username: username });
  if (!user) {
    console.log("Auth Error: User not found");
    return res.status(401).json({ message: "User not found" });
  } 

  const isAMatch = await bcrypt.compare(password, user.password);
  if (!isAMatch) {
    console.log("Auth Error: Passwords do not match");
    return res.status(401).json({ message: "Password incorrect" });
  }

  const token = generateToken(user.id);
  return res.status(201).json({ token: token, message: "OK" });
  
}

const AuthenticationController = {
  createToken: createToken,
};

module.exports = AuthenticationController;
