import ProductModel from "../../../DB/models/product.model.js";
import cloudinary from "../../utils/cloudinary.js";
import categoryModel from '../../../DB/models/category.model.js';
import slugify from "slugify";
export const create=async (req,res)=>{
    const {name,categoryId,discount,price}= req.body;
    const checkCategory = await categoryModel.findById(categoryId);
    if(!checkCategory){
        return res.status(404).json({message:"category not found"});
    }
    req.body.slug=slugify(name);
    const {secure_url,public_id} = await cloudinary.uploader.upload(
        req.files.mainImage[0].path,
    {folder:`${process.env.APP_NAME}/products/${name}`}
);
    req.body.subImages = [];
    if(req.files.subImages){
        for(const file of req.files.subImages){
            const {secure_url , public_id} = await cloudinary.uploader.upload(
                file.path,{folder:`${process.env.APP_NAME}/products/${name}/subImages`});
            req.body.subImages.push({secure_url,public_id});
        }
    }

    
    req.body.mainImage = {secure_url,public_id};
    req.body.createdBy = req.id;
    req.body.updatesBy = req.id;
    req.body.CategoryId = categoryId;
    req.body.priceAfterDiscount = price - (price * (discount || 0) / 100);

    const product = await ProductModel.create(req.body);
    return res.status(201).json({message:"success",product});
}


export const get = async(req,res)=>{
    const products = await ProductModel.find({}).select('name description mainImage Price discount CategoryId priceAfterDiscount');
    return res.status(200).json({message:"success",products});
}

export const getActive = async(req,res)=>{
    const products = await ProductModel.find({status:'active'}).select('name description mainImage Price discount CategoryId');
    return res.status(200).json({message:"success",products});
}
export const getDetails = async(req,res)=>{
    const {id} = req.params;
    const products = await ProductModel.findById(id).select('-discount').populate('reviews');
        return res.status(200).json({message:"success",products});

}

export const remove = async(req,res)=>{
    const {id} = req.params;
    const product = await ProductModel.findByIdAndDelete(id);
    if(!product){
        return res.status(404).json({message:"not found"});
    }
    
    await cloudinary.uploader.destroy(product.mainImage.public_id);
    if(product.subImages && product.subImages.length){
        for(const img of product.subImages){
            await cloudinary.uploader.destroy(img.public_id);
        }
    }
    return res.status(200).json({message:"success",product});

}