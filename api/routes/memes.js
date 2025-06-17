const express = require("express");
const router = express.Router();

const MemesController = require("../controllers/memes");

router.get("/", MemesController.getAllMemes);
router.get("/id/:meme_id", MemesController.getMemeByID);
//router.get("/random", MemesController.getRandomMemes);
//router.get("/user/:user_id", MemesController.getMemesForUser);

module.exports = router;