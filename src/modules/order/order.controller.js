import CartModel from "../../../DB/models/cart.model.js"
import couponModel from "../../../DB/models/coupon.model.js";
import OrderModel from "../../../DB/models/order.model.js";
import ProductModel from "../../../DB/models/product.model.js";
import userModel from "../../../DB/models/user.model.js";
export const create = async (req, res) => {
    const { couponName } = req.body;
    const cart = await CartModel.findOne({ userId: req.id });
    if (!cart) {
        return res.status(404).json({ message: "cart not found" });
    }

    if (couponName) {
        const coupon = await couponModel.findOne({ name: couponName });
        if (!coupon) {
            return res.status(404).json({ message: "coupon not found" });
        }
        if (coupon.expireDate <= new Date()) {
            return res.status(404).json({ message: "this coupon has expired" });
        }
        if (coupon.userdBy.includes(req.id)) {
            return res.status(404).json({ message: "coupon already used" });
        }
        req.body.coupon = coupon;
    }

    let finalProducts = [];
    let subTotal = 0;
    for (let product of cart.products) {
        const checkProduct = await ProductModel.findOne({
            _id: product.productId,
            stock: { $gte: product.quantity }
        });
        if (!checkProduct) {
            return res.status(400).json({ message: "product quantity not available " });
        }
        product = product.toObject();//its convert from Bson to Json
        product.productName = checkProduct.name;
        product.unitPrice = checkProduct.priceAfterDiscount;
        product.finalPrice = product.quantity * checkProduct.priceAfterDiscount;
        subTotal += product.finalPrice;

        finalProducts.push(product);
    }

    const user = await userModel.findById(req.id);
    if (!req.body.address) {
        req.body.address = user.address;
    }
    if (!req.body.phoneNumber) {
        req.body.phoneNumber = user.phoneNumber;
    }
    const order = await OrderModel.create({
        userId: req.id,
        products: finalProducts,
        couponName: couponName ?? '',
        address: req.body.address,
        phoneNumber: req.body.phoneNumber,
        finalPrice: subTotal - (subTotal * ((req.body.coupon.amount || 0)) / 100),
    });
    //decrease product stock
    for (const product of cart.products) {
        await ProductModel.updateOne({ _id: product.productId },
            {
                $inc: {
                    stock: -product.quantity
                }
            }
        );
    }
    //update coupon
    if (req.body.coupon) {
        await couponModel.updateOne({ _id: req.body.coupon._id },
            {
                $addToSet: {
                    userdBy: req.id
                }
            }
        )
    }
    // clear cart
    await CartModel.updateOne({ userId: req.id }, {
        products: [],
    });
    return res.status(201).json({ message: "success", order });
}
export const getUserOrders = async (req, res) => {
    const orders = await OrderModel.find({ userId: req.id }).populate("products.productId");
    return res.status(200).json({ message: "success", orders });
}

export const getOrdersByStatus = async (req, res) => {
    const { status } = req.params;
    const orders = await OrderModel.find({ status: status }).
        populate("products.productId");
    return res.status(200).json({ message: "success", orders });
}

export const changeStatus = async (req, res) => {
    const { orderId } = req.params;
    const order = await OrderModel.findById(orderId);
    if (!order) {
        return res.status(404).json({ message: "order not found" });

    }
    if (order.status == 'deliverd') {
        return res.status(404).json({ message: "can't cancel this order" });
    }
            order.status = req.body.status;
        order.updatedBy = req.id;
        await order.save();
    if (order.status == 'cancelled') {
        for (const product of cart.products) {
            await ProductModel.updateOne({ _id: product.productId },
                {
                    $inc: {
                        stock: product.quantity
                    }
                }
            );
            return res.status(404).json({ message: "can't cancel this order" });
        }
        if (req.body.coupon) {
        await couponModel.updateOne({ _id: req.body.coupon._id },
            {
                $pull: {
                    userdBy: req.id
                }
            }
        )}
    }
        return res.status(200).json({ message: "success" });
    
}