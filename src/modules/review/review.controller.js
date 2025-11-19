import OrderModel from "../../../DB/models/order.model.js";
import reviewModel from "../../../DB/models/review.model.js";

export const create = async(req,res)=>{
    const userId = req.id;
    const {productId} = req.params;
    const {comment,rating} = req.body;
    const order =await OrderModel.findOne({
        userId:userId,
        status:'deliverd',
        "products.productId":productId
    })
    if(!order){
        return res.status(400).json({message:"can't review this product"});
    }
    const review = await reviewModel.create({
        comment,
        rating,
        productId:productId,
        createdBy:userId
    });
    if(!review){
        return res.status(400).json({message:"error while adding review"});
    }
        return res.status(201).json({message:"success"});
}
