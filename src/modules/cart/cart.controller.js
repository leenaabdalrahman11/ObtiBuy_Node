import CartModel from "../../../DB/models/cart.model.js";

const getUserId = (req) =>
  req.id || req.userId || req.user?._id || req.user?.id || null;

const buildQuery = (req, res) => {
  const userId = getUserId(req);
  const sessionId = req.headers["x-session-id"];

  if (userId) return { userId };
  if (sessionId)
    return {
      sessionId,
      $or: [{ userId: null }, { userId: { $exists: false } }],
    };

  res
    .status(400)
    .json({ success: false, message: "User ID or x-session-id required" });
  return null;
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId is required" });
    }

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "quantity must be a positive number",
        });
    }

    const query = buildQuery(req, res);
    if (!query) return;

    console.log("- userId:", getUserId(req));
    console.log("- sessionId:", req.headers["x-session-id"]);
    console.log("- productId:", productId);

    let cart = await CartModel.findOne(query);

    if (!cart) {
      cart = await CartModel.create({
        userId: query.userId || null,
        sessionId: query.sessionId || null,
        products: [],
      });
    }

    const productExists = cart.products.find(
      (p) => p.productId.toString() === productId.toString()
    );

    if (productExists) {
      productExists.quantity += qty;
    } else {
      cart.products.push({ productId, quantity: qty });
    }

    await cart.save();

    const populatedCart = await CartModel.findById(cart._id).populate(
      "products.productId",
      "name price priceAfterDiscount mainImage"
    );

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart: populatedCart,
    });
  } catch (err) {
    console.error(" addToCart error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const query = buildQuery(req, res);
    if (!query) return;

    const cart = await CartModel.findOne(query).populate(
      "products.productId",
      "name price priceAfterDiscount mainImage"
    );

    if (!cart) {
      return res.json({
        success: true,
        message: "Cart not found",
        products: [],
      });
    }

    return res.json({
      success: true,
      cartId: cart._id,
      userId: cart.userId,
      sessionId: cart.sessionId,
      products: cart.products,
      itemCount: cart.products.length,
      totalItems: cart.products.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    console.error(" getCart error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const deleteCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const query = buildQuery(req, res);
    if (!query) return;

    const cart = await CartModel.findOne(query);
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const initialLength = cart.products.length;

    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== productId.toString()
    );

    if (cart.products.length === initialLength) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in cart" });
    }

    await cart.save();

    const populatedCart = await CartModel.findById(cart._id).populate(
      "products.productId",
      "name price priceAfterDiscount mainImage"
    );

    return res.json({
      success: true,
      message: "Product deleted from cart",
      cart: populatedCart,
      deletedProductId: productId,
    });
  } catch (error) {
    console.error(" deleteCartItem error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const clearCart = async (req, res) => {
  try {
    const query = buildQuery(req, res);
    if (!query) return;

    const cart = await CartModel.findOne(query);
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    cart.products = [];
    await cart.save();

    return res.json({
      success: true,
      message: "Cart cleared successfully",
      cart: {
        _id: cart._id,
        userId: cart.userId,
        sessionId: cart.sessionId,
        products: [],
        itemCount: 0,
        totalItems: 0,
      },
    });
  } catch (error) {
    console.error(" clearCart error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const increaseQty = async (req, res) => {
  try {
    const { productId } = req.params;

    const query = buildQuery(req, res);
    if (!query) return;

    const cart = await CartModel.findOne(query);
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const item = cart.products.find(
      (p) => p.productId.toString() === productId.toString()
    );
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in cart" });
    }

    item.quantity += 1;
    await cart.save();

    const populatedCart = await CartModel.findById(cart._id).populate(
      "products.productId",
      "name price priceAfterDiscount mainImage"
    );

    return res.json({
      success: true,
      message: "Quantity increased",
      cart: populatedCart,
      updatedProduct: { productId, quantity: item.quantity },
    });
  } catch (error) {
    console.error(" increaseQty error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const decreaseQty = async (req, res) => {
  try {
    const { productId } = req.params;

    const query = buildQuery(req, res);
    if (!query) return;

    const cart = await CartModel.findOne(query);
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const item = cart.products.find(
      (p) => p.productId.toString() === productId.toString()
    );
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in cart" });
    }

    let message = "";

    if (item.quantity > 1) {
      item.quantity -= 1;
      message = "Quantity decreased";
    } else {
      cart.products = cart.products.filter(
        (p) => p.productId.toString() !== productId.toString()
      );
      message = "Product removed from cart (quantity was 1)";
    }

    await cart.save();

    const populatedCart = await CartModel.findById(cart._id).populate(
      "products.productId",
      "name price priceAfterDiscount mainImage"
    );

    return res.json({
      success: true,
      message,
      cart: populatedCart,
      updatedProduct:
        message === "Quantity decreased"
          ? { productId, quantity: item.quantity }
          : null,
    });
  } catch (error) {
    console.error(" decreaseQty error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
