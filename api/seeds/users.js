// To create seed data run:
// npm run seed

require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { connectDB } = require("../db/db");

const seededUsers = async () => {
    await connectDB();

    await User.deleteMany({}); //we clear/delete the existing users first.
    console.log("Existing users removed.");

    //examples of users

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

        {
            username: "flaviallen",
            email: "flaviaallen@email.com",
            password: "flaviaallen",
        },

        {
            username: "sonnieman",
            email: "sonniegill@email.com",
            password: "sonniepass",
        },

        {
            username: "richierich",
            email: "richierichards@email.com",
            password: "moneytalks",
        },

        {
            username: "tonyfelix",
            email: "anthonyfelix@email.com",
            password: "felixcat88",
        },

        {
            username: "brandiefifi",
            email: "brandiefiona@email.com",
            password: "fififizz",
        },

        {
            username: "gracejus",
            email: "gracejustine@email.com",
            password: "gracefullyme",
        },

        {
            username: "mildasam",
            email: "mildasam@email.com",
            password: "samsmile77",
        },

        {
            username: "nasbrownie",
            email: "nasbrown@email.com",
            password: "brownienas",
        },

        {
            username: "marksutt",
            email: "marksutton@email.com",
            password: "ashymark123",
        },

        {
            username: "josyms",
            email: "josyms@email.com",
            password: "josypower",
        },

        {
            username: "angieann",
            email: "angieann@email.com",
            password: "angelic2025",
        },

        {
            username: "chloequink",
            email: "chloequink@email.com",
            password: "chloequeen",
        },

        {
            username: "jamiejam",
            email: "jamiejam@email.com",
            password: "jammin1999",
        },

        {
            username: "joechico",
            email: "joechico@email.com",
            password: "chicoboy26",
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

    mongoose.connection.close(); //close db connection 
};

// Running this from runSeeds now
/*
seededUsers().catch((e) => {
    console.error("Error seeding users:", e);
    mongoose.connection.close();
});
*/

module.exports = seededUsers;