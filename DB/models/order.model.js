import mongoose, { model, Schema, Types } from "mongoose";

const orderSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [
      {
        productName:{
            type:String,
            required:true
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
        unitPrice:{
            type:Number,
            required:true,
        },
        finalPrice:{
            type:Number,
            required:true
        }
      },
    ],
    couponName:{
        type:String
    },
    finalPrice:{
        type:Number,
        required:true
    },
    paymentType:{
        type:String,
        default:'cash',
        enum:['cash','card']
    },
    phoneNumber:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    status:{
        type:String,
        default:'pending',
        enum:['pending','cancelled','confirmed','onWay','deliverd']
    },
    note:String,
    reasonrejected:String,
    updatedBy:{
        type:Types.ObjectId,
        ref:'User'
    }
  },
  { timestamps: true }
);
const OrderModel = mongoose.models.Order || model("Order", orderSchema);
export default OrderModel;
