const Meme = require("../models/meme");
const { generateToken } = require("../lib/token");
const fs = require('fs').promises;

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

    try {

        const image = req.file;

        if (!image) {
            throw "No image provided";
        }

        const meme = new Meme({
            img: (image) ? image.path : null,
            title: req.body.title,
            user: req.user_id,
            created_at: Date.now()
        });
        await meme.save();
        const newToken = generateToken(req.user_id);

        res.status(201).json({ message: "Meme saved", token: newToken, newMeme: meme });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ message: "Error creating meme" });
    }
}

async function deleteMeme(req, res) {

    try {

        const meme = await Meme.findById(req.params.meme_id).populate('user');

        const newToken = generateToken(req.user_id);

        // check it's this user's meme
        if (meme.user.id != req.user_id) {
            res.status(401).json({ message: "Unable to delete another user's meme", token: newToken });
            return;
        }

        await fs.rm(meme.img);
        await Meme.findOneAndDelete( { _id: meme._id } );

        res.status(200).json({ message: "Meme deleted", token: newToken });
        return;

    }
    catch (err) {
        console.error(err);
        res.status(400).json({ message: "Error deleting meme", token: newToken });
        return;
    }
}

async function getNextMeme(req, res) {

    try {
        const memes = await Meme.aggregate([
            { $sample: { size:1 } }
        ]);
        const meme = memes[0];

        const token = generateToken(req.user_id);
        res.status(200).json({ meme: meme, token: token });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ message: "Error finding next meme", token: newToken });
    }

}

const MemesController = {
    getAllMemes: getAllMemes,
    getMemeByID: getMemeByID,
    createMeme, createMeme,
    deleteMeme, deleteMeme,
    getNextMeme, getNextMeme,
};

module.exports = MemesController;