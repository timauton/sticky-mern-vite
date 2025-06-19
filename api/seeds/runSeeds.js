const seededUsers = require("./users");
const seedMemes = require("./memes");

const runSeeds = async () => {
    await seededUsers();
    await seedMemes();
};

runSeeds();