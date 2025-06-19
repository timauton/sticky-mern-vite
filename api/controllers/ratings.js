const Rating = require("../models/rating");
const { generateToken } = require("../lib/token");
const { default: mongoose } = require("mongoose");

const createOrUpdateRating = async (req, res) => {
  try {
    // Extracts data from the request body
    const { meme, rating } = req.body;
    const user = req.user_id;
    const query = { meme, user };

    // Validate input; creates temp document to trigger schema validation
    // This catches missing fields and invalid values (like a rating of 6)
    const tempRating = new Rating({ meme, user, rating });
    await tempRating.validate();

    // Checks if rating already exists
    // Creates if new rating or updates existing rating & runs schema validation
    const existingRating = await Rating.findOne(query);
    const updatedRating = await Rating.findOneAndUpdate(
      query,                               
      { rating },
      { new: true, upsert: true, runValidators: true }
    );

    const newToken = generateToken(user);
    const status = existingRating ? 200 : 201;
    
    res.status(status).json({ rating: updatedRating, token: newToken });

  } catch (error) {
    // Missing fields or rating out of bounds
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: "Invalid data", 
        details: error.message 
      });
    }

    // Rating already exists
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: "Rating already exists" 
      });
    }

    // Generic server error
    console.error('Unexpected error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const deleteRating = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.ratingId)

    // Checks ratingId exists
    if (!rating) {
      return res.status(404).json({error: "Rating not found"})
    }
    // Checks that logged in user matches user id of rating 
    if (rating.user.equals(req.user_id)) {
      await Rating.deleteOne({ _id: req.params.ratingId});
      const newToken = generateToken(req.user_id);

      res
        .status(200)
        .json({ message: "Rating deleted", token: newToken});
    } else {
      res
        .status(403)
        .json({ error: "Cannot delete another user's rating" })
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: "Unable to delete rating"})
  }
}

// Gets logged in user's rating for a meme, returns null if not rated yet
const getCurrentUserRating = async (req, res) => {
  try {
    if (!req.user_id) {
      return res.status(401).json({ error: "Authentication required" });}

    const rating = await Rating.findOne({
      meme: req.params.memeId,
      user: req.user_id
    });

    const token = generateToken(req.user_id);

    res
      .status(200)
      .json({  
        rating: rating ? rating.rating : null, 
        token: token });
  } catch (error) {
    // Incorrect memeId format
    if (error.name === 'CastError') {
      return res.status(400).json({ error: "Invalid meme ID format"});
    }
    // Unexpected errors
    console.error('Unexpected error: ', error);
    res.status(500).json({ error: "Unable to get rating"})
  }
}

// Gets stats for a particular meme
    const getMemeStats = async (req, res) => {
      try {
        const { memeId } = req.params;
      
        // Checks meme ID is valid
        if (!mongoose.Types.ObjectId.isValid(memeId)) {
          return res.status(400).json({ error: "Invalid meme ID format" });
        }   

        const stats = await Rating.aggregate([
          { $match: { meme: new mongoose.Types.ObjectId(memeId) }},
          { $group: {
            _id: null,
            averageRating: { $avg: "$rating"},
            totalRatings: { $sum: 1 },
            // Rating breakdown
            fiveStars: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] }},
            fourStars: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] }},
            threeStars: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] }},
            twoStars: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] }},
            oneStars: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] }}
          }},
          {
            $addFields: {
              averageRating: { $round: ["$averageRating", 1]},
              ratingBreakdown: {
              "5": "$fiveStars",
              "4": "$fourStars", 
              "3": "$threeStars",
              "2": "$twoStars",
              "1": "$oneStars"
            }
          }
          },
          {
            // Selects fields to return in message. 1 means should be included. 0 is excluded.
            $project: {
              averageRating: 1,
              totalRatings: 1,
              ratingBreakdown: 1,
            }
          }
        ]);

        // 0 means no data yet rather than actually zero!
        res.status(200).json(stats[0] || {
          averageRating: 0,
          totalRatings: 0,
          ratingBreakdown: { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 }
        })
      } catch (error) {
      console.error('Unexpected error: ', error);
      res.status(500).json({ error: "Unable to get stats for this meme"})
    }
  };

const RatingsController = {
  createOrUpdateRating,
  deleteRating,
  getCurrentUserRating,
  getMemeStats,
};


module.exports = RatingsController;