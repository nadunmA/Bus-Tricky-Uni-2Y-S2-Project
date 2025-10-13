const express = require("express");
const busLocationController = require("../controllers/busLocationController");

const router = express.Router();

// Route to get all bus locations
router.post("/", busLocationController.getAllBusLocations);
router.get("/", busLocationController.getBusLocation);

// Route to get a specific bus location by bus ID
// router.get("/:busId", busLocationController.getBusLocationByBusId);

module.exports = router;