const express = require("express");

const router = express.Router();

const { 
    registerUser, 
    login,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
} = require("../controllers/users");

//authorization
router.post("/registerUser", registerUser);
router.post("/login", login);

//our CRUDs
router.get("/", getAllUsers); // gets all users
router.get("/:id", getUserById); // gets users by id
router.put("/:id", updateUser); // puts users by id
router.delete("/:id", deleteUser); //deletes user by id

module.exports = router;
