const BusLocation = require("../models/BusLocation");

const getAllBusLocations = async (req, res) => {
  try {
    const { busId, latitude, longitude } = req.body;

    if (!busId || latitude == null || longitude == null) {
      return res.status(400).json({ message: "busId, latitude, and longitude are required" });
    }

    const updatedLocation = await BusLocation.findOneAndUpdate(
      { busId },
      { latitude, longitude, timestamp: new Date() }, 
      { new: true, upsert: true } 
    );

    res.status(200).json({
      message: "Bus location saved successfully",
      data: updatedLocation,
    });
  } catch (error) {
    console.error("Error saving/updating bus location:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getBusLocation = async (req, res) => {
  try {
    console.log("Fetching bus location");
    const busId = "BUS_101"
    const location = await BusLocation.find({busId: busId}).sort({ timestamp: -1 }).limit(1);

    if (!location) {
      return res.status(404).json({ message: "No location found for this bus" });
    }

    res.status(200).json(location);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getAllBusLocations,
  getBusLocation
};