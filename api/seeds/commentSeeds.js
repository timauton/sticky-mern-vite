require("dotenv").config();
const mongoose = require("mongoose");
const Comment = require("../models/comment");
const User = require("../models/user");
const Meme = require("../models/meme");
const { connectDB } = require("../db/db");


const seedComments = async () => {
    await connectDB();

    await Comment.deleteMany({}); // Clear existing ratings
    console.log("Existing comments removed");

    // Get all users and memes (they should exist from previous seeds)
    const users = await User.find({});
    const memes = await Meme.find({});

    if (users.length === 0 || memes.length === 0) {
        console.error("❌ No users or memes found! Run user and meme seeds first.");
        return;
    }

    const comments = [
        { meme_id: memes[0]._id, user_id: users[3]._id, comment: "LOL I can't stop laughing 😂" },
        { meme_id: memes[0]._id, user_id: users[1]._id, comment: "This is elite meme culture" },
        { meme_id: memes[1]._id, user_id: users[5]._id, comment: "Too real 😩" },
        { meme_id: memes[1]._id, user_id: users[2]._id, comment: "This meme hit harder than expected 😭" },
        { meme_id: memes[1]._id, user_id: users[4]._id, comment: "Too relatable. I'm in this photo and I don't like it." },
        { meme_id: memes[1]._id, user_id: users[7]._id, comment: "Pure gold 🔥" },
        { meme_id: memes[2]._id, user_id: users[2]._id, comment: "Absolute masterpiece" },
        { meme_id: memes[2]._id, user_id: users[7]._id, comment: "I needed this today 🙌" },
        { meme_id: memes[2]._id, user_id: users[0]._id, comment: "Why is this so accurate?!" },
        { meme_id: memes[3]._id, user_id: users[1]._id, comment: "Meme of the year contender!" },
        { meme_id: memes[3]._id, user_id: users[0]._id, comment: "This should be illegal 😂" },
        { meme_id: memes[4]._id, user_id: users[4]._id, comment: "10/10 would meme again" },
        { meme_id: memes[4]._id, user_id: users[8]._id, comment: "Instant classic" },
        { meme_id: memes[5]._id, user_id: users[3]._id, comment: "I can't unsee this now..." },
        { meme_id: memes[5]._id, user_id: users[6]._id, comment: "Cursed, but hilarious" },
        { meme_id: memes[5]._id, user_id: users[9]._id, comment: "Please delete this (I love it)" },
        { meme_id: memes[6]._id, user_id: users[6]._id, comment: "This belongs in a museum" },
        { meme_id: memes[6]._id, user_id: users[1]._id, comment: "Legendary post!" },
        { meme_id: memes[6]._id, user_id: users[3]._id, comment: "Perfect timing 🔥" },
        { meme_id: memes[8]._id, user_id: users[5]._id, comment: "I've watched this loop 20 times already" },
        { meme_id: memes[8]._id, user_id: users[2]._id, comment: "Unreasonably funny 😂" },
        { meme_id: memes[9]._id, user_id: users[2]._id, comment: "This meme just won the internet" },
        { meme_id: memes[9]._id, user_id: users[9]._id, comment: "Chefs kiss 👨‍🍳💋" },
        { meme_id: memes[9]._id, user_id: users[4]._id, comment: "Peak comedy" },
        { meme_id: memes[10]._id, user_id: users[8]._id, comment: "This is how I feel every Monday" },
        { meme_id: memes[10]._id, user_id: users[1]._id, comment: "Instant reaction gif material" },
        { meme_id: memes[10]._id, user_id: users[4]._id, comment: "Tagged 3 friends already" },
        { meme_id: memes[10]._id, user_id: users[6]._id, comment: "Give this person a raise" },
        { meme_id: memes[11]._id, user_id: users[0]._id, comment: "This made my day" },
        { meme_id: memes[12]._id, user_id: users[6]._id, comment: "Im crying 😭" },
        { meme_id: memes[13]._id, user_id: users[0]._id, comment: "Brilliant execution" },
        { meme_id: memes[13]._id, user_id: users[7]._id, comment: "Needed this laugh today" },
        { meme_id: memes[14]._id, user_id: users[7]._id, comment: "This ones going in my cringe/funny folder" },
        { meme_id: memes[14]._id, user_id: users[2]._id, comment: "Cant stop rewatching this" },
        { meme_id: memes[14]._id, user_id: users[3]._id, comment: "Deserves an award" },
        { meme_id: memes[15]._id, user_id: users[5]._id, comment: "Sending this to everyone I know" },
        { meme_id: memes[15]._id, user_id: users[8]._id, comment: "Actual perfection" },
        { meme_id: memes[16]._id, user_id: users[9]._id, comment: "So dumb it's genius 🤯" },
        { meme_id: memes[16]._id, user_id: users[9]._id, comment: "Top-tier chaos" },
    ];

    console.log("Inserting seed comments into database");
    await Comment.insertMany(comments);
    console.log(`Seeded ${comments.length} comments successfully!`);

    mongoose.connection.close();

};

module.exports = seedComments;