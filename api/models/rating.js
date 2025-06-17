const mongoose = require('mongoose');

// A Schema defines the "shape" of entries in a collection. This is similar to
// defining the columns of an SQL Database.
const RatingSchema = new mongoose.Schema(
    {
        meme: {
            type: mongoose.Schema.Types.ObjectId,
            // meme model name
            ref: 'Meme', 
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            // user model name
            ref: 'User',
            required: true
        }, 
        rating: {
            type: Number,
            required: true,
            // minimum rating
            min: 1,
            // maximum rating
            max: 5
        } 
    },
    {

        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
    );

// Ensure one rating per user per meme
RatingSchema.index({ meme: 1, user: 1 }, { unique: true });

// We use the Schema to create the Rating model. Models are classes which we can
// use to construct entries in our Database.
const Rating = mongoose.model('Rating', RatingSchema);


module.exports = Rating;
