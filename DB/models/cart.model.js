import mongoose, { model, Schema, Types } from "mongoose";

const cartSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User" },
    sessionId: { type: String },
    products: [
      {
        productId: { type: Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

cartSchema.index({ userId: 1 }, { unique: true, sparse: true });

cartSchema.index({ sessionId: 1 }, { unique: true, sparse: true });

const CartModel = mongoose.models.Cart || model("Cart", cartSchema);
export default CartModel;