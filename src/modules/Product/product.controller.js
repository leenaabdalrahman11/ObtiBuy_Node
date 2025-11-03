import ProductModel from "../../../DB/models/product.model.js";
import cloudinary from "../../utils/cloudinary.js";
import categoryModel from '../../../DB/models/category.model.js';
import slugify from "slugify";

export const create = async (req, res) => {
    const { name, categoryId } = req.body;
    const checkCategory = await categoryModel.findById(categoryId);
    if (!checkCategory) {
        return res.status(404).json({ message: "category not found" });
    }
    req.body.slug = slugify(name);

    req.body.subImages = [];

    // ✅ تصحيح الشرط + تصحيح اسم المتغير داخل اللوب
    if (req.files && req.files.subImages) {
        for (const file of req.files.subImages) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path);
            req.body.subImages.push({ secure_url, public_id });
        }
    }

    return res.json(req.body.subImages);

    req.body.mainImage = { secure_url, public_id };
    req.body.createdBy = req.id;
    req.body.updatedAt = req.id;

    ProductModel.create(req.body);
    return res.json("create");
}
