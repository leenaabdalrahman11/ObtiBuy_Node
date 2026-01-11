import mongoose, { model, Schema, Types } from "mongoose";

const orderSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      unique: false,
      ref: "User",
    },

    products: [
      {
        productName: {
          type: String,
          required: true,
        },
        productId: {
          type: Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        finalPrice: {
          type: Number,
          required: true,
        },
      },
    ],
    couponName: {
      type: String,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    paymentType: {
      type: String,
      default: "cash",
      enum: ["cash", "card"],
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "cancelled", "confirmed", "onWay", "delivered", "received"],
    },
    note: String,
    reasonrejected: String,
    updatedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
receivedByUser: { type: Boolean, default: false },
receivedAt: { type: Date, default: null },

  },
  { timestamps: true }
);
const OrderModel = mongoose.models.Order || model("Order", orderSchema);
export default OrderModel;
