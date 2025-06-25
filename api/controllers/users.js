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

const getUserTagLeaderboard = async (req, res) => {
    try {
        const token = generateToken(req.user_id);
        const userId = new mongoose.Types.ObjectId(req.params.user_id);
        const tag = req.params.tag;
        
        // Get the requesting user's info so we can find them in the leaderboard later
        const requestingUser = await User.findById(userId);
        
        // Create detailed leaderboard for a specific tag
        const tagLeaderboard = await Meme.aggregate([
            // STEP 1: Find all memes that have this specific tag
            { $match: { tags: tag }},
            
            // STEP 2: Join each meme with its ratings from other users
            { $lookup: {
                from: 'ratings',           // Join with ratings collection
                localField: '_id',         // Meme's _id field
                foreignField: 'meme',      // Rating's meme field
                as: 'ratings'              // Store joined ratings in 'ratings' array
            }},
            
            // STEP 3: Calculate average rating for each individual meme
            { $addFields: {
                avgRating: { 
                    $cond: {
                        if: { $gt: [{ $size: "$ratings" }, 0] },  // If meme has ratings
                        then: { $avg: "$ratings.rating" },        // Calculate average rating
                        else: 0                                   // Otherwise default to 0
                    }
                }
            }},
            
            // STEP 4: Group by user to get each user's performance in this tag
            // This combines all of a user's memes in this tag into one record
            { $group: {
                _id: "$user",                           // Group by user ID
                avgRating: { $avg: "$avgRating" },      // Average of user's meme averages for this tag
                memeCount: { $sum: 1 }                  // Count how many memes user has in this tag
            }},
            
            // STEP 5: Round the averages for cleaner display
            { $addFields: {
                avgRating: { $round: ["$avgRating", 1] }  // Round to 1 decimal place
            }},
            
            // STEP 6: Join with users collection to get usernames
            // This is where we get the actual display names
            { $lookup: {
                from: 'users',             // Join with users collection
                localField: '_id',         // User ID from grouped memes
                foreignField: '_id',       // User's _id field in users collection
                as: 'userInfo'             // Store user details in 'userInfo' array
            }},
            
            // STEP 7: Extract username from the joined user data
            { $addFields: {
                username: {
                    $cond: {
                        if: { $gt: [{ $size: "$userInfo" }, 0] },              // If user was found
                        then: { $arrayElemAt: ["$userInfo.username", 0] },     // Get first (only) username
                        else: "unknown"                                        // Fallback if user not found
                    }
                }
            }},
            
            // STEP 8: Sort by average rating (highest first to create ranking order)
            // This determines who's #1, #2, #3, etc.
            { $sort: { avgRating: -1 }},
            
            // STEP 9: Clean up the response - only return fields we need
            { $project: {
                username: 1,        // Include username
                avgRating: 1,       // Include average rating
                memeCount: 1        // Include meme count
            }}
        ]);
        
        // STEP 10: Convert aggregation result to leaderboard format with ranks
        // Add rank numbers (1st, 2nd, 3rd, etc.) based on sorted order
        const leaderboard = tagLeaderboard.map((user, index) => ({
            rank: index + 1,                // Convert array index to rank (1-based)
            username: user.username,        // Real username from database
            avgRating: user.avgRating,      // User's average rating for this tag
            memeCount: user.memeCount       // User's meme count for this tag
        }));
        
        // STEP 11: Find the requesting user's specific stats in the leaderboard
        // This shows where the requesting user ranks compared to everyone else
        const userStats = leaderboard.find(user => user.username === requestingUser?.username) || {
            rank: 0,                                    // User not found in this tag
            username: requestingUser?.username || 'not found',  // Show their username or error
            avgRating: 0,                               // No average if not found
            memeCount: 0                                // No memes in this tag
        };
        
        // STEP 12: Return complete leaderboard response
        res.status(200).json({ 
            tag: tag,                       // Which tag this leaderboard is for
            leaderboard: leaderboard,       // Full ranking of all users in this tag
            userStats: userStats,           // Requesting user's specific performance and rank
            token: token                    // New JWT token
        });
        
    } catch (error) {
        console.error('Error getting tag leaderboard:', error);
        res.status(400).json({ 
            message: "Error finding tag leaderboard", 
            token: generateToken(req.user_id) 
        });
    }
}

const getUserOverallLeaderboard = async (req, res) => {
    try {
        console.log("Overall leaderboard endpoint hit!");
        const token = generateToken(req.user_id);
        const userId = new mongoose.Types.ObjectId(req.params.user_id);
        
        // Get the requesting user's info so we can find them in the leaderboard later
        const requestingUser = await User.findById(userId);
        
        // Create overall leaderboard across all users
        const overallLeaderboard = await Meme.aggregate([
            // STEP 1: Join each meme with its ratings
            { $lookup: {
                from: 'ratings',
                localField: '_id',
                foreignField: 'meme',
                as: 'ratings'
            }},
            
            // STEP 2: Calculate average rating for each meme
            { $addFields: {
                avgRating: { 
                    $cond: {
                        if: { $gt: [{ $size: "$ratings" }, 0] },
                        then: { $avg: "$ratings.rating" },
                        else: 0
                    }
                },
                ratingCount: { $size: "$ratings" }
            }},
            
            // STEP 3: Group by user to get each user's overall performance
            { $group: {
                _id: "$user",
                avgRating: { $avg: "$avgRating" },      // Average of all user's meme averages
                totalMemes: { $sum: 1 },               // Total memes created
                totalRatings: { $sum: "$ratingCount" }  // Total ratings received
            }},
            
            // STEP 4: Round averages for cleaner display
            { $addFields: {
                avgRating: { $round: ["$avgRating", 1] }
            }},
            
            // STEP 5: Join with users to get usernames
            { $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userInfo'
            }},
            
            // STEP 6: Extract username
            { $addFields: {
                username: {
                    $cond: {
                        if: { $gt: [{ $size: "$userInfo" }, 0] },
                        then: { $arrayElemAt: ["$userInfo.username", 0] },
                        else: "unknown"
                    }
                }
            }},
            
            // STEP 7: Sort by overall average rating (highest first)
            { $sort: { avgRating: -1 }},
            
            // STEP 8: Clean up response
            { $project: {
                username: 1,
                avgRating: 1,
                totalMemes: 1,
                totalRatings: 1
            }}
        ]);
        
        // Convert to leaderboard format with ranks
        const leaderboard = overallLeaderboard.map((user, index) => ({
            rank: index + 1,
            username: user.username,
            avgRating: user.avgRating,
            totalMemes: user.totalMemes,
            totalRatings: user.totalRatings
        }));
        
        // Find requesting user's stats
        const userStats = leaderboard.find(user => user.username === requestingUser?.username) || {
            rank: 0,
            username: requestingUser?.username || 'not found',
            avgRating: 0,
            totalMemes: 0,
            totalRatings: 0
        };
        
        res.status(200).json({ 
            leaderboard: leaderboard,
            userStats: userStats,
            token: token 
        });
        
    } catch (error) {
        console.error('Error getting overall leaderboard:', error);
        res.status(400).json({ 
            message: "Error finding overall leaderboard", 
            token: generateToken(req.user_id) 
        });
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
  getUserTagRankings,
  getUserTagLeaderboard,
  getUserOverallLeaderboard
}
