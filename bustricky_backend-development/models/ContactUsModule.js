const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    gmail: {
      type: String,
      required: true,
    },
    Contact: {
      type: String,
      required: true,
    },
    Subject: {
      type: String,
      required: true,
    },
    Message: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    adminResponse: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ContactUs", contactUsSchema);