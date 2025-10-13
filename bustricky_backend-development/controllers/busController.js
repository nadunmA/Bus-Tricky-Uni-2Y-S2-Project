import Bus from "../models/Bus.js";

// @desc    Get all buses
// @route   GET /api/buses
// @access  Public
export const getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find().sort({ busId: 1 });
    res.status(200).json({
      success: true,
      count: buses.length,
      data: buses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching buses",
      error: error.message,
    });
  }
};

// @desc    Get single bus by ID
// @route   GET /api/buses/:id
// @access  Public
export const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    res.status(200).json({
      success: true,
      data: bus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching bus",
      error: error.message,
    });
  }
};

// @desc    Get bus by busId (custom ID)
// @route   GET /api/buses/busId/:busId
// @access  Public
export const getBusByBusId = async (req, res) => {
  try {
    const bus = await Bus.findOne({ busId: req.params.busId });

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    res.status(200).json({
      success: true,
      data: bus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching bus",
      error: error.message,
    });
  }
};

// @desc    Create new bus
// @route   POST /api/buses
// @access  Private
export const createBus = async (req, res) => {
  try {
    const { bus_number, driver_name, bus_route } = req.body;

    // Validation
    if (!bus_number || !driver_name || !bus_route) {
      return res.status(400).json({
        success: false,
        message: "Please provide bus_number, driver_name, and bus_route",
      });
    }

    // Check if bus number already exists
    const existingBus = await Bus.findOne({ bus_number });
    if (existingBus) {
      return res.status(400).json({
        success: false,
        message: "Bus number already exists",
      });
    }

    const bus = await Bus.create({
      bus_number,
      driver_name,
      bus_route,
    });

    res.status(201).json({
      success: true,
      message: "Bus created successfully",
      data: bus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while creating bus",
      error: error.message,
    });
  }
};

// @desc    Update bus
// @route   PUT /api/buses/:id
// @access  Private
export const updateBus = async (req, res) => {
  try {
    const { bus_number, driver_name, bus_route } = req.body;

    // Check if bus exists
    let bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    // Check if bus number is being updated and if it already exists
    if (bus_number && bus_number !== bus.bus_number) {
      const existingBus = await Bus.findOne({ bus_number });
      if (existingBus) {
        return res.status(400).json({
          success: false,
          message: "Bus number already exists",
        });
      }
    }

    // Update bus
    bus = await Bus.findByIdAndUpdate(
      req.params.id,
      { bus_number, driver_name, bus_route },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Bus updated successfully",
      data: bus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while updating bus",
      error: error.message,
    });
  }
};

// @desc    Delete bus
// @route   DELETE /api/buses/:id
// @access  Private
export const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    await Bus.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Bus deleted successfully",
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting bus",
      error: error.message,
    });
  }
};

// @desc    Get buses by route
// @route   GET /api/buses/route/:route
// @access  Public
export const getBusesByRoute = async (req, res) => {
  try {
    const buses = await Bus.find({
      bus_route: { $regex: req.params.route, $options: "i" },
    }).sort({ busId: 1 });

    res.status(200).json({
      success: true,
      count: buses.length,
      data: buses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching buses by route",
      error: error.message,
    });
  }
};
