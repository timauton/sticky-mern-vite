const Meme = require("../models/meme");
const { generateToken } = require("../lib/token");

async function getMemes(req, res) {
    const memes = await Meme.find();
    const token = generateToken(req.user_id);
    res.status(200).json({ memes: memes, token: token });
}

const MemesController = {
    getMemes: getMemes
};

module.exports = MemesController;