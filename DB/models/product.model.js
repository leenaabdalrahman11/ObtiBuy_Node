import mongoose, { model, Schema, Types } from "mongoose";

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique:true,
    trim:true,
    minlength: 3,
    maxlength: 50
  },
  description:{
    type:String,
    required:true,

  },
  stock:{
    type:Number,
    default:1
  },
  price:{
    type:Number,
    required:true
  },
  discount:{
    type:Number,
    default:0
  },
  mainimage: {
    type: Object,
  },
  subimages:[
    {
        type:Object,
        required:true
    },
],
  status: {
    type: String,
    enum: ['active', 'not_active'],
    default: 'active'
  },

  createdBy: {
    type: Types.ObjectId,
    ref: 'User'
  },

  updatesBy: {
    type: Types.ObjectId,
    ref: 'User'
  },

  slug: {
    type: String,
    required: true,
    trim: true
  },
  colors:[String],
  sizes:[{
    type:[String],
    enum:['small','medium','large','xlarge']
  }],
  CategoryId:{
    type: Types.ObjectId,
    ref: 'Category'
  }
}, { timestamps: true });

const ProductModel= mongoose.models.Product || model("Product", productSchema);
export default ProductModel;
