const mongoose = require("mongoose");
const { Schema } = mongoose;

const connectionsSchema = new Schema(
    {
        fromUserId: {
            type: String,
            required: true,
        },
        toUserId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: {
                values: ["ignored", "interested", "accepted", "rejected"],
                message: `{VALUE} is incorrect status type`,
            },
        },
    },
    { timestamps: true }
);

const connectionsModel = mongoose.model('connections', connectionsSchema);

module.exports = connectionsModel;