const socket = require("socket.io");

const crypto = require("crypto");
const { Chat } = require("../models/chat");
const { timeStamp } = require("console");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  /* Add the io like cors */
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    /* Print the token */
    console.log(socket.handshake.auth);

    /* Handle Events */
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      /* Unique Id */
      /* const roomId = [userId, targetUserId].sort().join("_"); */
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " joined Room : " + roomId);
      socket.join(roomId);
    });

    /* Received message from the frontend and broadcast it to the room */
    socket.on(
      "sendMessage",
      async ({ firstName, userId, targetUserId, text }) => {
        /* Save messages to the database */
        try {
          /* const roomId = [userId, targetUserId].sort().join("_"); */
          const roomId = getSecretRoomId(userId, targetUserId);
          console.log(firstName + " " + text);

          /* Find the chat with the participants */
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          /* If chat does not exists in the database */
          if (!chat) {
            /* Create a new Chat record */
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          /* Push the chat in the records, because now the chat is present anyways */
          chat.messages.push({
            senderId: userId,
            text,
          });

          /* Save the chat to the database */
          await chat.save();

          /* Send the chat to the web socket room */
          io.to(roomId).emit("messageReceived", {
            firstName,
            text,
            timeStamp: new Date(),
          });
        } catch (err) {
          console.log(err);
        }
      },
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
