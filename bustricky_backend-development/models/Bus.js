import mongoose from "mongoose";
import Counter from "./Counter.js";

const busSchema = new mongoose.Schema(
  {
    busId: { type: Number, unique: true }, // Auto-increment ID
    bus_number: { type: String, required: true, unique: true },
    driver_name: { type: String, required: true },
    bus_route: { type: String, required: true },
  },
  { timestamps: true }
);

// Auto increment busId
busSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "busId" },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );
    this.busId = counter.sequence_value;
  }
  next();
});

export default mongoose.model("Bus", busSchema);
