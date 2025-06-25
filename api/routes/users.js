const express = require("express");
const tokenChecker = require("../middleware/tokenChecker");

const router = express.Router();

const { 
    registerUser, 
    login,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserActivity,
    getUserTagRankings
} = require("../controllers/users");

//authorization
router.post("/registerUser", registerUser);
router.post("/login", login);

//our CRUDs
router.get("/", tokenChecker, getAllUsers); // gets all users
router.get("/:id", tokenChecker, getUserById); // gets users by id
router.put("/:id", tokenChecker, updateUser); // puts users by id
router.delete("/:id", tokenChecker, deleteUser); //deletes user by id

// GETs user activity: returns ratings and memes over time as an array
router.get("/:user_id/activity", tokenChecker, getUserActivity);

// GETs user ranking for a tag
router.get("/:user_id/tag-rankings", tokenChecker, getUserTagRankings);

module.exports = router;
