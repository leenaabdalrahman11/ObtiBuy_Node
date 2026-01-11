import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import * as controller from "./cart.controller.js";
import fileUpload, { fileValidation } from "../../utils/multer.js";
const router = Router();

router.post("/",controller.addToCart);
router.get("/", controller.getCart);

router.delete("/:productId", controller.deleteCartItem);

router.delete("/",controller.clearCart);
router.patch("/increase/:productId", controller.increaseQty);
router.patch("/decrease/:productId",  controller.decreaseQty);

export default router;
