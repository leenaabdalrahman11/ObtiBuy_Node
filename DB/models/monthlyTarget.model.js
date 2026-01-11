import mongoose from "mongoose";

const monthlyTargetSchema = new mongoose.Schema(
  {
    monthKey: { type: String, required: true, unique: true }, 
    target: { type: Number, required: true, min: 0 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("MonthlyTarget", monthlyTargetSchema);
