const express = require("express");
const userRouter = express.Router();

const userObj = require("../middlewares/auth");
const userAuth = userObj.userAuth;

const { ConnectionRequest } = require("../models/connectionRequest");

const { User } = require("../models/user");

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

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

/* Get the feed of the API */
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    /* 0. Get the loggedInUser using the userAuth middleware */
    const loggedInUser = req.user;

    /* PAGINATION - Added Later */
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    /* 1. Find all the connection requests the user has sent or received. */
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id }, /* Request that Logged In user have sent */
        { toUserId: loggedInUser._id } /* Request that Logged In user have received. */
      ]
    }).select("fromUserId toUserId");

    /* 2. Collect the unique user IDs from those requests into a Set (these are the users to hide). */
    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    /* 3. Query the User collection for everyone not in that set and not loggedInUser. */
    /* PAGINATION added later */
    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },  /* Not In the hide list */
        { _id: { $ne: loggedInUser._id } },                /* and Not Equal to loggedInUser */
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.status(200).send(users);
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

module.exports = userRouter;
