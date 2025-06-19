require("dotenv").config();

const mongoose = require("mongoose");
const Meme = require("../models/meme");
const User = require("../models/user");
const { connectDB } = require("../db/db");
const fs = require('fs').promises;
const path = require('path');

const seedMemes = async () => {

    // copy images from the seed folder to the uploads folder
    console.log("Copying seed memes");
    const sourceDir = "seeds/seedImages";
    const destDir = "uploads";
    const files = await fs.readdir(sourceDir);
    for (const file of files) {
        const srcPath = path.join(sourceDir, file);
        const destPath = path.join(destDir, file);
        await fs.copyFile(srcPath, destPath);
    }

    await connectDB();

    await Meme.deleteMany({});
    
    // we need real user IDs to create memes
    const timUser = await User.findOne({ username: "timauton" });
    const peterUser = await User.findOne({ username: "peternieuwk" });
    const breeUser = await User.findOne({ username: "breebrigid" });
    const trudieUser = await User.findOne({ username: "trudieandy" });
    const sarahUser = await User.findOne({ username: "sarahmat" });
    const steveUser = await User.findOne({ username: "stevecottle" });

    const memes = [
        /* template meme entry
        {
            img: "uploads/",
            title: "",
            user: User.id,
            created_at: Date("2025-01-01")
        },
        */
        {
            img: "uploads/cat_keyboard.webp",
            title: "Pair programming",
            user: timUser.id,
            created_at: Date("2025-01-01")
        },
        {
            img: "uploads/black_cats.webp",
            title: "Black Cats",
            user: trudieUser.id,
            created_at: Date("2025-01-01")
        },
        {
            img: "uploads/cat_food.webp",
            title: "Cat Food",
            user: timUser.id,
            created_at: Date("2025-01-01")
        },
        {
            img: "uploads/readme.webp",
            title: "readme.md",
            user: timUser.id,
            created_at: Date("2025-01-01")
        },
        {
            img: "uploads/skill_issue.webp",
            title: "Skill Issue",
            user: breeUser.id,
            created_at: Date("2025-01-01")
        },
        {
            img: "uploads/ai_replacing_programmers.webp",
            title: "AI",
            user: trudieUser.id,
            created_at: Date("2025-01-01")
        },
        {
            img: "uploads/boba_cat.webp",
            title: "Spotty boi",
            user: timUser.id,
            created_at: Date("2025-01-01")
        },
        {
            img: "uploads/cat_css.png",
            title: "Every box",
            user: trudieUser.id,
            created_at: Date("2025-01-01")
        },
        {
            img: "uploads/cat_manager.webp",
            title: "Sorry Sir",
            user: breeUser.id,
            created_at: Date("2025-01-01")
        },
        {
            img: "uploads/cat_user_interface.webp",
            title: "Users...",
            user: peterUser.id,
            created_at: Date("2025-01-01")
        },
        {
            img: "uploads/git.webp",
            title: "Truth",
            user: peterUser.id,
            created_at: Date("2025-01-01")
        },
        {
            img: "uploads/identical_cats.webp",
            title: "Double trouble",
            user: peterUser.id,
            created_at: Date("2025-01-01")
        },
        {
            img: "uploads/javascript_errors.webp",
            title: "Love JS",
            user: peterUser.id,
            created_at: Date("2025-01-01")
        },
        {
            img: "uploads/read_the_documentation.webp",
            title: "RTFM",
            user: breeUser.id,
            created_at: Date("2025-01-01")
        },
        {
            img: "uploads/three_wishes.webp",
            title: "i'm a genie in a bottle",
            user: steveUser.id,
            created_at: Date("2025-01-01")
        },
        {
            img: "uploads/ugly_code.webp",
            title: "Uhhhhhhh....",
            user: steveUser.id,
            created_at: Date("2025-01-01")
        },
        {
            img: "uploads/vs_code_plugins.webp",
            title: "moar plugins",
            user: sarahUser.id,
            created_at: Date("2025-01-01")
        },
    ]

    console.log("inserting seed memes to database");
    await Meme.insertMany(memes);

    mongoose.connection.close();

}

module.exports = seedMemes;