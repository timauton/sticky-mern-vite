const express = require("express");
const router = express.Router();

const tokenChecker = require("../middleware/tokenChecker")

const {
    createComment, 
    getAllComments, 
    getCommentsByMeme, 
    getCommentsById, 
    updateComment, 
    deleteComment,
} = require ("../controllers/comments");

// CRUDs:
// Create comment:
router.post("/",tokenChecker, createComment);
// Get all comments:
router.get("/", tokenChecker, getAllComments);
// Get all comments by specific meme:
router.get("/meme/:meme_id", tokenChecker, getCommentsByMeme);
// Get a comment by it's ID:
router.get("/:id", tokenChecker, getCommentsById);
// Update comment:
router.put("/:id", tokenChecker, updateComment);
// Delete comment:
router.delete("/:id", tokenChecker, deleteComment);

module.exports = router;