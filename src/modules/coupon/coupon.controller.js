import couponModel from "../../../DB/models/coupon.model.js"

export const create = async(req,res)=>{
    if(await couponModel.findOne({name:req.body.name})){
        return res.status(409).json({message:"coupon name already exists"});

    }
    req.body.expireDate = new Date(req.body.expireDate);

    const coupon = await couponModel.create(req.body); 
    req.body.createdBy = req.id;
    req.body.updatedBy = req.id;
    return res.status(201).json({message:"success",coupon});
}

export const get = async(req,res)=>{
    const coupons = await couponModel.find({});
    return res.status(201).json({message:"success",coupons});
}