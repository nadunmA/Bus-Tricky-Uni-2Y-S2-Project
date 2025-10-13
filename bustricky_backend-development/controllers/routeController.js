const Route = require("../models/Route");
const Bus = require("../models/Bus");

// Get all routes
const getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find();
    res.status(200).json(routes);
  } catch (err) {
    console.error("Error fetching routes:", err);
    res.status(500).json({ message: "Server error while fetching routes" });
  }
};

// Get route by id (can handle both _id and routeId)
const getRouteById = async (req, res) => {
  try {
    const { id } = req.params; // Changed from routeId to id
    
    let route;
    // Try to find by _id first (MongoDB ObjectId)
    if (id.length === 24) { // MongoDB ObjectId length check
      route = await Route.findById(id);
    } else {
      // Try to find by routeId (number)
      const routeId = parseInt(id);
      if (!isNaN(routeId)) {
        route = await Route.findOne({ routeId });
      }
    }
    
    if (!route) return res.status(404).json({ message: "Route not found" });

    const buses = await Bus.find({ routeId: route.routeId });
    res.status(200).json({ route, buses });
  } catch (err) {
    console.error("Error fetching route:", err);
    res.status(500).json({ message: "Server error while fetching route" });
  }
};

// Create new route
const createRoute = async (req, res) => {
  try {
    const route = new Route(req.body);
    const savedRoute = await route.save();
    res.status(201).json(savedRoute);
  } catch (err) {
    console.error("Error creating route:", err);
    res.status(400).json({ message: "Error creating route", error: err.message });
  }
};

// Update route
const updateRoute = async (req, res) => {
  try {
    const { id } = req.params; // Changed from routeId to id
    
    let updatedRoute;
    // Try to find by _id first (MongoDB ObjectId)
    if (id.length === 24) { // MongoDB ObjectId length check
      updatedRoute = await Route.findByIdAndUpdate(id, req.body, { new: true });
    } else {
      // Try to find by routeId (number)
      const routeId = parseInt(id);
      if (!isNaN(routeId)) {
        updatedRoute = await Route.findOneAndUpdate({ routeId }, req.body, { new: true });
      }
    }
    
    if (!updatedRoute) return res.status(404).json({ message: "Route not found" });
    res.status(200).json(updatedRoute);
  } catch (err) {
    console.error("Error updating route:", err);
    res.status(400).json({ message: "Error updating route", error: err.message });
  }
};

// Delete route
const deleteRoute = async (req, res) => {
  try {
    const { id } = req.params; // Changed from routeId to id
    
    let deletedRoute;
    // Try to find by _id first (MongoDB ObjectId)
    if (id.length === 24) { // MongoDB ObjectId length check
      deletedRoute = await Route.findByIdAndDelete(id);
    } else {
      // Try to find by routeId (number)
      const routeId = parseInt(id);
      if (!isNaN(routeId)) {
        deletedRoute = await Route.findOneAndDelete({ routeId });
      }
    }
    
    if (!deletedRoute) return res.status(404).json({ message: "Route not found" });
    res.status(200).json({ message: "Route deleted successfully" });
  } catch (err) {
    console.error("Error deleting route:", err);
    res.status(500).json({ message: "Server error while deleting route" });
  }
};

module.exports = {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
};