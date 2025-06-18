const Meme = require("../models/meme");
const { generateToken } = require("../lib/token");

async function getAllMemes(req, res) {
    const memes = await Meme.find().populate('user');
    const token = generateToken(req.user_id);
    res.status(200).json({ memes: memes, token: token });
}

async function getMemeByID(req, res) {
    try {
        const meme = await Meme.findById(req.params.meme_id).populate('user');
        const token = generateToken(req.user_id);
        res.status(200).json({ meme: meme, token: token });
    }
    catch(err) {
        console.error(err);
        res.status(400).json({ message: "Couldn't find meme" });
    }
}

async function createMeme(req, res) {

    const image = req.file;

    const meme = new Meme({
        img: (image) ? image.path : null,
        title: req.body.title,
        user: req.user_id,
        created_at: Date.now()
    });
    await meme.save();
    const newToken = generateToken(req.user_id);

    res.status(201).json({ message: "Meme saved", token: newToken, newMeme: meme });
};

const MemesController = {
    getAllMemes: getAllMemes,
    getMemeByID: getMemeByID,
    createMeme, createMeme
};

module.exports = MemesController;