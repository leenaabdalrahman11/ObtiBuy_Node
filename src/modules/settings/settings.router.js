import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import * as controller from "./settings.controller.js";

const router = Router();

router.get("/", controller.getHomeProductsTag);
router.put("/", auth(["admin"]), controller.setHomeProductsTag);

export default router;