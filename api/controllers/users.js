const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_CODE = process.env.JWT_CODE || "supersecret";

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User has an account" });

    const hashedPassword = await bcrypt.hash(password, 8);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered", user: { id: user._id, username: user.username } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Inavalid email or password" });

    const isAMatch = await bcrypt.compare(password, user.password);
    if (!isAMatch) return res.status(400).json({ message: "Inavalid email or password" });

    const token = jwt.sign({ userId: user._id }, JWT_CODE, { expiresIn: "1d" });

    res.status(200).json({ token, user: { id: user._id, username: user.username } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  registerUser,
  login,
}
