import User from "../../../DB/models/user.model.js";
import Product from "../../../DB/models/product.model.js";
import Order from "../../../DB/models/order.model.js";
import slugify from "slugify";
import Category from "../../../DB/models/category.model.js";
import cloudinary from "../../utils/cloudinary.js";
import SearchLog from "../../../DB/models/searchLog.model.js";
import MonthlyTarget from "../../../DB/models/monthlyTarget.model.js";

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
    const range = (req.query.range || "week").toLowerCase();

    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    let start = new Date(now);
    start.setHours(0, 0, 0, 0);

    if (range === "month") {
      start.setDate(start.getDate() - 29); 
    } else if (range === "year") {
      start = new Date(now.getFullYear(), now.getMonth() - 11, 1); 
      start.setHours(0, 0, 0, 0);
    } else {
      start.setDate(start.getDate() - 6); 
    }

    const matchStage = {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    };

    let groupStage;
    let projectStage;

    if (range === "year") {
      groupStage = {
        $group: {
          _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
          sales: { $sum: "$finalPrice" },
        },
      };
      projectStage = {
        $project: {
          _id: 0,
          monthNum: "$_id.m",
          yearNum: "$_id.y",
          sales: 1,
        },
      };
    } else if (range === "month") {
      groupStage = {
        $group: {
          _id: {
            y: { $year: "$createdAt" },
            m: { $month: "$createdAt" },
            d: { $dayOfMonth: "$createdAt" },
          },
          sales: { $sum: "$finalPrice" },
        },
      };
      projectStage = {
        $project: {
          _id: 0,
          y: "$_id.y",
          m: "$_id.m",
          d: "$_id.d",
          sales: 1,
        },
      };
    } else {
      groupStage = {
        $group: {
          _id: {
            y: { $year: "$createdAt" },
            m: { $month: "$createdAt" },
            d: { $dayOfMonth: "$createdAt" },
          },
          sales: { $sum: "$finalPrice" },
        },
      };
      projectStage = {
        $project: {
          _id: 0,
          y: "$_id.y",
          m: "$_id.m",
          d: "$_id.d",
          sales: 1,
        },
      };
    }

    const raw = await Order.aggregate([matchStage, groupStage, projectStage]);

    const salesData = [];

    if (range === "year") {
      const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const map = new Map(raw.map(r => [`${r.yearNum}-${r.monthNum}`, r.sales]));

      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        salesData.push({
          month: monthNames[d.getMonth()],
          sales: map.get(key) || 0,
        });
      }
    } else if (range === "month") {
      const map = new Map(
        raw.map(r => [`${r.y}-${r.m}-${r.d}`, r.sales])
      );

      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const dayNum = d.getDate();
        const key = `${y}-${m}-${dayNum}`;

        const label = d.toLocaleDateString("en-US", { day: "2-digit", month: "short" }); 
        salesData.push({ date: label, sales: map.get(key) || 0 });
      }
    } else {
      const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      const map = new Map(
        raw.map(r => [`${r.y}-${r.m}-${r.d}`, r.sales])
      );

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const dayNum = d.getDate();
        const key = `${y}-${m}-${dayNum}`;

        salesData.push({
          day: weekdays[d.getDay()],
          sales: map.get(key) || 0,
        });
      }
    }

    return res.status(200).json({ message: "success", range, salesData });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const getRecentOrders = async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(15)
      .populate("userId", "userName image");
      
console.log("user sample:", recentOrders[0]?.userId);
const orders = recentOrders.map((o) => ({
  id: o._id,
  customer: o.userId?.userName || "Unknown",
  image: o.userId?.image?.secure_url || null,
  status: o.status,
  amount: o.finalPrice,
  date: o.createdAt,
}));

    return res.status(200).json({ message: "success", orders });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const getTotalRevenue = async (req, res) => {
  try {
    const range = String(req.query.range || "year"); 

    const now = new Date();
    let startDate;

    if (range === "week") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "month") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 11);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    }

    const deliveredStatus = "delivered";

    const result = await Order.aggregate([
      {
        $match: {
          status: deliveredStatus,
          createdAt: { $gte: startDate, $lte: now },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $ifNull: ["$finalPrice", 0] } },
        },
      },
    ]);

    const totalRevenue = result[0]?.totalRevenue ?? 0;

    return res.status(200).json({
      message: "success",
      range,
      from: startDate,
      to: now,
      totalRevenue,
    });
  } catch (error) {
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




function getRangeDates(range = "week") {
  const r = String(range || "week").toLowerCase();
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  let start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (r === "month") {
    start.setDate(start.getDate() - 29);
  } else if (r === "year") {
    start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setDate(start.getDate() - 6);
  }
  return { start, end, range: r };
}

function normalizeStatus(s) {
  const st = String(s || "").toLowerCase().trim();
  if (st.includes("deliverd") || st.includes("delivered") || st.includes("complete")) return "complete";
  if (st.includes("hold")) return "hold";
  return "active";
}

export const getDashboardOverview = async (req, res) => {
  try {
    const { start, end, range } = getRangeDates(req.query.range);

    const [usersCount, productsCount] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
    ]);

    const ordersInRange = await Order.find({
      createdAt: { $gte: start, $lte: end },
    })
      .select("status finalPrice total createdAt items userId")
      .populate("userId", "userName image")
      .lean();

    const totalOrders = ordersInRange.length;

    const totalRevenue = ordersInRange.reduce((acc, o) => {
      const v = Number(o.finalPrice ?? o.total ?? 0) || 0;
      return acc + v;
    }, 0);

    const recentOrdersRaw = await Order.find()
      .sort({ createdAt: -1 })
      .limit(15)
      .populate("userId", "userName image")
      .lean();

    const recentOrders = recentOrdersRaw.map((o) => ({
      id: o._id,
      customer: o.userId?.userName || "Unknown",
      image: o.userId?.image?.secure_url || null,
      status: o.status,
      amount: o.finalPrice ?? o.total ?? 0,
      date: o.createdAt,
    }));

    const saleStatus = { active: 0, complete: 0, hold: 0 };
    for (const o of ordersInRange) {
      const key = normalizeStatus(o.status);
      saleStatus[key]++;
    }


const now = new Date();
const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

const targetDoc = await MonthlyTarget.findOne({ monthKey }).lean();
const target = targetDoc?.target ?? 60000; 

const achieved = totalRevenue;
const progress = target > 0 ? Math.min(achieved / target, 1) : 0;


    let topCategories = [];
    try {
      topCategories = await Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "_id",
            as: "p",
          },
        },
        { $unwind: "$p" },
        {
          $addFields: {
            catId: { $ifNull: ["$p.categoryId", "$p.CategoryId"] },
            lineTotal: {
              $multiply: [
                { $ifNull: ["$items.quantity", 1] },
                { $ifNull: ["$items.price", "$p.priceAfterDiscount"] },
              ],
            },
          },
        },
        {
          $group: {
            _id: "$catId",
            sales: { $sum: { $ifNull: ["$lineTotal", 0] } },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "c",
          },
        },
        { $unwind: { path: "$c", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            categoryId: "$_id",
            name: { $ifNull: ["$c.name", "Unknown"] },
            sales: 1,
          },
        },
        { $sort: { sales: -1 } },
        { $limit: 4 },
      ]);
    } catch (e) {
      topCategories = [];
    }


    const trafficSources = [];

    const visitorsApprox = new Set(
      ordersInRange.map((o) => String(o.userId?._id || "")).filter(Boolean)
    ).size;

    return res.status(200).json({
      message: "success",
      range,
      from: start,
      to: end,
      kpis: {
        users: usersCount,
        products: productsCount,
        orders: totalOrders,
        revenue: totalRevenue,
        visitors: visitorsApprox,
      },
      monthlyTarget: {
        target,
        achieved,
        progress,
      },
      saleStatus,
      topCategories,
      trafficSources: {
        supported: false,
        items: trafficSources,
      },
      recentOrders,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateMonthlyTarget = async (req, res) => {
  try {
    const { monthKey, target } = req.body;

    const t = Number(target);
    if (!monthKey || !Number.isFinite(t) || t < 0) {
      return res.status(400).json({ message: "Invalid monthKey or target" });
    }

    const doc = await MonthlyTarget.findOneAndUpdate(
      { monthKey },
      { $set: { target: t, updatedBy: req.id } },
      { upsert: true, new: true }
    );

    return res.status(200).json({ message: "saved", target: doc });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

export const topFoundSearches = async (req, res) => {
  const limit = Number(req.query.limit || 10);

  const rows = await SearchLog.aggregate([
    { $match: { found: true } },
    {
      $group: {
        _id: "$qNorm",
        queries: { $addToSet: "$q" },     
        count: { $sum: 1 },
        avgResults: { $avg: "$totalCount" },
        lastAt: { $max: "$createdAt" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        qNorm: "$_id",
        examples: { $slice: ["$queries", 3] },
        count: 1,
        avgResults: { $round: ["$avgResults", 1] },
        lastAt: 1,
      },
    },
  ]);

  res.json({ rows });
};


export const topNotFoundSearches = async (req, res) => {
  const limit = Number(req.query.limit || 10);

  const rows = await SearchLog.aggregate([
    { $match: { found: false } },
    {
      $group: {
        _id: "$qNorm",
        queries: { $addToSet: "$q" },
        count: { $sum: 1 },
        lastAt: { $max: "$createdAt" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        qNorm: "$_id",
        examples: { $slice: ["$queries", 3] },
        count: 1,
        lastAt: 1,
      },
    },
  ]);

  res.json({ rows });
};

