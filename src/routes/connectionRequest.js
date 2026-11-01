const express = require("express");
const connectionRequestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");

connectionRequestRouter.post("/sendConnectionRequest", userAuth, async (req, res) => {
  const user = req.user;
  res.send(user.firstName + " sent the connection request");
});

module.exports = connectionRequestRouter;

