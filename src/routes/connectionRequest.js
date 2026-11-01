const express = require("express");
const connectionRequestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { ConnectionRequest } = require("../models/connectionRequest");

connectionRequestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      /* Corner Case 1: Invalid status type */
      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status type: " + status });
      }

      /* Corner Case 3: User is trying to send request to a user which does not exist */
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: "User not found" });
      }

      /* Corner Case 2: User should not be allowed to send the request again to the same user,
                        It should also not be allowed to send the request if the other user has
                        already sent a request to the current user.
      */
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId: fromUserId, toUserId: toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        return res.status(400).send({ message: "Connection request already exists" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status: status,
      });

      const data = await connectionRequest.save();

      /* Make the response message more dynamic */
      const message =
        status == "ignored"
          ? `${req.user.firstName} ignored ${toUser.firstName}`
          : `${req.user.firstName} is interested in ${toUser.firstName}`;

      res.json({
        message,
        data
      });

    }
    catch (err) {
      res.status(400).json({ message: "Error sending connection request" });
    }
  });

module.exports = connectionRequestRouter;
