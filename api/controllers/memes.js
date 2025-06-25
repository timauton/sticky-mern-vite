const Meme = require("../models/meme");
const { generateToken } = require("../lib/token");
const fs = require('fs').promises;
const mongoose = require('mongoose');

async function getAllMemes(req, res) {

    let token;

    try {
        token = generateToken(req.user_id);
        const memes = await Meme.find().populate('user');
        res.status(200).json({ memes: memes, token: token });
    }
    catch(err) {
        console.error(err);
        res.status(400).json({ message: "Error finding memes", token });
    }
}

async function getMemeByID(req, res) {
    let token;

    try {
        // Only generate token if user is authenticated
        token = req.user_id ? generateToken(req.user_id) : null;
        
        const meme = await Meme.findById(req.params.meme_id).populate('user');
        res.status(200).json({ meme: meme, token: token });
    }
    catch(err) {
        console.error(err);
        res.status(400).json({ message: "Couldn't find meme", token: token });
    }
}

async function createMeme(req, res) {

    let token;

    try {

        token = generateToken(req.user_id);

        const image = req.file;

        if (!image) {
            throw "No image provided";
        }

        const tags = req.body.tags.split(",").map((tag) => tag.toLowerCase().trim());

        const meme = new Meme({
            img: (image) ? image.path : null,
            title: req.body.title,
            user: req.user_id,
            tags: tags,
            created_at: Date.now()
        });
        await meme.save();

        res.status(201).json({ message: "Meme saved", token: token, newMeme: meme });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ message: "Error creating meme", token: token });
    }
}

async function deleteMeme(req, res) {

    let token;

    try {

        token = generateToken(req.user_id);

        const meme = await Meme.findById(req.params.meme_id).populate('user');

        // check it's this user's meme
        if (meme.user.id != req.user_id) {
            res.status(401).json({ message: "Unable to delete another user's meme", token: token });
            return;
        }

        await fs.rm(meme.img);
        await Meme.findOneAndDelete( { _id: meme._id } );

        res.status(200).json({ message: "Meme deleted", token: token });
        return;

    }
    catch (err) {
        console.error(err);
        res.status(400).json({ message: "Error deleting meme", token: token });
        console.log("poop");
        return;
    }
}

async function getNextMeme(req, res) {
    let token;
    try {
        token = generateToken(req.user_id);
        const tags = req.query.tags?.split(",").map(tag => tag.trim().toLowerCase());

        let memes;
        if (tags && tags.length > 0) {
            memes = await Meme.aggregate([
                { $match: { tags: { $all: tags } } },
                { $sample: { size:1 } }
            ]);
        } else {
            memes = await Meme.aggregate([
                { $sample: { size: 1} }
            ])
        }

        const meme = memes[0];

        res.status(200).json({ meme: meme, token: token });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ message: "Error finding next meme", token: token });
    }
}

async function getMemesCreatedByUser(req, res) {

    let token;

    try {
        token = generateToken(req.user_id);
        const memes = await Meme.find({ user: req.params.user_id });

        res.status(200).json({ memes: memes, token: token });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ message: "Error finding memes for user", token: token });
    }

}

async function getMemesRatedByUser(req, res) {

    let token;

    try {

        token = generateToken(req.user_id);

        const memes = await Meme.aggregate([
            {
                $lookup: {
                    from: 'ratings',
                    localField: '_id',
                    foreignField: 'meme',
                    as: 'ratings'
                }
            },
            {
                $match: {
                    'ratings.user': new mongoose.Types.ObjectId(req.params.user_id)
                }
            },
        ]);

        res.status(200).json({ memes: memes, token: token });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ message: "Error finding memes", token: token });
    }

}

async function getMemesByTags(req, res) {

    let token;

    try {

        token = generateToken(req.user_id);

        const tags = req.params.tags.split(",");

        const memes = await Meme.find({
            tags: { $in: tags }
        });

        res.status(200).json({ memes: memes, token: token });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ message: "Error finding memes", token: token });
    }

}

async function getAllTags(req, res) {

    try {
        const tags = await Meme.distinct("tags");
        res.status(200).json({ tags: tags });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch tags"})
    }

}

async function getUserMemesRanked(req, res) {
    try {
        const token = generateToken(req.user_id);
        const order = req.query.order || 'recent';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Get total count first
        const totalMemes = await Meme.countDocuments({ 
            user: new mongoose.Types.ObjectId(req.params.user_id) 
        });
        
        const pipeline = [
            // Gets the user ID & gets all the rating stats for their memes
            { $match: { user: new mongoose.Types.ObjectId(req.params.user_id) }},
            { $lookup: {
                from: 'ratings',
                localField: '_id', 
                foreignField: 'meme',
                as: 'ratings'
            }},
            { $addFields: {
                averageRating: { 
                    $cond: {
                        if: { $gt: [{ $size: "$ratings" }, 0] },
                        then: { $round: [{ $avg: "$ratings.rating" }, 1] },
                        else: 0
                    }
                },
                totalRatings: { $size: "$ratings" }
            }},
            // Orders the returning data
            { $sort: order === 'rating' 
                ? { averageRating: -1, created_at: -1 }
                : { created_at: -1 }
            },
            { $skip: skip },
            { $limit: limit }
        ];

        const memes = await Meme.aggregate(pipeline);
        
        // Calculate pagination info
        const totalPages = Math.ceil(totalMemes / limit);
        
        res.status(200).json({ 
            memes: memes, 
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalMemes: totalMemes,
                limit: limit
            },
            token: token 
        });
        
    } catch (error) {
        console.error('Error getting ranked memes:', error);
        res.status(400).json({ message: "Error finding ranked memes", token: generateToken(req.user_id) });
    }
}

const MemesController = {
    getAllMemes: getAllMemes,
    getMemeByID: getMemeByID,
    createMeme, createMeme,
    deleteMeme, deleteMeme,
    getNextMeme, getNextMeme,
    getMemesCreatedByUser, getMemesCreatedByUser,
    getMemesRatedByUser, getMemesRatedByUser,
    getMemesByTags, getMemesByTags,
    getAllTags, getAllTags,
    getUserMemesRanked: getUserMemesRanked
};

module.exports = MemesController;