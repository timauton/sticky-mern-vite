const express = require("express");
const router = express.Router();

const RatingsController = require("../controllers/ratings");
const tokenChecker = require("../middleware/tokenChecker");

// Routes
// Create & Update rating
router.post("/", tokenChecker, RatingsController.createOrUpdateRating);

// Delete rating
router.delete("/:ratingId", tokenChecker, RatingsController.deleteRating);

// Read rating operations
// Stats: average, breakdown and total ratings for a meme
router.get("/meme/:memeId/stats", tokenChecker, RatingsController.getMemeStats);
// Current user's rating: returns rating for a single meme
router.get("/meme/:memeId/current", tokenChecker, RatingsController.getCurrentUserRating);
// Gets memes that the user has rated, ordered by date rated or stars given
router.get("/user/:user_id/ranked", tokenChecker, RatingsController.getUserRatingsRanked);

module.exports = router;