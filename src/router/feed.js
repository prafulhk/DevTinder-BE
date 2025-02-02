const express = require("express");
const User = require("../models/user");
const feedRouter = express.Router();

//get data from database
feedRouter.get("/feed", async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    }
    catch {
        res.status(400).send("something went wrong")
    }
});


module.exports = feedRouter;