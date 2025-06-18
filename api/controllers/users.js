const User = require("../models/user"); // interacts with users collection on mongodb
const bcrypt = require("bcrypt"); //hash passwords securely
const jwt = require("jsonwebtoken"); //creates tokens that keeps users logged in using jwts

const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; //jwtcode reads from .env file and uses supersecret as a fallback

//registering new users
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

//login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid username or password" });

    const isAMatch = await bcrypt.compare(password, user.password);
    if (!isAMatch) return res.status(400).json({ message: "Invalid username or password" });

    const token = jwt.sign({ sub: user._id}, JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({ token, user: { id: user._id, username: user.username } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

//gets all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

//gets user by their ids
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

//updates users
const updateUser = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User updated", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

//delete users
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  registerUser,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
}
