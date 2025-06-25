// To create seed data run:
// npm run seed

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
            tags: [""],
            created_at: Date("2025-01-01")
        },
        */
        {
            img: "uploads/cat_keyboard.webp",
            title: "Pair programming",
            user: timUser.id,
            tags: ["cats", "programming"],
            created_at: new Date("2025-01-01")
        },
        {
            img: "uploads/black_cats.webp",
            title: "Black Cats",
            user: trudieUser.id,
            tags: ["cats"],
            created_at: new Date("2025-01-02")
        },
        {
            img: "uploads/cat_food.webp",
            title: "Cat Food",
            user: timUser.id,
            tags: ["cats"],
            created_at: new Date("2025-01-03")
        },
        {
            img: "uploads/readme.webp",
            title: "readme.md",
            user: timUser.id,
            tags: ["programming"],
            created_at: new Date("2025-01-04")
        },
        {
            img: "uploads/skill_issue.webp",
            title: "Skill Issue",
            user: breeUser.id,
            tags: ["programming"],
            created_at: new Date("2025-01-05")
        },
        {
            img: "uploads/ai_replacing_programmers.webp",
            title: "AI",
            user: trudieUser.id,
            tags: ["programming"],
            created_at: new Date("2025-01-06")
        },
        {
            img: "uploads/boba_cat.webp",
            title: "Spotty boi",
            user: timUser.id,
            tags: ["cats"],
            created_at: new Date("2025-01-07")
        },
        {
            img: "uploads/cat_css.png",
            title: "Every box",
            user: trudieUser.id,
            tags: ["cats", "programming"],
            created_at: new Date("2025-01-08")
        },
        {
            img: "uploads/cat_manager.webp",
            title: "Sorry Sir",
            user: breeUser.id,
            tags: ["cats"],
            created_at: new Date("2025-01-09")
        },
        {
            img: "uploads/cat_user_interface.jpeg",
            title: "Users...",
            user: peterUser.id,
            tags: ["cats", "programming"],
            created_at: new Date("2025-01-10")
        },
        {
            img: "uploads/git.webp",
            title: "Truth",
            user: peterUser.id,
            tags: ["programming"],
            created_at: new Date("2025-01-11")
        },
        {
            img: "uploads/identical_cats.webp",
            title: "Double trouble",
            user: peterUser.id,
            tags: ["cats"],
            created_at: new Date("2025-01-11")
        },
        {
            img: "uploads/javascript_errors.webp",
            title: "Love JS",
            user: peterUser.id,
            tags: ["programming"],
            created_at: new Date("2025-01-15")
        },
        {
            img: "uploads/read_the_documentation.webp",
            title: "RTFM",
            user: breeUser.id,
            tags: ["programming"],
            created_at: new Date("2025-01-15")
        },
        {
            img: "uploads/three_wishes.webp",
            title: "i'm a genie in a bottle",
            user: steveUser.id,
            tags: ["programming"],
            created_at: new Date("2025-01-15")
        },
        {
            img: "uploads/ugly_code.webp",
            title: "Uhhhhhhh....",
            user: steveUser.id,
            tags: ["programming"],
            created_at: new Date("2025-01-19")
        },
        {
            img: "uploads/vs_code_plugins.webp",
            title: "moar plugins",
            user: sarahUser.id,
            tags: ["programming"],
            created_at: new Date("2025-01-19")
        },
        {
            img: "uploads/roguelike_cat_toy.webp",
            title: "Such low standards",
            user: timUser.id,
            tags: ["gaming", "cats"],
            created_at: Date("2025-05-03")
        },
        {
            img: "uploads/game_dev_tutorials.webp",
            title: "You have to learn somehow...",
            user: sarahUser.id,
            tags: ["gaming", "programming"],
            created_at: Date("2025-01-01")
        },
        {
            img: "uploads/other_game_engines.gif",
            title: "Something about grass rendering",
            user: timUser.id,
            tags: ["gaming", "programming"],
            created_at: Date("2025-01-02")
        },
                {
            img: "uploads/bloodborne_bosses.png",
            title: "I will let you solo her",
            user: breeUser.id,
            tags: ["gaming"],
            created_at: Date("2025-07-03")
        },
                {
            img: "uploads/falling_out.png",
            title: "She made me build a settlement",
            user: peterUser.id,
            tags: ["gaming"],
            created_at: Date("2025-04-23")
        },
        {
            img: "uploads/going_back_to_the_game.png",
            title: "I do rememebr it was fun tho",
            user: steveUser.id,
            tags: ["gaming"],
            created_at: Date("2025-06-11")
        },
        {
            img: "uploads/groceries.png",
            title: "Just popped out for some milk",
            user: sarahUser.id,
            tags: ["gaming"],
            created_at: Date("2025-06-05")
        },
        {
            img: "uploads/sims.png",
            title: ":(",
            user: timUser.id,
            tags: ["gaming"],
            created_at: Date("2024-12-25")
        },
        {
            img: "uploads/metal-cat.png",
            title: "Metal Lyrics",
            user: peterUser.id,
            tags: ["cats", "heavy metal"],
            created_at: Date("2025-04-20")
        },
        {
            img: "uploads/not-the-same.png",
            title: "Superiority",
            user: peterUser.id,
            tags: ["heavy metal"],
            created_at: Date("2025-06-07")
        }

    ]

    console.log("inserting " + memes.length + " seed memes to database");
    await Meme.insertMany(memes);

    mongoose.connection.close();

}

module.exports = seedMemes;