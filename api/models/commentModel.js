const mongoose = require("mongoose");

// A Schema defines the "shape" of entries in a collection. This is similar to
// defining the columns of an SQL Database.

const CommentSchema = new mongoose.Schema({
    comment: { 
        type: String, 
        required: [false, "✏️ Add a comment if you like! ✏️"], 
        trim: true, 
        maxlength: 300,
    },
    meme_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Our meme",
        required: [true],
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Username",
        required: [true],
    },
});

const CommentsController = mongoose.model('CommentsController', CommentSchema);

module.exports = CommentsController;