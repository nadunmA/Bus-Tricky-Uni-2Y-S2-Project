const mongoose = require("mongoose");
const Counter = require("./Counter");

const routeSchema = new mongoose.Schema(
  {
    routeId: { type: Number, unique: true }, // Auto-increment
    from: { type: String, required: true },
    to: { type: String, required: true },
    distance: { type: Number, required: true },
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

// Auto-increment routeId
routeSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "routeId" },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );
    this.routeId = counter.sequence_value;
  }
  next();
});

module.exports = mongoose.model("Route", routeSchema);