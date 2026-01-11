import Category from "../../../DB/models/category.model.js";
import Product from "../../../DB/models/product.model.js";
import SearchLog from "../../../DB/models/searchLog.model.js";

const norm = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

export const search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ categories: [], products: [] });

    const regex = new RegExp(q, "i");

    const categories = await Category.find({
      $or: [{ name: regex }, { slug: regex }],
    }).select("_id name slug");

    const products = await Product.find({
      $or: [{ name: regex }, { description: regex }, { tags: regex }, { slug: regex }],
    }).select("_id name slug");

    return res.status(200).json({ categories, products });
  } catch (error) {
    return res.status(500).json({ message: "Search failed", error: error.message });
  }
};

export const logSearch = async (req, res) => {
  try {
    const q = String(req.body.q || "").trim();
    if (!q) return res.json({ ok: true });

    const regex = new RegExp(q, "i");

    const [categoriesCount, productsCount] = await Promise.all([
      Category.countDocuments({ $or: [{ name: regex }, { slug: regex }] }),
      Product.countDocuments({
        $or: [{ name: regex }, { description: regex }, { tags: regex }, { slug: regex }],
      }),
    ]);

    const totalCount = productsCount + categoriesCount;
    const userId = req.user?._id || req.id || null;

    await SearchLog.create({
      q,
      qNorm: norm(q),
      userId,
      isGuest: !userId,
      productsCount,
      categoriesCount,
      totalCount,
      found: totalCount > 0,
      source: req.body.source || "overlay",
    });

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "log failed" });
  }
};
