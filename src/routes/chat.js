const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { Chat } = require("../models/chat");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const userId = req.user._id;

  /* Logged In User from userAuth */
  const { targetUserId } = req.params;

  try {
    let chat = await Chat.findOne({
      participants: {
        $all: [userId, targetUserId],
      },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });

    /* If no chat exists yet, create an empty one and return it */
    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }

    res.json(chat);
  } catch (err) {
    console.log("ERROR : " + err.message);
  }
});

module.exports = chatRouter;
