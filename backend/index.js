const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 6001;

// Middleware
app.use(cors());
app.use(express.json());

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cics-alumni-db.j2atd.mongodb.net/cicsalumnicon?retryWrites=true&w=majority`,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      secure: process.env.NODE_ENV, // Set to true if using HTTPS in production
      httpOnly: true,
    },
  })
);

// Database Connection
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cics-alumni-db.j2atd.mongodb.net/cicsalumnicon?retryWrites=true&w=majority`
  )
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((error) => console.log("Error connecting to MongoDB", error));

// Routes
const userRoutes = require("./api/routes/userRoutes");
app.use("/users", userRoutes);

// Basic Route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
