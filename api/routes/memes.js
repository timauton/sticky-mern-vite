const express = require("express");
const router = express.Router();

const MemesController = require("../controllers/memes");

router.get("/", MemesController.getMemes);

module.exports = router;