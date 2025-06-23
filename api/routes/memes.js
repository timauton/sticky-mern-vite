const express = require("express");
const router = express.Router();

const tokenChecker = require("../middleware/tokenChecker")
const MemesController = require("../controllers/memes");
const { uploadConfigs, handleUploadError } = require("../middleware/uploadMiddleware");

// gets all memes in the database (you probably don't want this!), returns an array of memes
router.get("/", MemesController.getAllMemes);

// gets the next meme that is relevant for the user, returns one meme
// exactly whcih meme you get will be decided by The Algorithm™
router.get("/next", tokenChecker, MemesController.getNextMeme);

// gets a particular meme using the _id, returns one meme
router.get("/:meme_id", tokenChecker, MemesController.getMemeByID);

// gets all memes where the user matches the user_id param in the URL
// does NOT use the req.user_id so you can view memes for other users
// returns an array of memes
router.get("/user/:user_id", tokenChecker, MemesController.getMemesCreatedByUser);

// gets all memes with a rating by the user_id param in the URL
// does NOT use the req.user_id so you can view memes for other users
// returns an array of memes
router.get("/rated_by_user/:user_id", tokenChecker, MemesController.getMemesRatedByUser);

// gets all memes matching any of the comma-separated list of tags
// e.g. /memes/tagged/tag1,tag2
// returns an array of memes
router.get("/tagged/:tags", tokenChecker, MemesController.getMemesByTags);

// post a new meme, including the image
router.post("/", tokenChecker, uploadConfigs.memes.single("image"), handleUploadError, MemesController.createMeme);

// deletes a meme and deletes the file from the uploads fodler
router.delete("/:meme_id", tokenChecker, MemesController.deleteMeme);

module.exports = router;