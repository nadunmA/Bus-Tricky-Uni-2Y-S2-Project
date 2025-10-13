const Booking = require("../models/Booking");

// ✅ Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await Booking.findById(id).populate("route");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ booking });
  } catch (err) {
    console.error("Error fetching booking:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Create booking (for testing / future CRUD)
const createBooking = async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.status(201).json({ booking: newBooking });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Update booking by ID
const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(id, req.body, {
      new: true,
    })
      .populate("bus")
      .populate("route");

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ booking: updatedBooking });
  } catch (err) {
    console.error("Error updating booking:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Delete booking by ID
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const deletedBooking = await Booking.findByIdAndDelete(id);

    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get all bookings for a user
const getUserBookings = async (req, res) => {
  try {
    const userId = req.params.userId;

    const bookings = await Booking.find({ "passenger.userId": userId })
      .populate("route")
      .sort({ date: 1 });

    res.status(200).json({ bookings });
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// ✅ Update passenger details for a booking
const updatePassengerDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    // Validate input
    if (!name || !email || !phone) {
      return res.status(400).json({ 
        message: "Name, email, and phone are required" 
      });
    }

    // Find and update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        $set: {
          "passenger.name": name,
          "passenger.email": email,
          "passenger.phone": phone,
        },
      },
      { new: true, runValidators: true }
    ).populate("route");

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ 
      success: true,
      message: "Passenger details updated successfully",
      booking: updatedBooking 
    });
  } catch (err) {
    console.error("Error updating passenger details:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};



module.exports = {
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  getUserBookings,
  updatePassengerDetails,
};