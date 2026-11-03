const express = require("express");
const userRouter = express.Router();

const userObj = require("../middlewares/auth");
const userAuth = userObj.userAuth;

const { ConnectionRequest } = require("../models/connectionRequest");

/* Get all the pending connection requests received by the Logged-in User */
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest
      .find({
        toUserId: loggedInUser._id,
        /* Interested means the request is pending and not yet reviewed by the logged-in user */
        status: "interested",
      })
      .populate("fromUserId", "firstName lastName");

    res.json({
      message: "Connection requests received by the logged-in user",
      data: connectionRequests,
    });

  } catch (err) {
    res.status(400).send("Error :" + err.message);
  }
});

/* Get all the people connected to me */
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

    const connectionRequest = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" }
      ]
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionRequest.map((request) => {
      if (loggedInUser._id.toString() === request.fromUserId._id.toString()) {
        return request.toUserId;
      }
      return request.fromUserId;
    });

    res.json({
      message: "People connected to the logged-in user",
      data: data,
    });
  } catch (err) {
    res.status(400).send("Error :" + err.message);
  }
});

module.exports = userRouter;
