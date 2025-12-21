import ProductModel from "../../../DB/models/product.model.js";
import cloudinary from "../../utils/cloudinary.js";
import categoryModel from "../../../DB/models/category.model.js";
import slugify from "slugify";
import subcategoryModel from "../../../DB/models/subcategory.model.js";
import SettingsModel from "../../../DB/models/settings.model.js";

export const create = async (req, res) => {
  const { name, CategoryId, discount, price, stock, subCategoryId } = req.body;

  const checkCategory = await categoryModel.findById(CategoryId);
  if (!checkCategory) {
    return res.status(404).json({ message: "category not found" });
  }

  if (subCategoryId) {
    const checkSubCategory = await subcategoryModel.findById(subCategoryId);
    if (!checkSubCategory) {
      return res.status(404).json({ message: "subCategory not found" });
    }
    req.body.subCategoryId = subCategoryId;
  } else {
    req.body.subCategoryId = null;
  }

  req.body.slug = slugify(name, { lower: true, strict: true });

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.mainImage[0].path,
    { folder: `${process.env.APP_NAME}/products/${name}` }
  );
  req.body.mainImage = { secure_url, public_id };

  req.body.subImages = [];
  if (req.files.subImages) {
    for (const file of req.files.subImages) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        { folder: `${process.env.APP_NAME}/products/${name}/subImages` }
      );
      req.body.subImages.push({ secure_url, public_id });
    }
  }

  let tags = [];
  if (req.body.tags) {
    if (Array.isArray(req.body.tags)) {
      tags = req.body.tags;
    } else if (typeof req.body.tags === "string") {
      tags = req.body.tags
        .split(",")
        .map((tag) => tag.trim().replace(/^"+|"+$/g, ""))
        .filter(Boolean);
    }
  }

  const numericStock = Number(stock);
  if (Number.isNaN(numericStock) || numericStock < 0) {
    return res.status(400).json({ message: "stock must be a positive number" });
  }

  req.body.stock = numericStock;
  req.body.tags = tags;
  req.body.createdBy = req.id;
  req.body.updatesBy = req.id;
  req.body.CategoryId = CategoryId;
  req.body.priceAfterDiscount = price - (price * (discount || 0)) / 100;

  const product = await ProductModel.create(req.body);
  return res.status(201).json({ message: "success", product });
};

export const get = async (req, res) => {
  try {
    const products = await ProductModel.find({})
      .select(
        "name stock description mainImage price discount CategoryId priceAfterDiscount tags subCategoryId"
      )
      .populate("CategoryId", "name")
      .populate("subCategoryId", "name");

    return res.status(200).json({ message: "success", products });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getActive = async (req, res) => {
  const products = await ProductModel.find({ status: "active" }).select(
    "name stock description mainImage price discount CategoryId priceAfterDiscount tags"
  );
  return res.status(200).json({ message: "success", products });
};
export const getDetails = async (req, res) => {
  const { id } = req.params;
  const products = await ProductModel.findById(id).populate("reviews");
  return res.status(200).json({ message: "success", products });
};

export const remove = async (req, res) => {
  const { id } = req.params;
  const product = await ProductModel.findByIdAndDelete(id);
  if (!product) {
    return res.status(404).json({ message: "not found" });
  }

  await cloudinary.uploader.destroy(product.mainImage.public_id);
  if (product.subImages && product.subImages.length) {
    for (const img of product.subImages) {
      await cloudinary.uploader.destroy(img.public_id);
    }
  }
  return res.status(200).json({ message: "success", product });
};
export const removeSubImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ message: "public_id is required" });
    }

    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const exists = product.subImages?.find(
      (img) => img.public_id === public_id
    );
    if (!exists) {
      return res.status(404).json({ message: "Image not found" });
    }

    await cloudinary.uploader.destroy(public_id);

    product.subImages = product.subImages.filter(
      (img) => img.public_id !== public_id
    );
    await product.save();

    return res.status(200).json({ message: "Sub image removed", product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

export const getProductsByAdminTag = async (req, res) => {
  try {
    const settings = await SettingsModel.findOne();
    const tag = settings?.homeProductsTag?.trim();

    if (!tag) {
      return res
        .status(404)
        .json({ message: "No tag set", tag: null, products: [] });
    }

    const products = await ProductModel.find({
      status: "active",
      tags: { $regex: `^${tag}$`, $options: "i" },
    }).limit(8);

    return res.status(200).json({ tag, products });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

export const getByTags = async (req, res) => {
  try {
    let { tags, match = "any" } = req.query;

    let tagsArr = [];
    if (Array.isArray(tags)) tagsArr = tags;
    else if (typeof tags === "string")
      tagsArr = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

    if (!tagsArr.length) {
      return res.status(400).json({ message: "tags are required" });
    }

    const filter =
      match === "all"
        ? { tags: { $all: tagsArr } }
        : { tags: { $in: tagsArr } };

    const products = await ProductModel.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({ message: "success", products });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};
export const getAllTags = async (req, res) => {
  const products = await ProductModel.find(
    { tags: { $exists: true, $ne: [] } },
    { tags: 1, _id: 0 }
  );

  const tags = [
    ...new Set(
      products.flatMap((p) => p.tags || []).map((t) => t.trim().toLowerCase())
    ),
  ];

  res.status(200).json({ tags });
};
