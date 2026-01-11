import CartModel from "../../../DB/models/cart.model.js";
import couponModel from "../../../DB/models/coupon.model.js";
import OrderModel from "../../../DB/models/order.model.js";
import ProductModel from "../../../DB/models/product.model.js";
import userModel from "../../../DB/models/user.model.js";

export const create = async (req, res) => {
  try {
    const { couponName, address, phoneNumber } = req.body;

    const userId = req.id;
    const sessionId = req.headers["x-session-id"];

    console.log("=== CREATE ORDER ===");
    console.log("User ID:", userId);
    console.log("Session ID:", sessionId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Guest users cannot place orders. Please login first",
      });
    }

    let cart = await CartModel.findOne({ userId }).populate(
      "products.productId"
    );

    if ((!cart || !cart.products || cart.products.length === 0) && sessionId) {
      const guestCart = await CartModel.findOne({ sessionId, userId: null });

      if (guestCart && guestCart.products && guestCart.products.length > 0) {
        if (!cart) {
          cart = await CartModel.create({
            userId,
            sessionId: null,
            products: [],
          });
        }

        for (const gItem of guestCart.products) {
          const existing = cart.products.find(
            (p) => p.productId.toString() === gItem.productId.toString()
          );
          if (existing) existing.quantity += gItem.quantity;
          else
            cart.products.push({
              productId: gItem.productId,
              quantity: gItem.quantity,
            });
        }

        await cart.save();

        await CartModel.updateOne(
          { _id: guestCart._id },
          { $set: { products: [] } }
        );

        cart = await CartModel.findOne({ userId }).populate(
          "products.productId"
        );

        console.log("Guest cart merged into user cart");
      }
    }

    if (!cart || !cart.products || cart.products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    console.log(`✅ Cart found with ${cart.products.length} products`);

    let coupon = null;
    if (couponName && couponName.trim()) {
      coupon = await couponModel.findOne({ name: couponName.trim() });

      if (!coupon) {
        return res
          .status(404)
          .json({ success: false, message: "Coupon not found" });
      }

      if (coupon.expireDate <= new Date()) {
        return res
          .status(400)
          .json({ success: false, message: "Coupon expired" });
      }

      if (Array.isArray(coupon.userdBy) && coupon.userdBy.includes(userId)) {
        return res.status(400).json({
          success: false,
          message: "Coupon already used",
        });
      }
    }

    const finalProducts = [];
    let subTotal = 0;

    for (const item of cart.products) {
      const productId = item.productId?._id || item.productId;
      const product = await ProductModel.findById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${productId}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Product out of stock: ${product.name}`,
        });
      }

      const unitPrice = product.priceAfterDiscount || product.price;
      const finalPrice = unitPrice * item.quantity;

      finalProducts.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        finalPrice,
        mainImage: product.mainImage,
      });

      subTotal += finalPrice;
    }

    const user = await userModel.findById(userId);

    const shippingAddress = (address && address.trim()) || user?.address;
    const shippingPhone =
      (phoneNumber && phoneNumber.trim()) || user?.phoneNumber;

    if (!shippingAddress || !shippingPhone) {
      return res.status(400).json({
        success: false,
        message: "Address and phone number are required",
      });
    }

    const discount = coupon ? (subTotal * coupon.amount) / 100 : 0;
    const finalOrderPrice = subTotal - discount;

    const order = await OrderModel.create({
      userId,
      products: finalProducts,
      couponName: couponName ? couponName.trim() : "",
      couponId: coupon?._id || null,
      address: shippingAddress,
      phoneNumber: shippingPhone,
      subTotal,
      discount,
      finalPrice: finalOrderPrice,
      status: "pending",
      paymentStatus: "pending",
    });

    for (const p of finalProducts) {
      await ProductModel.findByIdAndUpdate(p.productId, {
        $inc: { stock: -p.quantity },
      });
    }

    if (coupon) {
      await couponModel.findByIdAndUpdate(coupon._id, {
        $addToSet: { userdBy: userId },
      });
    }

    await CartModel.updateOne({ userId }, { $set: { products: [] } });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error(" CREATE ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating order",
      error: error.message,
    });
  }
};
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const orders = await OrderModel.find({ userId })
      .populate("products.productId", "name price priceAfterDiscount mainImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      orders,
    });
  } catch (error) {
    console.error(" getUserOrders error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const orders = await OrderModel.find({ status })
      .populate("userId", "userName email")
      .populate("products.productId", "name price priceAfterDiscount mainImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "success",
      orders,
    });
  } catch (error) {
    console.error(" getOrdersByStatus error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const changeStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const adminId = req.id;

    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.status === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Cannot change status of delivered order",
      });
    }

    order.status = status;
    order.updatedBy = adminId;
    await order.save();

    if (status === "cancelled") {
      for (const p of order.products) {
        await ProductModel.findByIdAndUpdate(p.productId, {
          $inc: { stock: p.quantity },
        });
      }

      if (order.couponId && order.userId) {
        await couponModel.findByIdAndUpdate(order.couponId, {
          $pull: { userdBy: order.userId },
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error(" changeStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getWeeklySales = async (req, res) => {
  try {
    const salesData = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);

      const start = new Date(d);
      start.setHours(0, 0, 0, 0);

      const end = new Date(d);
      end.setHours(23, 59, 59, 999);

      const orders = await OrderModel.find({
        createdAt: { $gte: start, $lte: end },
        status: { $ne: "cancelled" },
      });

      const total = orders.reduce((sum, o) => sum + (o.finalPrice || 0), 0);

      const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
        start.getDay()
      ];

      salesData.push({
        day: weekday,
        date: start.toISOString().split("T")[0],
        sales: total,
        orders: orders.length,
      });
    }

    return res.status(200).json({
      success: true,
      message: "success",
      salesData,
    });
  } catch (error) {
    console.error(" getWeeklySales error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRecentOrders = async (req, res) => {
  try {
    const recentOrders = await OrderModel.find({ status: { $ne: "cancelled" } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "userName email");

    const orders = recentOrders.map((o) => ({
      id: o._id,
      customer: o.userId?.userName || "User",
      email: o.userId?.email || "-",
      status: o.status,
      amount: o.finalPrice,
      items: Array.isArray(o.products)
        ? o.products.reduce((s, p) => s + p.quantity, 0)
        : 0,
      createdAt: o.createdAt,
      address: o.address,
    }));

    return res.status(200).json({
      success: true,
      message: "success",
      orders,
    });
  } catch (error) {
    console.error(" getRecentOrders error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const confirmReceived = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.id;

    const order = await OrderModel.findOne({ _id: orderId, userId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "delivered") {
      return res.status(400).json({ message: "Order not delivered yet" });
    }

    if (order.receivedByUser) {
      return res.status(200).json({ message: "Already confirmed", order });
    }
order.status = "received";
order.receivedByUser = true;
order.receivedAt = new Date();
await order.save();


    return res.status(200).json({ message: "Confirmed", order });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

