import User from "../../../DB/models/user.model.js";
import Product from "../../../DB/models/product.model.js";
import Order from "../../../DB/models/order.model.js";
import slugify from "slugify";
import Category from "../../../DB/models/category.model.js";

export const getUsersCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    return res.status(200).json({ message: "success", count });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getProductsCount = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    return res.status(200).json({ message: "success", count });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getOrdersCount = async (req, res) => {
  try {
    const count = await Order.countDocuments();
    return res.status(200).json({ message: "success", count });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getRevenue = async (req, res) => {
  try {
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    return res.status(200).json({ message: "success", totalRevenue });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSalesData = async (req, res) => {
  try {
    const salesData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const start = new Date(day.setHours(0, 0, 0, 0));
      const end = new Date(day.setHours(23, 59, 59, 999));

      const orders = await Order.find({
        createdAt: { $gte: start, $lte: end },
      });
      const total = orders.reduce((sum, order) => sum + order.finalPrice, 0);

      const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
        start.getDay()
      ];
      salesData.push({ day: weekday, sales: total });
    }
    return res.status(200).json({ message: "success", salesData });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getRecentOrders = async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "userName");
    const orders = recentOrders.map((o) => ({
      id: o._id,
      customer: o.userId.userName,
      status: o.status,
      amount: o.finalPrice,
    }));
    return res.status(200).json({ message: "success", orders });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const getTotalRevenue = async (req, res) => {
  try {
    console.log("GET /dashboard/orders/revenue called");

    const result = await Order.aggregate([
      { $match: { status: "deliverd" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $ifNull: ["$finalPrice", 0] } },
        },
      },
    ]);

    console.log("Aggregation result:", result);

    const totalRevenue = result[0]?.totalRevenue ?? 0;
    console.log("Computed totalRevenue:", totalRevenue);

    return res.status(200).json({ message: "success", totalRevenue });
  } catch (error) {
    console.error("getTotalRevenue error:", error);
    return res.status(500).json({ message: error.message });
  }
};
export const testFetchOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .limit(20)
      .select("_id status finalPrice createdAt")
      .lean();
    console.log("Fetched orders count:", orders.length);
    console.log("Sample orders:", orders.slice(0, 5));
    return res
      .status(200)
      .json({ message: "success", count: orders.length, orders });
  } catch (error) {
    console.error("testFetchOrders error:", error);
    return res.status(500).json({ message: error.message });
  }
};
export const update = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }

    if (req.body.categoryId) {
      const checkCategory = await Category.findById(req.body.categoryId);

      console.log("checkCategory:", checkCategory);

      if (!checkCategory) {
        return res.status(404).json({ message: "Category not found" });
      }

      req.body.CategoryId = req.body.categoryId;

      req.body.categoryName = checkCategory?.name ?? "";
    }

    if (req.body.tags) {
      let tags = [];

      if (Array.isArray(req.body.tags)) tags = req.body.tags;
      else if (typeof req.body.tags === "string") {
        tags = req.body.tags
          .split(",")
          .map((tag) => tag.trim().replace(/^"+|"+$/g, ""))
          .filter(Boolean);
      }

      req.body.tags = tags;
    }

    if (req.body.stock !== undefined) {
      const numericStock = Number(req.body.stock);
      if (Number.isNaN(numericStock) || numericStock < 0) {
        return res
          .status(400)
          .json({ message: "stock must be a positive number" });
      }
      req.body.stock = numericStock;
    }

    if (req.files?.mainImage?.[0]) {
      if (product.mainImage?.public_id) {
        await cloudinary.uploader.destroy(product.mainImage.public_id);
      }

      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files.mainImage[0].path,
        {
          folder: `${process.env.APP_NAME}/products/${
            req.body.name || product.name
          }`,
        }
      );

      req.body.mainImage = { secure_url, public_id };
    }

    if (req.files?.subImages?.length) {
      if (product.subImages?.length) {
        for (const img of product.subImages) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }

      req.body.subImages = [];
      for (const file of req.files.subImages) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          file.path,
          {
            folder: `${process.env.APP_NAME}/products/${
              req.body.name || product.name
            }/subImages`,
          }
        );
        req.body.subImages.push({ secure_url, public_id });
      }
    }

    if (req.body.price || req.body.discount) {
      const price = req.body.price ?? product.price;
      const discount = req.body.discount ?? product.discount;
      req.body.priceAfterDiscount = price - (price * discount) / 100;
    }

    req.body.updatesBy = req.id;

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return res.status(200).json({ message: "success", updatedProduct });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};
