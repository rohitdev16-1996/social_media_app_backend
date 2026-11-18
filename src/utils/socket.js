const socket = require("socket.io");

const crypto = require("crypto");

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
    socket.on("sendMessage", ({ firstName, userId, targetUserId, text }) => {
      /* const roomId = [userId, targetUserId].sort().join("_"); */
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " " + text);
      io.to(roomId).emit("messageReceived", { firstName, text });
    });

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
