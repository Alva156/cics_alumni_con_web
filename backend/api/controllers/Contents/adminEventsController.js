const Events = require("../../models/Contents/eventsModel");
const jwt = require("jsonwebtoken"); // Add this line

// Create new events
exports.createEvents = async (req, res) => {
  try {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) {
      return res.status(401).json({ message: "Unauthorized, token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get userId from the decoded token

    const { name, address, image, description, contact } = req.body;

    const events = new Events({
      userId,
      name,
      address,
      image,
      description,
      contact,
    });
    await events.save();

    res.status(201).json(events);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Get all events for a specific user
exports.getEvents = async (req, res) => {
  try {
    // Fetch all events without filtering by userId
    const events = await Events.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Get a single events by ID
exports.getEventsById = async (req, res) => {
  try {
    const events = await Events.findById(req.params.id);

    if (!events) {
      return res.status(404).json({ msg: "Events not found" });
    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Update events
exports.updateEvents = async (req, res) => {
  try {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) {
      return res.status(401).json({ message: "Unauthorized, token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get userId from the decoded token
    const userRole = decoded.role; // Get user role from the decoded token

    const { name, address, image, description, contact } = req.body;
    const events = await Events.findById(req.params.id);

    if (!events) {
      return res.status(404).json({ msg: "Events not found" });
    }

    // Ensure user is admin or owns the events
    if (userRole !== "admin" && events.userId.toString() !== userId) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    events.name = name || events.name;
    events.address = address || events.address;
    events.image = image || events.image;
    events.description = description || events.description;
    events.contact = contact || events.contact;

    await events.save();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Delete events
exports.deleteEvents = async (req, res) => {
  console.log("Delete request received for events ID:", req.params.id);
  try {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) {
      console.log("Token is missing.");
      return res.status(401).json({ message: "Unauthorized, token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get userId from the decoded token
    const userRole = decoded.role; // Get user role from the decoded token

    const events = await Events.findById(req.params.id);
    if (!events) {
      console.log("Events not found:", req.params.id);
      return res.status(404).json({ message: "Events not found" });
    }

    // Ensure user is admin or owns the events
    if (userRole !== "admin" && events.userId.toString() !== userId) {
      console.log(
        "Unauthorized attempt to delete events:",
        userId,
        events.userId
      );
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Events.deleteOne({ _id: req.params.id });
    console.log("Events deleted successfully:", req.params.id);
    res.status(200).json({ message: "Events deleted successfully" });
  } catch (error) {
    console.error("Error deleting events:", error);
    res
      .status(500)
      .json({ message: "Error deleting events", error: error.message });
  }
};
