const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/user");
const Connections = require("../models/connections");
const { userAuth } = require("../middlewares/auth");
const userRouter = express.Router();
const USER_SAFE_DATA = "firstName lastName email";
//get single user
userRouter.get("/user/profile", async (req, res) => {
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

userRouter.get("/userById/profile", async (req, res) => {
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

userRouter.delete("/user/profile/delete", async (req, res) => {
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

userRouter.patch("/user/profile/update", async (req, res) => {
    const { userId, ...updateData } = req.body;
    try {
        const user = await User.findByIdAndUpdate(userId, { firstName: updateData.firstName, lastName: updateData.lastName }, { new: true });
        if (user) {
            res.json({
                message: "user updated successfully",
                data: user
            });
        }
        else {
            res.status(400).send("No records found");
        }
    }
    catch {
        res.status(400).send("something went wrong")
    }
});

userRouter.get("/user/request/recieved", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const objectId = new mongoose.Types.ObjectId(loggedInUser._id);

        const user = await User.find({
            _id: objectId,
        });
        console.log("user:", user);

        const connectionRequestsCollection = await Connections.find({});
        console.log("connectionRequestsCollection:", connectionRequestsCollection);

        const connectionRequests1 = await Connections.find({
            status: "interested",
            toUserId: loggedInUser._id.toString()
        });
        console.log("connectionRequests1:", connectionRequests1);


        res.json({
            message: "Data fetched successfully",
            data: connectionRequests1,
        });
    } catch (err) {
        req.statusCode(400).send("ERROR: " + err.message);
    }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequests = await Connections.find({
            $or: [
                { toUserId: loggedInUser._id, status: "accepted" },
                { fromUserId: loggedInUser._id, status: "accepted" },
            ],
        })
            .populate("fromUserId", USER_SAFE_DATA)
            .populate("toUserId", USER_SAFE_DATA);

        console.log(connectionRequests);

        const data = connectionRequests.map((row) => {
            console.log(row);
            console.log(loggedInUser)
            if (row.fromUserId.toString() === loggedInUser._id.toString()) {
                return row.toUserId;
            }
            return row.fromUserId;
        });

        res.json({ data });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

userRouter.post("/request/send/:status/:toUserId",
    userAuth,
    async (req, res) => {
        try {
            const fromUserId = req.user._id;
            const toUserId = req.params.toUserId;
            const status = req.params.status;

            const allowedStatus = ["ignored", "interested"];
            if (!allowedStatus.includes(status)) {
                return res
                    .status(400)
                    .json({ message: "Invalid status type: " + status });
            }

            const toUser = await User.findById(toUserId);
            if (!toUser) {
                return res.status(404).json({ message: "User not found!" });
            }

            const existingConnectionRequest = await Connections.findOne({
                $or: [
                    { fromUserId, toUserId },
                    { fromUserId: toUserId, toUserId: fromUserId },
                ],
            });
            if (existingConnectionRequest) {
                return res
                    .status(400)
                    .send({ message: "Connection Request Already Exists!!" });
            }

            const connectionRequest = new Connections({
                fromUserId,
                toUserId,
                status,
            });

            const data = await connectionRequest.save();

            res.json({
                message:
                    req.user.firstName + " is " + status + " in " + toUser.firstName,
                data,
            });
        } catch (err) {
            res.status(400).send("ERROR: " + err.message);
        }
    }
);

userRouter.post(
    "/request/review/:status/:requestId",
    userAuth,
    async (req, res) => {
        try {
            const loggedInUser = req.user;
            const { status, requestId } = req.params;

            const allowedStatus = ["accepted", "rejected"];
            if (!allowedStatus.includes(status)) {
                return res.status(400).json({ messaage: "Status not allowed!" });
            }

            const connectionRequest = await Connections.findOne({
                _id: requestId,
                toUserId: loggedInUser._id,
                status: "interested",
            });
            if (!connectionRequest) {
                return res
                    .status(404)
                    .json({ message: "Connection request not found" });
            }

            connectionRequest.status = status;

            const data = await connectionRequest.save();

            res.json({ message: "Connection request " + status, data });
        } catch (err) {
            res.status(400).send("ERROR: " + err.message);
        }
    }
);


module.exports = userRouter;