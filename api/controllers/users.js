const User = require("../models/user"); // interacts with users collection on mongodb
const bcrypt = require("bcrypt"); //hash passwords securely
const jwt = require("jsonwebtoken"); //creates tokens that keeps users logged in using jwts
const { generateToken } = require("../lib/token");
const mongoose = require("mongoose");
const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; //jwtcode reads from .env file and uses supersecret as a fallback
const Meme = require("../models/meme")
const Rating = require("../models/rating")

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

// GET user activity: returns #ratings and #postings over time
const getUserActivity = async (req, res) => {
    try {
        const token = generateToken(req.user_id);
        const userId = new mongoose.Types.ObjectId(req.params.user_id);

        // Get memes created by month
        const memesData = await Meme.aggregate([
            { $match: { user: userId }},
            { $group: {
                _id: { 
                    year: { $year: "$created_at" },
                    month: { $month: "$created_at" }
                },
                memesCreated: { $sum: 1 }
            }},
            { $addFields: {
                period: { 
                    $concat: [
                        { $toString: "$_id.year" },
                        "-",
                        { $cond: {
                            if: { $lt: ["$_id.month", 10] },
                            then: { $concat: ["0", { $toString: "$_id.month" }] },
                            else: { $toString: "$_id.month" }
                        }}
                    ]
                }
            }},
            { $project: { period: 1, memesCreated: 1 }}
        ]);

        // Get ratings made by month
        const ratingsData = await Rating.aggregate([
            { $match: { user: userId }},
            { $group: {
                _id: { 
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" }
                },
                memesRated: { $sum: 1 }
            }},
            { $addFields: {
                period: { 
                    $concat: [
                        { $toString: "$_id.year" },
                        "-",
                        { $cond: {
                            if: { $lt: ["$_id.month", 10] },
                            then: { $concat: ["0", { $toString: "$_id.month" }] },
                            else: { $toString: "$_id.month" }
                        }}
                    ]
                }
            }},
            { $project: { period: 1, memesRated: 1 }}
        ]);
        
        // Combine the data
        const periodMap = {};
        
        memesData.forEach(item => {
            periodMap[item.period] = { 
                period: item.period, 
                memesCreated: item.memesCreated, 
                memesRated: 0 
            };
        });
        
        ratingsData.forEach(item => {
            if (periodMap[item.period]) {
                periodMap[item.period].memesRated = item.memesRated;
            } else {
                periodMap[item.period] = { 
                    period: item.period, 
                    memesCreated: 0, 
                    memesRated: item.memesRated 
                };
            }
        });
        
        // Put the data in a nicer format
        const chartData = Object.values(periodMap).sort((a, b) => a.period.localeCompare(b.period));

        res.status(200).json({ chartData, token });
        
    } catch (error) {
        console.error('Error getting user activity:', error);
        res.status(400).json({ message: "Error finding user activity", token: generateToken(req.user_id) });
    }
}

const getUserTagRankings = async (req, res) => {
    try {
        const token = generateToken(req.user_id);
        const userId = new mongoose.Types.ObjectId(req.params.user_id);
        
        // STEP 1: Get user's overall stats
        const userOverallStats = await Meme.aggregate([
            // Start with all memes created by this specific user
            { $match: { user: userId }},
            
            // Join each meme with its ratings from other users
            { $lookup: {
                from: 'ratings',           // Join with ratings collection
                localField: '_id',         // Meme's _id field
                foreignField: 'meme',      // Rating's meme field
                as: 'ratings'              // Store joined ratings in 'ratings' array
            }},
            
            // Calculate stats for each individual meme
            { $addFields: {
                // Calculate average rating for this meme (handle case where no ratings exist)
                avgRating: { 
                    $cond: {
                        if: { $gt: [{ $size: "$ratings" }, 0] },  // If meme has ratings
                        then: { $avg: "$ratings.rating" },        // Calculate average
                        else: 0                                   // Otherwise default to 0
                    }
                },
                // Count how many ratings this meme received
                ratingCount: { $size: "$ratings" }
            }},
            
            // Aggregate all the user's memes into overall stats
            { $group: {
                _id: null,                                           // Group all memes together
                totalMemes: { $sum: 1 },                            // Count total memes
                overallAvgRating: { $avg: "$avgRating" },           // Average of all meme averages
                totalRatingsReceived: { $sum: "$ratingCount" }      // Sum of all ratings received
            }},
            
            // Clean up the final numbers
            { $addFields: {
                overallAvgRating: { $round: ["$overallAvgRating", 1] }  // Round to 1 decimal place
            }},
            
            // Remove the MongoDB _id field from the result
            { $project: {
                _id: 0,                    // Exclude _id field
                totalMemes: 1,             // Include totalMemes
                overallAvgRating: 1,       // Include overallAvgRating
                totalRatingsReceived: 1    // Include totalRatingsReceived
            }}
        ]);
        
        // STEP 2: Get ALL users' average ratings per tag (eek!)
        const allUsersTagStats = await Meme.aggregate([
            // Unwind tags so each meme-tag combo becomes a separate document
            // Example: A meme with ["cats", "funny"] becomes 2 documents
            { $unwind: "$tags" },
            
            // Join with ratings for each meme
            { $lookup: {
                from: 'ratings',
                localField: '_id',
                foreignField: 'meme',
                as: 'ratings'
            }},
            
            // Calculate average rating per meme
            { $addFields: {
                avgRating: { 
                    $cond: {
                        if: { $gt: [{ $size: "$ratings" }, 0] },
                        then: { $avg: "$ratings.rating" },
                        else: 0
                    }
                }
            }},
            
            // Group by user and tag to get user's average per tag
            // Example: All of testUser's "cats" memes get grouped together
            { $group: {
                _id: { user: "$user", tag: "$tags" },           // Group by user-tag combination
                userAvgRating: { $avg: "$avgRating" },          // Average rating for this user's tag
                userMemeCount: { $sum: 1 }                      // Count of memes in this tag
            }},
            
            // Round the averages for cleaner numbers
            { $addFields: {
                userAvgRating: { $round: ["$userAvgRating", 1] }
            }},
            
            // Group by tag to get all users for each tag
            // Example: All users who have created "cats" memes
            { $group: {
                _id: "$_id.tag",                                // Group by tag name
                users: { $push: {                              // Create array of users for this tag
                    user: "$_id.user",
                    userAvgRating: "$userAvgRating",
                    userMemeCount: "$userMemeCount"
                }}
            }},
            
            // Sort users within each tag by average rating (highest first)
            // This creates the ranking order for each tag
            { $addFields: {
                users: { $sortArray: { input: "$users", sortBy: { userAvgRating: -1 }}}
            }}
        ]);
        
        // STEP 3: Calculate rankings for our specific user
        const tagRankings = [];
        
        // Loop through each tag's user rankings
        for (const tagData of allUsersTagStats) {
            const tag = tagData._id;
            const users = tagData.users;  // Array of users sorted by rating (best first)
            
            // Find our user's position in this tag's ranking
            const userIndex = users.findIndex(u => u.user.equals(userId));
            
            // If our user has memes in this tag, add their ranking info
            if (userIndex !== -1) {
                const userStats = users[userIndex];
                tagRankings.push({
                    tag: tag,
                    userRank: userIndex + 1,                    // Convert to 1-based ranking (1st, 2nd, 3rd...)
                    totalUsers: users.length,                   // How many users compete in this tag
                    userAvgRating: userStats.userAvgRating,     // User's average rating for this tag
                    userMemeCount: userStats.userMemeCount      // User's meme count for this tag
                });
            }
        }
        
        // Send the complete response
        res.status(200).json({ 
            userOverallStats: userOverallStats[0] || { totalMemes: 0, overallAvgRating: 0, totalRatingsReceived: 0 },
            tagRankings: tagRankings, 
            token: token 
        });
        
    } catch (error) {
        console.error('Error getting user tag rankings:', error);
        res.status(400).json({ message: "Error finding user tag rankings", token: generateToken(req.user_id) });
    }
}

module.exports = {
  registerUser,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserActivity,
  getUserTagRankings
}
