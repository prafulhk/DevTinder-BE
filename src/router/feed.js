const express = require("express");
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");
const feedRouter = express.Router();

//get data from database
feedRouter.get("/feed", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user
        const users = await User.find({ "_id": { "$nin": loggedInUser._id } });
        res.json({ data: users });
    }
    catch {
        res.status(400).send("something went wrong")
    }
});


module.exports = feedRouter;