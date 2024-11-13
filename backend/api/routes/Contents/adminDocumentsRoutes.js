const express = require("express");
const router = express.Router();
const authenticateJWT = require("../../../middleware/auth");
const adminDocumentsController = require("../../controllers/Contents/adminDocumentsController");

// Create a documents
router.post(
  "/create-documents",
  authenticateJWT,
  adminDocumentsController.createDocuments
);

// Get all documents for a user
router.get("/view", authenticateJWT, adminDocumentsController.getDocuments);

// Get a specific documents by ID
router.get(
  "/view/:id",
  authenticateJWT,
  adminDocumentsController.getDocumentsById
);

// Update a documents
router.put(
  "/update-documents/:id",
  authenticateJWT,
  adminDocumentsController.updateDocuments
);

// Delete a documents
router.delete(
  "/delete-documents/:id",
  authenticateJWT,
  adminDocumentsController.deleteDocuments
);
router.get(
  "/download/:filename",
  authenticateJWT,
  adminDocumentsController.downloadDocument
);

module.exports = router;
