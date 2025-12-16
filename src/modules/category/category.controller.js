import slugify from "slugify";
import categoryModel from "../../../DB/models/category.model.js";
import userModel from "../../../DB/models/user.model.js";
import cloudinary from "../../utils/cloudinary.js";
import subcategoryModel from "../../../DB/models/subcategory.model.js";
import { subCategoryDetails } from "../subCategory/subCategory.controller.js";
import CategoryModel from "../../../DB/models/category.model.js";

export const create = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.image[0].path,
    { folder: `${process.env.APP_NAME}/categories/${name}` }
  );

  req.body.image = { secure_url, public_id };
  req.body.slug = slugify(name, { lower: true, strict: true, trim: true });
  req.body.createdBy = req.id;
  req.body.updatesBy = req.id;

  const category = await categoryModel.create(req.body);
  return res.status(201).json({ message: "success", category });
};

export const get = async (req, res) => {
  try {
    const categories = await categoryModel.find({});

    const categoriesWithSubs = await Promise.all(
      categories.map(async (cat) => {
        const subCategoryDetails = await subcategoryModel.find({
          category: cat._id,
        });
        return { ...cat.toObject(), subCategoryDetails };
      })
    );

    return res
      .status(200)
      .json({ message: "success", categories: categoriesWithSubs });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const getActive = async (req, res) => {
  const categories = await categoryModel.find({ status: "active" });
  return res.status(200).json({ message: "success", categories });
};

export const details = async (req, res) => {
  const { id } = req.params;

  const category = await CategoryModel.findById(id);
  if (!category) {
    return res.status(404).json({ message: "category not found" });
  }

  const subCategories = await subcategoryModel.find({ category: id });

  return res.status(200).json({
    message: "category success",
    category,
    subCategories,
  });
};

export const update = async (req, res) => {
  const { id } = req.params;
  const { name, subCategories } = req.body;
  const userId = req.id;

  const category = await categoryModel.findById(id);
  if (!category) {
    return res.status(404).json({ message: "category not found" });
  }

  category.name = name;
  category.updatesBy = userId;
  category.slug = slugify(name, { lower: true, strict: true, trim: true });
  category.status = req.body.status;

  await category.save();

  await subcategoryModel.updateMany({ category: id }, { category: null });

  if (Array.isArray(subCategories) && subCategories.length > 0) {
    await subcategoryModel.updateMany(
      { _id: { $in: subCategories } },
      { category: id }
    );
  }

  return res.status(200).json({ message: "update successful" });
};

export const remove = async (req, res) => {
  const { id } = req.params;

  const category = await categoryModel.findByIdAndDelete(id);
  if (!category) {
    return res.status(404).json({ message: "category not found" });
  }

  await cloudinary.uploader.destroy(category.image.public_id);

  return res.status(200).json({ message: "category is removed" });
};
