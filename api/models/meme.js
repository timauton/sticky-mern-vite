const mongoose = require("mongoose");

const MemeSchema = new mongoose.Schema({
    img: String,
    title: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    created_at: Date,
});

//TODO: Uncomment the virtual fields when we implement these schemas
/*

MemeSchema.virtual('rating', {
    ref: 'Tag',
    localField: '_id',
    foreignField: 'meme_id'
});

MemeSchema.virtual('tags', {
    ref: 'Tag',
    localField: '_id',
    foreignField: 'meme_id'
});

MemeSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'meme_id'
});
*/

const Meme = mongoose.model("Meme", MemeSchema);

module.exports = Meme;