const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken"); // Added for JWT
const cookieParser = require("cookie-parser");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 6001;

// Middleware
app.use(cookieParser());
app.use(express.json());
const corsOptions = {
  origin: "http://localhost:5173", // Origin of the frontend
  credentials: true, // Allow cookies and credentials to be sent
};

app.use(cors(corsOptions));

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
const threadsRoutes = require("./api/routes/threadsRoutes");
app.use("/threads", threadsRoutes);
const repliesRoutes = require("./api/routes/repliesRoutes");
app.use("/replies", repliesRoutes);

// Basic Route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
