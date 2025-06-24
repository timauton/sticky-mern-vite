const CommentsController = require("../models/commentModel");
const jwt = require("jsonwebtoken"); //creates tokens that keeps users logged in using jwts
const { populate } = require("../models/meme");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; //jwtcode reads from .env file and uses supersecret as a fallback 


// Creating a new comment:
const createComment = async (req,res) => {
    try {
        const {comment, meme_id} = req.body;
        const user_id = req.user_id;

        if (!comment || !meme_id || user_id) {
            return res.status(400).jason({ message: "🔓 Login to comment :D 🔓"});
        }
        const memeComment = await CommentsController.create({
            comment, meme_id, user_id
        });
        res.status(201).json({ message: "🚀 Comment added! 🚀", memeComment });
    }
    catch(error) {
        res.status(500).json({ message: "Server error :(", error });
    }
};

// Get all comments:
const getAllComments = async (req, res) => {
  try {
    const comments = await CommentsController.find()
        .populate("user_id", "username")
        .populate("meme_id", "title")
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error :(", error });
  }
};

// Get all comments for one meme:
const getCommentsByMeme = async (req,res) => {
    try {
        const {meme_id} = req.params;
        const comments = await CommentsController.find({meme_id})
            .populate("user_id", "username")
        res.status(200).json(comments);
    }   catch (error) {
        res.status(500).json({ message: "Server error :(", error});
    }
};

// Get comment(s) by user ID:
const getCommentsById = async (req,res) => {
    try {
        const comments = await CommentsController.findById(req.params.id)
            .populate("user_id", "username")
        if (!comments) return res.status(404).jason({message: "😭 You've added no comments to this meme. Go and write a comment! 🥳"});
        res.status(200).json(comments);
    }   catch (error) {
        res.status(500).json({ message: "Server error :(", error});
    }
};

// Update comments:
const updateComment = async (req, res) => {
  try {
    const { comments } = req.body;

    if (!comments) {
      return res.status(400).json({ message: "🥳 Go and write a comment if you like! 🥳" });
    }

    const comment = await CommentsController.findByIdAndUpdate(
      req.params.id,
      { comment },
      { new: false, runValidators: true }
    );

    if (!comment) return res.status(404).json({ message: "😭 You've added no comments to this meme. Go and write a comment! 🥳" });

    res.status(200).json({ message: "🚀 Comment added! 🚀", comment });
  } catch (error) {
    res.status(500).json({ message: "Server error :(", error });
  }
};

// Delete comment:
const deleteComment = async (req, res) => {
  try {
    const comment = await CommentsController.findByIdAndDelete(req.params.id);

    if (!comment) return res.status(404).json({ message: "😭 You've added no comments to this meme. Go and write a comment! 🥳" });

    res.status(200).json({ message: "💅 Comment deleted 💅" });
  } catch (error) {
    res.status(500).json({ message: "Server error :(", error });
  }
};

module.exports = { createComment, getAllComments, getCommentsByMeme, getCommentsById, updateComment, deleteComment}