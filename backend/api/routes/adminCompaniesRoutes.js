const express = require("express");
const router = express.Router();
const authenticateJWT = require("../../middleware/auth");
const adminCompaniesController = require("../controllers/adminCompaniesController");

// Create a company
router.post(
  "/create-companies",
  authenticateJWT,
  adminCompaniesController.createCompany
);

// Get all companies for a user
router.get(
  "/companies",
  authenticateJWT,
  adminCompaniesController.getCompanies
);

// Get a specific company by ID
router.get(
  "/companies/:id",
  authenticateJWT,
  adminCompaniesController.getCompanyById
);

// Update a company
router.put(
  "/update-companies/:id",
  authenticateJWT,
  adminCompaniesController.updateCompany
);

// Delete a company
router.delete(
  "/delete-companies/:id",
  authenticateJWT,
  adminCompaniesController.deleteCompany
);

module.exports = router;
