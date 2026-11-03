const express = require("express");
const connectionRequestRouter = express.Router();
const userObj = require("../middlewares/auth");
const userAuth = userObj.userAuth;
const { ConnectionRequest } = require("../models/connectionRequest");
const { User } = require("../models/user");

/* Send Connection Request */
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
      res.status(400).json({ message: "Error sending connection request : " + err.message });
    }
  });

/* Review Connection Request */
connectionRequestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const status = req.params.status;
      const requestId = req.params.requestId;

      /* Check 2 : Status passed should be accepted or rejected */
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status type: " + status });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        /* Check 3: Status should be "interested" of the request */
        status: "interested",

        /* Check 4: toUserId should match the logged-in userId */
        toUserId: loggedInUser._id,

        /* Check 5: Request should exist */
        _id: requestId,
      });

      if (!connectionRequest) {
        return res.
          status(404).
          json({ message: "Invalid request" });
      }

      /* Update the status of the connection request */
      connectionRequest.status = status;

      /* Save the updated connection request */
      const data = await connectionRequest.save();

      /* Send the updated connection request in the response */
      res.json({
        message: `Connection request ${status} successfully`,
        data
      });

    } catch (err) {
      res.status(400).json({ message: "ERROR :" + err.message });
    }
  });

module.exports = connectionRequestRouter;
