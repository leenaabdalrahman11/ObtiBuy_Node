import Category from "../../../DB/models/category.model.js";
import Product from "../../../DB/models/product.model.js";

export const search = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json({ categories: [], products: [] });
    }

    const regex = new RegExp(q, "i");

    const categories = await Category.find({
      $or: [{ name: regex }, { slug: regex }]
    });

    const products = await Product.find({
      $or: [{ name: regex }, { description: regex },{ tags: regex },{ slug: regex }]
    });

    res.status(200).json({ categories, products });
  } catch (error) {
    res.status(500).json({
      message: "Search failed",
      error: error.message
    });
  }
};
