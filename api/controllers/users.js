const User = require("../models/user"); // interacts with users collection on mongodb
const bcrypt = require("bcrypt"); //hash passwords securely
const jwt = require("jsonwebtoken"); //creates tokens that keeps users logged in using jwts

const JWT_CODE = process.env.JWT_CODE || "supersecret"; //jwtcode reads from .env file and uses supersecret as a fallback

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
//pulls data from the request body, that info a new user sends in the form.
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "User has an account" });
//checks if user with the same email already exists and if so through an error
    const hashedPassword = await bcrypt.hash(password, 8);//8 as a standard security level
//creates a new hashed password
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User Registered", user: { id: user._id, username: user.username } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const login = async (req, res) => {
    console.log("Received Login info", req.body )
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    console.log("user exists", user)
    if (!user) return res.status(400).json({ message: "Invalid username or password" });

    const isAMatch = await bcrypt.compare(password, user.password);
    if (!isAMatch) return res.status(400).json({ message: "Invalid username or password" });

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
