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
<<<<<<< HEAD
=======
    required:true,
>>>>>>> f1563fe69b6220a48d807b503e989679b9dc9772

  },
  stock:{
    type:Number,
    default:1
  },
  price:{
    type:Number,
<<<<<<< HEAD
=======
    required:true
>>>>>>> f1563fe69b6220a48d807b503e989679b9dc9772
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
