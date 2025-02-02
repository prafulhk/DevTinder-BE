const express = require("express");
const User = require("../models/user");
const userRouter = express.Router();

//get single user
userRouter.get("/user", async (req, res) => {
    try {
        console.log(req.cookies);
        const user = await User.find({});
        if (user.length > 0) {
            res.send(user);
        }
        else {
            res.status(400).send("No records found");
        }
    }
    catch {
        res.status(400).send("something went wrong")
    }
});

userRouter.get("/userById", async (req, res) => {
    try {
        const user = await User.findById(req.body.id);
        if (user) {
            res.send(user);
        }
        else {
            res.status(400).send("No records found");
        }
    }
    catch {
        res.status(400).send("something went wrong")
    }
});

userRouter.delete("/user", async (req, res) => {
    const userID = req.body.userId
    try {
        const user = await User.findByIdAndDelete(userID);
        if (user) {
            res.send("user deleted successfully");
        }
        else {
            res.status(400).send("No records found");
        }
    }
    catch {
        res.status(400).send("something went wrong")
    }
});

userRouter.patch("/user", async (req, res) => {
    const userID = req.body.userId
    try {
        const user = await User.findByIdAndUpdate(userID, { firstName: req.body.firstName });
        if (user) {
            res.send("user updated successfully");
        }
        else {
            res.status(400).send("No records found");
        }
    }
    catch {
        res.status(400).send("something went wrong")
    }
});

module.exports = userRouter;