import mongoose from "mongoose";

const searchLogSchema = new mongoose.Schema(
  {
    q: { type: String, required: true, trim: true },        
    qNorm: { type: String, required: true, index: true },    
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    isGuest: { type: Boolean, default: true },

    productsCount: { type: Number, default: 0 },
    categoriesCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    found: { type: Boolean, default: false }, 

    source: { type: String, default: "overlay" }, 
  },
  { timestamps: true }
);

searchLogSchema.index({ createdAt: -1 });
searchLogSchema.index({ found: 1, createdAt: -1 });

export default mongoose.model("SearchLog", searchLogSchema);
