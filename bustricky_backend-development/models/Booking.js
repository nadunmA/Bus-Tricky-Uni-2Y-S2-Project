// backend/models/Booking.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const BookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    default: () => uuidv4(),
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route",
    required: true,
  },
  passenger: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UmUserModel",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  seats: [
    {
      name: {
        type: String,
        required: true,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed", "Cancelled", "Confirmed"],
    default: "Pending",
  },
  date: {
    type: Date,
    required: true,
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
 
  cancellationReason: {
    type: String,
    default: null,
  },
  cancellationDate: {
    type: Date,
    default: null,
  },
  refundAmount: {
    type: Number,
    default: 0,
  },
  refundPercentage: {
    type: Number,
    default: 0,
  },
  refundStatus: {
    type: String,
    enum: ["Not Applicable", "Pending", "Processed", "Failed"],
    default: "Not Applicable",
  },
}, {
  timestamps: true,
});


BookingSchema.index({ "passenger.userId": 1, date: -1 });
BookingSchema.index({ bookingId: 1 });

module.exports = mongoose.model("Booking", BookingSchema);