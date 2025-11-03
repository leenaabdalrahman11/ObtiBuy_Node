import ProductModel from "../../../DB/models/product.model.js";
import cloudinary from "../../utils/cloudinary.js";
import categoryModel from '../../../DB/models/category.model.js';
import slugify from "slugify";
export const create=async (req,res)=>{
    const {name,categoryId}= req.body;
    const checkCategory = await categoryModel.findById(categoryId);
    if(!checkCategory){
        return res.status(404).json({message:"category not found"});
    }
    req.body.slug=slugify(name);
    const {secure_url} = await cloudinary.uploader.upload(req.files.mainImage[0].path);
    return res.json(secure_url);
}