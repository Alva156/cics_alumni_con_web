const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authenticateJWT = require("./middleware/auth"); // Middleware for JWT auth

const app = express();
const port = process.env.PORT || 6001;

// Middleware
app.use(cookieParser());
app.use(express.json());

const corsOptions = {
  origin: "http://localhost:5173", // Frontend origin
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
const adminCompaniesRoutes = require("./api/routes/adminCompaniesRoutes"); // Company routes
const userProfileRoutes = require("./api/routes/userProfileRoutes"); // Company routes
const threadsRoutes = require("./api/routes/threadsRoutes");
const repliesRoutes = require("./api/routes/repliesRoutes");
app.use("/companies", adminCompaniesRoutes); // Protected routes for AdminCompanies
app.use("/profile", userProfileRoutes); // Protected routes for AdminCompanies
app.use("/threads", threadsRoutes);
app.use("/replies", repliesRoutes);
app.use("/users", userRoutes);

// Basic Route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
