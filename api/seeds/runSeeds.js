// To create seed data run:
// npm run seed

const seededUsers = require("./users");
const seedMemes = require("./memes");
const seedRatings = require("./ratings");
const seedComments = require("./commentSeeds");

const runSeeds = async () => {
    try {
        console.log("Starting seed process...")

        await seededUsers();
        await seedMemes();
        await seedRatings();
        await seedComments();

        console.log("All seeds completed successfully!")
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

runSeeds();