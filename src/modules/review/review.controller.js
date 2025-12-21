import OrderModel from "../../../DB/models/order.model.js";
import ProductModel from "../../../DB/models/product.model.js";
import reviewModel from "../../../DB/models/review.model.js";

export const create = async (req, res) => {
  const userId = req.id;
  const { productId } = req.params;
  const { comment, rating } = req.body;
  const order = await OrderModel.findOne({
    userId: userId,
    status: "delivered",
    "products.productId": productId,
  });
  if (!order) {
    return res.status(400).json({ message: "can't review this product" });
  }
  const review = await reviewModel.create({
    comment,
    rating,
    productId: productId,
    createdBy: userId,
  });
  if (!review) {
    return res.status(400).json({ message: "error while adding review" });
  }
  return res.status(201).json({ message: "success" });
};

export const getReviews = async (req, res) => {
  const { productId } = req.params;

  const product = await ProductModel.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "product not found" });
  }

  const reviews = await reviewModel
    .find({ productId })
    .populate({
      path: "createdBy",
      select: "userName name email",
    })
    .sort({ createdAt: -1 });

  return res.status(200).json({
    message: "success",
    count: reviews.length,
    reviews,
  });
};

export const getLatestReviews = async (req, res) => {
  try {
    const reviews = await reviewModel
      .find({})
      .populate("createdBy", "userName email")
      .populate("productId", "name mainImage price")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      message: "success",
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "error", error });
  }
};
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await reviewModel.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    await reviewModel.findByIdAndDelete(reviewId);
    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
