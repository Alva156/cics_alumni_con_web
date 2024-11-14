const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 6001;

// Ensure necessary directories exist
const uploadsPath = path.join(__dirname, "uploads");
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

ensureDirectoryExists(path.join(uploadsPath, "profileimg"));
ensureDirectoryExists(path.join(uploadsPath, "attachments"));
ensureDirectoryExists(path.join(uploadsPath, "contents"));

// Middleware
app.use(cookieParser());
app.use(express.json());

// Serve static files from the frontend dist folder
app.use(express.static(path.join(__dirname, "../frontend/dist")));

const corsOptions = {
  origin: process.env.FRONTEND, // Frontend origin
  credentials: true, // Allow cookies and credentials to be sent
};

app.use(cors(corsOptions));

// Serve static files from uploads
app.use(
  "/uploads/profileimg",
  express.static(path.join(uploadsPath, "profileimg"))
);
app.use(
  "/uploads/attachments",
  express.static(path.join(uploadsPath, "attachments"))
);
app.use(
  "/uploads/contents/companies",
  express.static(path.join(uploadsPath, "contents", "companies"))
);
app.use(
  "/uploads/contents/news",
  express.static(path.join(uploadsPath, "contents", "news"))
);
app.use(
  "/uploads/contents/events",
  express.static(path.join(uploadsPath, "contents", "events"))
);
app.use(
  "/uploads/contents/certifications",
  express.static(path.join(uploadsPath, "contents", "certifications"))
);
app.use(
  "/uploads/contents/documents",
  express.static(path.join(uploadsPath, "contents", "documents"))
);
app.use(
  "/uploads/contents/jobs",
  express.static(path.join(uploadsPath, "contents", "jobs"))
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
app.use("/news", adminNewsRoutes);
app.use("/events", adminEventsRoutes);
app.use("/certifications", adminCertificationsRoutes);
app.use("/documents", adminDocumentsRoutes);
app.use("/jobs", adminJobsRoutes);
app.use("/survey", surveyRoutes);

// JSON and URL parsing limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

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
