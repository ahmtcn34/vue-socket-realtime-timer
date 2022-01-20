const express = require("express");
const cors = require("cors");
const http = require("http");
const internal = require("stream");
const app = express();

const server = http.createServer(app);
app.use(cors());

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
  },
});
const port = 5000;
const rooms = new Map();
let timerBackend = {
  second: 0,
  minute: 0,
  hour: 0,
};
let isStart = false;
server.listen(port, () => {
  // console.log(`Example app listening at http://localhost:${port}`);
});
io.on("connection", (socket) => {
  let roomID;
  function joinRoom(room) {
    socket.join(room);
    roomID = room;
    socket.emit("JOINED_ROOM", room);
  }

  socket.on("JOIN_ROOM", ({ room, pass }) => {
    // You're already in this room:
    if (room === roomID) {
      return;
    }
    if (!rooms.has(room)) {
      rooms.set(room, pass);
      joinRoom(room);
      return;
    }
    if (rooms.get(room) === pass) {
      joinRoom(room);
    } else {
      if (rooms.get(room) && !pass) {
        socket.emit("requestPassword");
      }
      socket.emit(
        "joinFailed",
        pass ? "The password is incorrect" : "This room requires a password"
      );
    }
  });
  socket.on("setInterval", (data) => {
    if (!roomID) {
      return;
    }
    io.sockets.in(roomID).emit("updateInterval", data);
  });
  socket.on("isStartTimer", (data) => {
    if (!roomID) {
      return;
    }
    io.sockets.in(roomID).emit("update", data);
    isStart = true;
  });
  socket.on("isStopTimer", (data) => {
    if (!roomID) {
      return;
    }
    io.sockets.in(roomID).emit("update", data);
    io.sockets.in(roomID).emit("stopInterval", data);
    isStart = false;
  });
  socket.on("updateTimer", (timer) => {
    timer = timer;
    io.sockets.in(roomID).emit("startTimerUpdate", { time: timer });
    io.sockets.in(roomID).emit("isStartTimer", isStart);
  });
  socket.on("updateTimer", (timer) => {
    timerBackend = timer;
    io.sockets.in(roomID).emit("startTimerUpdate", { time: timer });
    io.sockets.in(roomID).emit("isStartTimer", isStart);
  });
  socket.on("initValue", () => {
    io.sockets.in(roomID).emit("initValueUpdate", timerBackend);
  });
  socket.on("CREATE_ROOM", ({ room, pass }) => {
    if (rooms.has(room)) {
      socket.emit("createFailed", "A room with that code already exists.");
    } else {
      rooms.set(room, pass);
      joinRoom(room);
      io.sockets.in(roomID).emit("createdRoom", room);
      socket.emit("JOINED_ROOM", room);
    }
  });
  socket.on("LEAVE_ROOM", ({ room, id }) => {
    socket.leave(room);
  });
  socket.on("disconnect", (socket) => {
    console.log(`${socket} disconnect!`);
  });
});
