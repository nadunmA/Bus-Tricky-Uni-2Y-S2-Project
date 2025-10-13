const express = require("express");
const { 
  getAllRoutes, 
  getRouteById, 
  createRoute, 
  updateRoute, 
  deleteRoute 
} = require("../controllers/routeController");

const router = express.Router();

// Get all routes
router.get("/", getAllRoutes);

// Get a single route by id (change from :routeId to :id)
router.get("/:id", getRouteById);

// Create a new route
router.post("/", createRoute);

// Update a route by id (change from :routeId to :id)
router.put("/:id", updateRoute);

// Delete a route by id (change from :routeId to :id)
router.delete("/:id", deleteRoute);

module.exports = router;