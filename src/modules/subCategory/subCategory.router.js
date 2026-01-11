import { Router } from "express";
import {
  create,
  get,
  getActive,
  subCategoryDetails,
  updateSubCategory,
  removeSubCategory,
  getByCategory,
  getProductsBySubCategory,
} from "./subCategory.controller.js";
import fileUpload, { fileValidation } from "../../utils/multer.js";

const router = Router();

router.post(
  "/",
  fileUpload(fileValidation.image).fields([{ name: "image", maxCount: 1 }]),
  create
);

router.get("/", get);

router.get("/active", getActive);

router.get("/:id", subCategoryDetails);

router.get("/byCategory/:categoryId", getByCategory);
router.get("/:subCategoryId/products", getProductsBySubCategory);


router.put(
  "/:id",
  fileUpload(fileValidation.image).fields([{ name: "image", maxCount: 1 }]),
  updateSubCategory
);

router.delete("/:id", removeSubCategory);

export default router;
