// seeds/ratings.js
require("dotenv").config();

const mongoose = require("mongoose");
const Rating = require("../models/rating");
const User = require("../models/user");
const Meme = require("../models/meme");
const { connectDB } = require("../db/db");

const seedRatings = async () => {
    await connectDB();
    
    await Rating.deleteMany({}); // Clear existing ratings
    console.log("Existing ratings removed.");
    
    // Get all users and memes (they should exist from previous seeds)
    const users = await User.find({});
    const memes = await Meme.find({});
    
    if (users.length === 0 || memes.length === 0) {
        console.error("❌ No users or memes found! Run user and meme seeds first.");
        return;
    }
    
    const ratings = [
        // Cat keyboard meme ratings
        { meme: memes[0]._id, user: users[1]._id, rating: 5 },
        { meme: memes[0]._id, user: users[2]._id, rating: 4 },
        { meme: memes[0]._id, user: users[3]._id, rating: 5 },
        
        // Black cats meme ratings
        { meme: memes[1]._id, user: users[0]._id, rating: 3 },
        { meme: memes[1]._id, user: users[4]._id, rating: 4 },
        { meme: memes[1]._id, user: users[5]._id, rating: 5 },
        
        // Cat food meme ratings
        { meme: memes[2]._id, user: users[6]._id, rating: 2 },
        { meme: memes[2]._id, user: users[7]._id, rating: 3 },
        
        // Readme meme ratings
        { meme: memes[3]._id, user: users[8]._id, rating: 5 },
        { meme: memes[3]._id, user: users[9]._id, rating: 4 },
        { meme: memes[3]._id, user: users[10]._id, rating: 5 },
        { meme: memes[3]._id, user: users[11]._id, rating: 4 },
        
        // Skill issue meme ratings
        { meme: memes[4]._id, user: users[12]._id, rating: 1 },
        { meme: memes[4]._id, user: users[13]._id, rating: 2 },
        
        // AI meme ratings (mixed feelings on this one!)
        { meme: memes[5]._id, user: users[14]._id, rating: 1 },
        { meme: memes[5]._id, user: users[15]._id, rating: 5 },
        { meme: memes[5]._id, user: users[16]._id, rating: 2 },
        { meme: memes[5]._id, user: users[17]._id, rating: 4 },
        
        // Some memes have been left unrated for testing random unrated endpoint
    ];
    
    console.log("Inserting seed ratings to database");
    await Rating.insertMany(ratings);
    console.log(`Seeded ${ratings.length} ratings successfully.`);
    
    mongoose.connection.close();
};

module.exports = seedRatings;