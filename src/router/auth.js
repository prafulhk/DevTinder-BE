const express = require("express");
const User = require("../models/user");
const bcrypt = require('bcrypt');
const { validateSignupData } = require("../utils/validator");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");

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
    console.log(req.body);
    if(req.body.emailId && req.body.password) {
        const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
        res.status(404).json("Email is not present in DB");
    }
    let isPasswordValid;
    if(password && user?.password){
        isPasswordValid = await bcrypt.compare(password, user?.password);
    }
    if (!isPasswordValid) {
        res.status(404).json("Invalid credentials");
    }
    else {
        const token = await jwt.sign({_id:user.id},"secretkey");
        res.cookie("token", token);
        res.send("Logged in successfully")
    }
    }
    else{
        res.status(404).json("Invalid payload");
    }

});

authRouter.post("/logout", async (req, res) => {
    req.cookies("token", null);
    res.send("Logged out successfully");
}
);

module.exports = authRouter;