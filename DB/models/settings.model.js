import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    homeProductsTag: { type: String, default: "black" },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
