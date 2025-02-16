const express = require("express");
const User = require("../models/user");
const Connections = require("../models/connections");
const { userAuth } = require("../middlewares/auth");
const connectionRequestRouter = express.Router();

connectionRequestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try {

        const fromUserId = req.user._id.toString();
        console.log("fromUserId:",fromUserId);
        const toUserId = req.params.toUserId;
        const status = req.params.status;;

        //validate teh request
        //1.stats invalid check-handled in model using enum
        //2.check user is present in DB or not
        //3.check is there any already existing connections 
        //if all passed then only save
        //here from user is logged in user
        const toUser = await User.findById(toUserId);
        console.log("toUSer:",toUser);
        const {firstName} = toUser;
        console.log("firstName",firstName)
        if (!toUser) {
            return res.status(404).json({ message: "user not found" });
        }

        const existingConnections = await Connections.findOne({
            $or: [
                { fromUserId, toUserId },
                {
                    fromUserId: toUserId,
                    toUserId: fromUserId
                }
            ]
        });

        if (existingConnections) {
            return res.status(404).json({ message: "you already sent connection request to " + firstName});
        }


        const connectionRequest = new Connections({
            fromUserId: fromUserId.toString(),
            toUserId: toUserId.toString(),
            status: status
        });
        const data = await connectionRequest.save();
        
         res.json({
            message: "connection request sent to " + firstName,
            data: data
        })


    }
    catch (error) {
        res.status(400).send(error?.errorResponse?.errmsg);
    }
});

module.exports = connectionRequestRouter;