const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const ratingsRouter = require("./routes/ratings")
const usersRouter = require("./routes/users");
const memesRouter = require("./routes/memes");
const authenticationRouter = require("./routes/authentication");
const commentsRouter = require("./routes/comments");
const tokenChecker = require("./middleware/tokenChecker");
const fs = require('fs')
const path = require('path')

const app = express();

// Allow requests from any client
// docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
// docs: https://expressjs.com/en/resources/middleware/cors.html
app.use(cors());

// Parse JSON request bodies, made available on `req.body`
app.use(bodyParser.json());

// API Routes
app.use("/users/registerUser", usersRouter);
app.use("/users/login", usersRouter);

app.use("/users", usersRouter);

app.use("/tokens", authenticationRouter);

const MemesController = require("./controllers/memes"); // bypasses token checker for this
app.get("/memes/tags", MemesController.getAllTags);

app.use("/memes", memesRouter);
app.use("/uploads", express.static("uploads"));

app.use("/ratings", tokenChecker, ratingsRouter);

app.use("/comments", tokenChecker, commentsRouter);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ err: "Error 404: Not Found" });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  if (process.env.NODE_ENV === "development") {
    res.status(500).send(err.message);
  } else {
    res.status(500).json({ err: "Something went wrong" });
  }
});

module.exports = app;
