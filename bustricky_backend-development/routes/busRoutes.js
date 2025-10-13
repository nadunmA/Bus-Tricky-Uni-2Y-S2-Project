// routes/busRoutes.js
const express = require("express");
const {
  getAllBuses,
  getBusById,
  getBusByBusId,
  createBus,
  updateBus,
  deleteBus,
  getBusesByRoute,
} = require("../controllers/busController");

const router = express.Router();

// @route   GET /api/buses
// @desc    Get all buses
router.get("/", getAllBuses);

// @route   GET /api/buses/route/:route
// @desc    Get buses by route
router.get("/route/:route", getBusesByRoute);

// @route   GET /api/buses/busId/:busId
// @desc    Get bus by busId (custom ID)
router.get("/busId/:busId", getBusByBusId);

// @route   GET /api/buses/:id
// @desc    Get single bus by MongoDB _id
router.get("/:id", getBusById);

// @route   POST /api/buses
// @desc    Create new bus
router.post("/", createBus);

// @route   PUT /api/buses/:id
// @desc    Update bus
router.put("/:id", updateBus);

// @route   DELETE /api/buses/:id
// @desc    Delete bus
router.delete("/:id", deleteBus);

module.exports = router;
