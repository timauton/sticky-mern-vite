const express = require("express");
const router = express.Router();

const tokenChecker = require("../middleware/tokenChecker")
const MemesController = require("../controllers/memes");
const { uploadConfigs, handleUploadError } = require("../middleware/uploadMiddleware");

router.get("/", MemesController.getAllMemes);
router.get("/next", tokenChecker, MemesController.getNextMeme);
router.get("/:meme_id", tokenChecker, MemesController.getMemeByID);
router.get("/user/:user_id", tokenChecker, MemesController.getMemesCreatedByUser);
router.post("/", tokenChecker, uploadConfigs.memes.single("image"), handleUploadError, MemesController.createMeme);
router.delete("/:meme_id", tokenChecker, MemesController.deleteMeme);
//router.get("/random", MemesController.getRandomMemes);
//router.get("/user/:user_id", MemesController.getMemesForUser);

module.exports = router;