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
// Stats: 
router.get("/meme/:memeId/stats", tokenChecker, RatingsController.getMemeStats);
// Current user's rating
router.get("/meme/:memeId/current", tokenChecker, RatingsController.getCurrentUserRating);

module.exports = router;