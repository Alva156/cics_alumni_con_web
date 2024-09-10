const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken"); // Added for JWT

require("dotenv").config();
const app = express();
const port = process.env.PORT || 6001;

// Middleware
app.use(cors());
app.use(express.json());

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
