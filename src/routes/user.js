const express = require("express");
const userRouter = express.Router();

const userObj = require("../middlewares/auth");
const userAuth = userObj.userAuth;

const { ConnectionRequest } = require("../models/connectionRequest");

/* Get all the pending connection requests received by the Logged-in User */
userRouter.get("/user/requests", userAuth, async (req, res) => {
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

module.exports = userRouter;

