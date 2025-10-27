import { required, types } from "joi";
import mongoose, { model, Schema, Types } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        min: 3,
        max: 50
    },
    image: {
        type: Object,
    },

    status: {
        type: String,
        enum: ['active', 'not_active']
    },
    createdAt:{

    },
    createdBy:{
        type:Types.ObjectId,
        ref:'User',
    },
    updatesBy:{
        type:Types.ObjectId,
        ref:'User'
    },
    slug:{
        type:String,
        required:true
    }
}, {
    timestamps: true,
});

const userModel = mongoose.models.User || model('User', userSchema);

export default userModel;
