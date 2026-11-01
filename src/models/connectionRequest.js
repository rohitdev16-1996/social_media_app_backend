const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
    {
        fromUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        toUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            enum: {
                values: ["ignored", "interested", "accepted", "rejected"],
                message: `{VALUE} is incorrect status type`
            }
        },
    },
    {
        timestamps: true,
    }
);

/* Corner Case 4: User should not be allowed to send the request to themselves */
connectionRequestSchema.pre("save", function (next) {

    const connectionRequest = this;

    if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        throw new Error("Cannot send connection request to yourself");
    }

    /* Remember to call next() to proceed with the save operation */
    next();
});

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

const ConnectionRequestModel = mongoose.model("ConnectionRequest", connectionRequestSchema);

module.exports = {
    ConnectionRequest: ConnectionRequestModel
};