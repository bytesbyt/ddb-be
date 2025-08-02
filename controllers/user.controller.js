const User = require("../models/User");
const bcrypt = require("bcryptjs");

const userController = {}

userController.createUser = async (req, res) => {
    try {
        let { email, password, name, level } = req.body;
        const user = await User.findOne({email})
        if(user) {
            throw new Error("User already exists");
        }
        const salt = await bcrypt.genSaltSync(10);
        password = await bcrypt.hash(password, salt);
        const newUser = new User({email, password, name, level: level?level:"customer"})
        await newUser.save();
        return res.status(201).json({
            status: "success",
            message: "User created successfully",
        })
    } catch (error) {
        res.status(400).json({
            staus: "fail",
            error: error.message,
        })
    }
}

module.exports = userController;