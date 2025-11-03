import mongoose, { model, Schema, Types } from "mongoose";

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  image: {
    type: Object,
  },

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
  }

}, { timestamps: true });

const CategoryModel = mongoose.models.Category || model("Category", categorySchema);
export default CategoryModel;
