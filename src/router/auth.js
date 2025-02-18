const express = require("express");
const User = require("../models/user");
const bcrypt = require('bcrypt');
const { validateSignupData } = require("../utils/validator");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const { userAuth } = require("../middlewares/auth");

authRouter.post("/signup", async (req, res) => {
    try {
        const { firstName, lastName, emailId, password } = req.body;
        const passwordHash = await bcrypt.hash(password, 3);
        const user = new User({
            firstName: firstName,
            lastName: lastName,
            emailId: emailId,
            password: passwordHash
        });
        await user.save();
        res.send("user " + user.firstName + " added successfully")
    }
    catch (error) {
        res.status(400).send(error?.errorResponse?.errmsg);
    }
});

authRouter.post("/login", async (req, res) => {
    if (req.body.emailId && req.body.password) {
        const { emailId, password } = req.body;

        const user = await User.findOne({ emailId: emailId });
        if (!user) {
            return res.status(404).json({
                message: "Email is not present in DB",
                data: req.body
            });
        }
        let isPasswordValid;
        if (password && user?.password) {
            isPasswordValid = await bcrypt.compare(password, user?.password);
        }
        if (!isPasswordValid) {
            return res.status(404).json({
                message: "Invalid credentials",
                data: req.body
            });
        }
        else {
            const token = await jwt.sign({ _id: user.id }, "secretkey");
            res.cookie("token", token);
            return res.json({
                message: "Logged in successfully",
                data: user
            })
        }
    }
    else {
        return res.status(404).json({
            message: "Invalid payload",
            data: req.body
        });
    }

});

authRouter.post("/logout", async (req, res) => {
    const { emailId } = req.body;
    const user = await User.findOne({ emailId: emailId });
    res.cookie("token", null);
    res.json({
        message: "Logged out successfully",
        data: user
    })
}
);

module.exports = authRouter;