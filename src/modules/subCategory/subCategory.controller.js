import slugify from "slugify";
import subCategoryModel from "../../../DB/models/subcategory.model.js";
import userModel from "../../../DB/models/user.model.js";
import cloudinary from "../../utils/cloudinary.js";
const addDefaultImage = (sub) => {
  if (!sub.image) {
    sub.image = {
      secure_url: "/images/default-avatar.png",
      public_id: null,
    };
  }
  return sub;
};

export const create = async (req, res) => {
  const { name, categoryId } = req.body;

  if (!name) {
    return res.status(400).json({ message: "SubCategory name is required" });
  }

  if (!categoryId) {
    return res.status(400).json({ message: "Parent categoryId is required" });
  }

  let imageData = { secure_url: "/images/default-avatar.png", public_id: null };

  if (req.files?.image?.[0]) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files.image[0].path,
      { folder: `${process.env.APP_NAME}/subcategories/${name}` }
    );
    imageData = { secure_url, public_id };
  }

  const subCategory = await subCategoryModel.create({
    ...req.body,
    slug: slugify(name, { lower: true, strict: true, trim: true }),
    category: categoryId,
    createdBy: req.id,
    updatesBy: req.id,
    image: imageData,
  });

  return res.status(201).json({ message: "success", subCategory });
};

export const get = async (req, res) => {
  const subCategories = await subCategoryModel.find({});
  return res.status(200).json({ message: "success", subCategories });
};

export const getActive = async (req, res) => {
  const subCategories = await subCategoryModel.find({ isActive: "true" });
  return res.status(200).json({ message: "success", subCategories });
};

export const subCategoryDetails = async (req, res) => {
  const { id } = req.params;
  const subCategory = await subCategoryModel.findById(id);
  if (!subCategory) {
    return res.status(404).json({ message: "subCategory not found" });
  }
  return res.status(200).json({ message: "subCategory success", subCategory });
};

export const updateSubCategory = async (req, res) => {
  const { id } = req.params;
  const { name, isActive } = req.body;
  const userId = req.id;

  const subCategory = await subCategoryModel.findById(id);
  if (!subCategory)
    return res.status(404).json({ message: "subCategory not found" });

  const newSlug = slugify(name, { lower: true, strict: true, trim: true });

  const exists = await subCategoryModel.findOne({
    slug: newSlug,
    _id: { $ne: id },
  });
  if (exists)
    return res
      .status(409)
      .json({ message: "Slug already exists for another subcategory" });

  subCategory.name = name;
  subCategory.slug = newSlug;
  subCategory.isActive = isActive;
  subCategory.updatesBy = userId;

  if (req.files?.image?.[0]) {
    if (subCategory.image?.public_id) {
      await cloudinary.uploader.destroy(subCategory.image.public_id);
    }

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files.image[0].path,
      { folder: `${process.env.APP_NAME}/subcategories/${name}` }
    );
    subCategory.image = { secure_url, public_id };
  }

  await subCategory.save();
  return res.status(200).json({ message: "update", subCategory });
};

export const removeSubCategory = async (req, res) => {
  const { id } = req.params;
  const subCategory = await subCategoryModel.findByIdAndDelete(id);
  if (!subCategory) {
    return res.status(404).json({ message: "subCategory not found" });
  }

  if (subCategory.image?.public_id) {
    await cloudinary.uploader.destroy(subCategory.image.public_id);
  }

  return res.status(200).json({ message: "subCategory is removed" });
};
export const getByCategory = async (req, res) => {
  const { categoryId } = req.params;
  const subCategories = await subCategoryModel.find({ category: categoryId });
  return res.status(200).json({ subCategories });
};
