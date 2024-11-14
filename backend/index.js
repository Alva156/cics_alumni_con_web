const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const path = require("path");

const app = express();
const port = process.env.PORT || 6001;

// Use absolute path to serve uploads
const pathToUploads = path.join(__dirname, "uploads");

// Middleware
app.use(cookieParser());
app.use(express.json());

// Serve static files from uploads
app.use("/uploads", express.static(pathToUploads)); // This serves all files in 'uploads'

// Serve static files from the frontend dist folder
app.use(express.static(path.join(__dirname, "../frontend/dist"))); // Adjust path based on where your backend is relative to the frontend build

const corsOptions = {
  origin: process.env.FRONTEND, // Frontend origin
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
const adminCompaniesRoutes = require("./api/routes/Contents/adminCompaniesRoutes");
const userProfileRoutes = require("./api/routes/userProfileRoutes");
const adminNewsRoutes = require("./api/routes/Contents/adminNewsRoutes");
const adminEventsRoutes = require("./api/routes/Contents/adminEventsRoutes");
const adminCertificationsRoutes = require("./api/routes/Contents/adminCertificationsRoutes");
const adminDocumentsRoutes = require("./api/routes/Contents/adminDocumentsRoutes");
const adminJobsRoutes = require("./api/routes/Contents/adminJobsRoutes");
const threadsRoutes = require("./api/routes/threadsRoutes");
const repliesRoutes = require("./api/routes/repliesRoutes");
const surveyRoutes = require("./api/routes/surveyRoutes");

app.use("/companies", adminCompaniesRoutes);
app.use("/profile", userProfileRoutes);
app.use("/threads", threadsRoutes);
app.use("/replies", repliesRoutes);
app.use("/users", userRoutes);
app.use("/companies", adminCompaniesRoutes);
app.use("/profile", userProfileRoutes);
app.use("/news", adminNewsRoutes);
app.use("/events", adminEventsRoutes);
app.use("/certifications", adminCertificationsRoutes);
app.use("/documents", adminDocumentsRoutes);
app.use("/jobs", adminJobsRoutes);
app.use("/survey", surveyRoutes);

app.use(express.json({ limit: "10mb" })); // Increase to 10MB for JSON data
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Catch-all route for frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

// Basic Route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Log the FRONTEND URL with a clear message
console.log(`Frontend URL: ${process.env.FRONTEND}`);
