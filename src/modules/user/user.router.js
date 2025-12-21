import { Router } from "express";
import * as controller from "./user.controller.js";
import { auth } from "../../middleware/auth.js";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/",
  upload.fields([{ name: "image", maxCount: 1 }]),
  controller.create
);

router.get("/profile", auth(["user", "admin"]), controller.getProfile);
router.put(
  "/profile",
  auth(["user", "admin"]),
  upload.fields([{ name: "image", maxCount: 1 }]),
  controller.updateProfile
);

router.get("/", auth(["admin"]), controller.get);

router.get("/:id", auth(["admin"]), controller.getDetails);

router.put(
  "/:id",
  auth(["admin"]),
  upload.fields([{ name: "image", maxCount: 1 }]),
  controller.update
);

router.delete("/:id", auth(["admin"]), controller.remove);

export default router;
