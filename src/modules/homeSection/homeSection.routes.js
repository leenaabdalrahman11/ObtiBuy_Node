import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import fileUpload, { fileValidation } from "../../utils/multer.js";
import {
  getSectionByKey,
  upsertSectionByKey,
} from "./homeSection.controller.js";

const router = Router();

router.get("/:key", getSectionByKey);

router.put(
  "/:key",
  auth(["admin"]),
  fileUpload(fileValidation.image).single("image"),
  upsertSectionByKey
);

export default router;
