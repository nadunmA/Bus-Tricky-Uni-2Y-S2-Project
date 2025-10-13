// backend/routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Booking = require("../models/Booking");

// ✅ Create a new booking
router.post("/", async (req, res) => {
  try {
    const { route, passenger, seats, totalAmount, paymentStatus, date } = req.body;

    if (!route || !passenger || !seats || !totalAmount || !paymentStatus || !date) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields" 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(route)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid route ID" 
      });
    }

    if (!passenger.name || !passenger.email || !passenger.phone) {
      return res.status(400).json({
        success: false,
        message: "Passenger details are incomplete"
      });
    }

    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one seat must be selected"
      });
    }

    const booking = new Booking({
      route,
      passenger: {
        userId: passenger.userId || null,
        name: passenger.name,
        email: passenger.email,
        phone: passenger.phone,
      },
      seats,
      totalAmount,
      paymentStatus,
      date: new Date(date),
      bookingDate: new Date(),
    });

    await booking.save();
    await booking.populate('route');

    res.status(201).json({ 
      success: true,
      message: "Booking created successfully",
      booking 
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to create booking", 
      error: error.message 
    });
  }
});

// ✅ Get bookings by user ID
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const bookings = await Booking.find({ "passenger.userId": userId })
      .populate('route')
      .sort({ bookingDate: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user bookings",
      error: error.message
    });
  }
});

// ✅ Cancel booking (using delete endpoint)
router.delete("/delete/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID"
      });
    }

    const booking = await Booking.findByIdAndDelete(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete booking",
      error: error.message
    });
  }
});

// ✅ Cancel booking with refund policy
router.post("/cancel/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID"
      });
    }

    const booking = await Booking.findById(bookingId).populate('route');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (booking.paymentStatus === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled"
      });
    }

    const bookingDate = new Date(booking.date);
    const now = new Date();
    
    if (bookingDate < now) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a past booking"
      });
    }

    const hoursUntilTrip = (bookingDate - now) / (1000 * 60 * 60);
    let refundPercentage = 0;

    if (hoursUntilTrip > 48) {
      refundPercentage = 90;
    } else if (hoursUntilTrip > 24) {
      refundPercentage = 50;
    } else if (hoursUntilTrip > 6) {
      refundPercentage = 25;
    } else {
      refundPercentage = 0;
    }

    const refundAmount = (booking.totalAmount * refundPercentage) / 100;

    booking.paymentStatus = "Cancelled";
    booking.cancellationReason = reason || "Not specified";
    booking.cancellationDate = new Date();
    booking.refundAmount = refundAmount;
    booking.refundPercentage = refundPercentage;
    booking.refundStatus = refundPercentage > 0 ? "Pending" : "Not Applicable";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: {
        bookingId: booking._id,
        refundAmount,
        refundPercentage,
        cancellationDate: booking.cancellationDate,
        refundStatus: booking.refundStatus
      }
    });

  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
      error: error.message
    });
  }
});

// ✅ Get all bookings (admin)
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('route')
      .sort({ bookingDate: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message
    });
  }
});

// ✅ Update passenger details for a booking
router.put("/:id/passenger", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid booking ID" 
      });
    }

    // Validate input
    if (!name || !email || !phone) {
      return res.status(400).json({ 
        success: false,
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
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
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
});

// ✅ Get booking by ID (must be after specific routes)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let booking = null;
    
    if (mongoose.Types.ObjectId.isValid(id)) {
      booking = await Booking.findById(id).populate('route');
    }
    
    if (!booking) {
      booking = await Booking.findOne({ bookingId: id }).populate('route');
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
      error: error.message
    });
  }
});

// ✅ Update booking status
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID"
      });
    }

    const validStatuses = ["Pending", "Paid", "Failed", "Cancelled", "Confirmed"];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status"
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true, runValidators: true }
    ).populate('route');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated",
      booking
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking",
      error: error.message
    });
  }
});

// ✅ Delete/Cancel booking (general endpoint)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID"
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { paymentStatus: "Cancelled" },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
      error: error.message
    });
  }
});

module.exports = router;