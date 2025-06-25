const Comment = require("../models/comment");
const jwt = require("jsonwebtoken"); //creates tokens that keeps users logged in using jwts
const { response } = require("../app");
const mongoose = require('mongoose');

const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; //jwtcode reads from .env file and uses supersecret as a fallback 


// Creating a new comment:
const createComment = async (req,res) => {
    try {
        const {comment, meme_id} = req.body;
        const user_id = req.user?.id || req.user_id || req.body.user_id;
        console.log("Creating comment for:", {
          user_id,
          meme_id,
          comment
        });

        if (!comment || !meme_id || !user_id) {
            return res.status(400).json({ message: "🔓 Login to comment :D 🔓"});
        }
        const newComment = await Comment.create({
            comment, 
            meme_id, 
            user_id
        });
        res.status(201).json({ message: "🚀 Comment added! 🚀", newComment });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Server error :(", error });
    }
};

// Get all comments:
const getAllComments = async (req, res) => {
  try {
    const commentAll = await Comment.find()
        .populate("user_id", "username")
        .populate("meme_id", "title")
    res.status(200).json(commentAll);
  } catch (error) {
    console.log("Error fetching comments:", error);
    res.status(500).json({ message: "Server error :(", error });
  }
};

// Get all comments for one meme:
const getCommentsByMeme = async (req,res) => {
    try {
        const commentMeme = await Comment.find({meme_id: req.params.meme_id})
            .populate("user_id", "username");
        res.status(200).json(commentMeme);
    } catch (error) {
        console.log("Error fetching comments for this meme:", error);
        res.status(500).json({ message: "Server error :(", error});
    }
};

// Get comment(s) by user ID:
const getCommentsById = async (req,res) => {
    try {
        const commentsForUsers = await Comment.findById(req.params.id)
            .populate("user_id", "username")
        if (!commentsForUsers) return res.status(404).json({message: "😭 You've added no comments to this meme. Go and write a comment! 🥳"});
        res.status(200).json(commentsForUsers);
    } catch (error) {
        console.log("Error getting this user's comments:", error);
        res.status(500).json({ message: "Server error :(", error});
    }
};

// Update comments:
const updateComment = async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({ message: "🥳 Go and write a comment if you like! 🥳" });
    }

    const commentUpdated = await Comment.findByIdAndUpdate(
      req.params.id,
      { comment },
      { new: true, runValidators: true }
    );

    if (!commentUpdated) 
      return res.status(404).json({ message: "😭 You've added no comments to this meme. Go and write a comment! 🥳" });

    res.status(200).json({ message: "🚀 Comment added! 🚀", comment: commentUpdated });
  } catch (error) {
      console.log("Error updating this comment:", error);
      res.status(500).json({ message: "Server error :(", error });
  }
};

// Delete comment:
const deleteComment = async (req, res) => {
  try {
    const commentDeleted = await Comment.findByIdAndDelete(req.params.id);

    if (!commentDeleted)
      return res.status(404).json({ message: "😭 No comment found." });

    res.status(200).json({ message: "💅 Comment deleted 💅" });
  } catch (error) {
    console.log("Error deleting this comment:", error);
    res.status(500).json({ message: "Server error :(", error });
  }
};

module.exports = { 
  createComment, 
  getAllComments, 
  getCommentsByMeme, 
  getCommentsById, 
  updateComment, 
  deleteComment 
}