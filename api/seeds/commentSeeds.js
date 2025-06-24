require("dotenv").config();
const mongoose = require("mongoose");
const CommentController = ("../models/commentModel");
const User = require("../models/user");
const Meme = require("../models/meme");
const { connectDB } = require("../db/db");


const seedComments = async () => {
    await connectDB();

    await CommentController.deleteMany({}); // Clear existing ratings
    console.log("Existing comments removed");

    // Get all users and memes (they should exist from previous seeds)
    const user = await User.find({});
    const memes = await Meme.find({});

    if (users.length === 0 || memes.length === 0) {
        console.error("❌ No users or memes found! Run user and meme seeds first.");
        return;
    }

    const comments = [
        { meme: memes[0]._id, user: users[3]._id, comment: "LOL I can't stop laughing 😂" },
        { meme: memes[0]._id, user: users[1]._id, comment: "This is elite meme culture" },
        { meme: memes[1]._id, user: users[5]._id, comment: "Too real 😩" },
        { meme: memes[1]._id, user: users[2]._id, comment: "This meme hit harder than expected 😭" },
        { meme: memes[1]._id, user: users[4]._id, comment: "Too relatable. I'm in this photo and I don't like it." },
        { meme: memes[1]._id, user: users[7]._id, comment: "Pure gold 🔥" },
        { meme: memes[2]._id, user: users[2]._id, comment: "Absolute masterpiece" },
        { meme: memes[2]._id, user: users[7]._id, comment: "I needed this today 🙌" },
        { meme: memes[2]._id, user: users[0]._id, comment: "Why is this so accurate?!" },
        { meme: memes[3]._id, user: users[1]._id, comment: "Meme of the year contender!" },
        { meme: memes[3]._id, user: users[0]._id, comment: "This should be illegal 😂" },
        { meme: memes[4]._id, user: users[4]._id, comment: "10/10 would meme again" },
        { meme: memes[4]._id, user: users[8]._id, comment: "Instant classic" },
        { meme: memes[5]._id, user: users[3]._id, comment: "I can't unsee this now..." },
        { meme: memes[5]._id, user: users[6]._id, comment: "Cursed, but hilarious" },
        { meme: memes[5]._id, user: users[9]._id, comment: "Please delete this (I love it)" },
        { meme: memes[6]._id, user: users[6]._id, comment: "This belongs in a museum" },
        { meme: memes[6]._id, user: users[1]._id, comment: "Legendary post!" },
        { meme: memes[6]._id, user: users[3]._id, comment: "Perfect timing 🔥" },
        { meme: memes[8]._id, user: users[5]._id, comment: "I've watched this loop 20 times already" },
        { meme: memes[8]._id, user: users[2]._id, comment: "Unreasonably funny 😂" },
        { meme: memes[9]._id, user: users[2]._id, comment: "This meme just won the internet" },
        { meme: memes[9]._id, user: users[9]._id, comment: "Chefs kiss 👨‍🍳💋" },
        { meme: memes[9]._id, user: users[4]._id, comment: "Peak comedy" },
        { meme: memes[10]._id, user: users[8]._id, comment: "This is how I feel every Monday" },
        { meme: memes[10]._id, user: users[1]._id, comment: "Instant reaction gif material" },
        { meme: memes[10]._id, user: users[4]._id, comment: "Tagged 3 friends already" },
        { meme: memes[10]._id, user: users[6]._id, comment: "Give this person a raise" },
        { meme: memes[11]._id, user: users[0]._id, comment: "This made my day" },
        { meme: memes[12]._id, user: users[6]._id, comment: "Im crying 😭" },
        { meme: memes[13]._id, user: users[0]._id, comment: "Brilliant execution" },
        { meme: memes[13]._id, user: users[7]._id, comment: "Needed this laugh today" },
        { meme: memes[14]._id, user: users[7]._id, comment: "This ones going in my cringe/funny folder" },
        { meme: memes[14]._id, user: users[2]._id, comment: "Cant stop rewatching this" },
        { meme: memes[14]._id, user: users[3]._id, comment: "Deserves an award" },
        { meme: memes[15]._id, user: users[5]._id, comment: "Sending this to everyone I know" },
        { meme: memes[15]._id, user: users[8]._id, comment: "Actual perfection" },
        { meme: memes[16]._id, user: users[9]._id, comment: "So dumb it's genius 🤯" },
        { meme: memes[16]._id, user: users[9]._id, comment: "Top-tier chaos" },
    ];


    console.log("Inserting seed comments into database");
    await CommentController.insertMany(comments);
    console.log(`Seeded ${comments.length} comments successfully!`);

    mongoose.connection.close();

};

module.exports = seedComments;