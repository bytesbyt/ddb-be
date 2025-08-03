const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.post("/", userController.createUser);
router.get("/me", authController.authenticate, userController.getUser); //checking if the token is valid first (middleware)


module.exports = router;