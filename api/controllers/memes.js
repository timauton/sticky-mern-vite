const Meme = require("../models/meme");
const User = require("../models/user");
const Rating = require("../models/rating");
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
        token = generateToken(req.user_id);
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
        console.log("---- getNextMeme ----");
        if (tags && tags.length > 0) {
            console.log("Getting memes with tags: " + tags);
            memes = await getMemesWithTags(tags);
        } else {
            console.log("Getting a random unrated meme");
            memes = await getRandomUnratedMeme(req.user_id);
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

async function getMemesWithTags(tags) {
    const memes = await Meme.aggregate([
        { $match: { tags: { $all: tags } } },
        { $sample: { size:1 } }
    ]);
    return memes;
}

async function getRandomUnratedMeme(user_id) {

    const tag = await getNextRandomMemeTag(user_id);

    console.log("Filtering to tag: " + tag);

    // we need to construct different pipelines depending on what we're looking for
    // we start with finding unrated ones
    const unratedPartialPipeline = [
        // match with the Ratings schema
        { $lookup: {
                from: 'ratings',
                localField: '_id',
                foreignField: 'meme',
                as: 'ratings'
            }
        },
        // exclude the ones this user has rated
        { $match: {
                'ratings.user': {
                    $ne: new mongoose.Types.ObjectId(user_id)
                }
            }
        },
    ];

    // construct the pipeline
    // we may or may not need the tag filter,
    // depending on what the algo suggested
    let pipeline = [...unratedPartialPipeline]; //. this syntax is so we create a copy, not a reference
    if (tag) {
        pipeline.push({ $match: { tags: tag } });
    }
    pipeline.push({ $sample: { size: 1 } });

    // run the query
    let memes = await Meme.aggregate(pipeline);

    // did we get a result?
    if (memes.length == 0) {
        console.log("There are no unrated memes with that tag, going for a completely random unrated meme");
        // construct the pipeline without the tag filter
        pipeline = [...unratedPartialPipeline];
        pipeline.push({ $sample: { size: 1 } });
        memes = await Meme.aggregate(pipeline);
    }

    // make sure again that we have a result
    if (memes.length == 0) {
        console.log("They've rated every single meme! Just pick one at random");
        memes = await Meme.aggregate([
            // pick one at random
            { $sample: { size:1 } }
        ]);
    }

    return memes;
}

async function getNextRandomMemeTag(user_id) {

    // we add up all the ratings to get a total rating score
    // then we add 20% to ensure a user doesn't always see the same memes
    // then we pick a random number between 0 and the total score
    // we work through the array starting at the highest rating and stop
    // when we get to the random number

    // Eg. a user has rated cats 5* and programming 1*
    // Total number will be ( 5 + 1 ) * 1.2 = 7.2
    // 3 would be cats
    // 5.5 would be programming
    // 6.4 would be random

    // I have no idea how well this works in practice, but it does bias
    // results towards the memes users like

    // 1.25 here would give a 20% chance of totally random meme
    const randomUnratedTagMultiplier = 1.25;

    let totalRating = 0;
    const ratedTags = await getRatedTags(user_id);

    ratedTags.forEach((tag) => totalRating += tag.avg );

    tagPickNumber = Math.random() * totalRating * randomUnratedTagMultiplier;

    console.log("Pick number is: " + tagPickNumber);
    console.log("Total rating is: " + totalRating);

    let nextTag = "";

    // step through and set the tag if we get a match
    for (const tag of ratedTags) {
        tagPickNumber -= tag.avg;
        if (tagPickNumber < 0) {
            nextTag = tag._id;
            break;
        }
    }

    return nextTag;
}

async function getRatedTags(user_id) {

    const tags = await Rating.aggregate([

        // filter to just the user's ratings
        { $match: {"user": new mongoose.Types.ObjectId(user_id) } },
        // match with the meme schema
        { $lookup: {
                from: 'memes',
                localField: 'meme',
                foreignField: '_id',
                as: 'meme'
            }
        },
        // unwind to expand out so we get one row per meme+tag
        { $unwind: "$meme" },
        { $unwind: "$meme.tags" },
        // project so we only get the fields we want
        { $project: {
                tag: "$meme.tags",
                rating: "$rating"
            }
        },
        // group by tag and do the maths
        { $group: {
                _id: "$tag",
                count: { $count: {} },
                avg: { $avg: "$rating" }
            }
        }
    ]);

    console.log(tags);

    return tags;
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
    getAllTags, getAllTags
};

module.exports = MemesController;