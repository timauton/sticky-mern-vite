const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const connectDB = require("../db/db");

const seededUsers = async () => {
    await connectDB();

    await User.deleteMany({}); //we clear the existing users first.
    console.log("Existing users removed.");

    //examples of users - teamates

    const users = [
        {
            username: "trudieandy",
            email: "trudieandy@email.com",
            password: "password123"
        },

        {
            username: "peternieuwk",
            email: "peternik@email.com",
            password: "peterpan2025"
        },

        {
            username: "sarahmat",
            email: "sarahmath@email.com",
            password: "sarahjump"
        },

        {
            username: "stevecottle",
            email: "stevie@email.com",
            password: "stevewonder227"
        },

        {
            username: "timauton",
            email: "timauton@email.com",
            password: "timgoesfishing"
        },

        {
            username: "breebrigid",
            email: "breebrigid@email.com",
            password: "londonbridge1888"
        },
    ];

    const hashedUsers = await Promise.all(
        users.map(async (user) => ({
            ...user,
            password: await bcrypt.hash(user.password, 8),
        }))
    );

    await User.insertMany(hashedUsers); //insert users
    console.log("Seeded users added successfully.");

    mongoose.connection.close();
};

seededUsers().catch((e) => {
    console.error("Error seeding users:", e);
    mongoose.connection.close();
});