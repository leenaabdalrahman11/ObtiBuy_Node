import CartModel from "../../../DB/models/cart.model.js";

export const addToCart = async(req,res)=>{
    const {productId} = req.body;
        if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }
    const cart = await CartModel.findOne({userId:req.id});
    if(!cart){
        const newCart = await CartModel.create({
            userId:req.id,
            products:[{
                 userId: req.id, 
                  productId: productId, 
        }]
        });
        return res.status(201).json({message:"success"});
    }
    for(let i=0;i<cart.products.length;i++){
        if(cart.products[i].productId == productId){
            return res.status(409).json({message:"product is already added"});
        }
    }
    cart.products.push({productId});
    await cart.save();
    return res.json(cart);
}