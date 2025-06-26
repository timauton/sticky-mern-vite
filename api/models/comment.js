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
            ref: "Meme",
            required: [true],
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true],
        }
    },{
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;