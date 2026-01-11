import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import * as controller from "./order.controller.js";

const router = Router();

router.get("/dashboard/sales", auth(["admin"]), controller.getWeeklySales);
router.get("/dashboard/recent", auth(["admin"]), controller.getRecentOrders);

router.post("/", auth(["user"]), controller.create);
router.get("/", auth(["user"]), controller.getUserOrders);

router.patch("/changeStatus/:orderId", auth(["admin"]), controller.changeStatus);
router.patch("/:orderId/confirm-received", auth(["user"]), controller.confirmReceived);

router.get("/:status", auth(["admin"]), controller.getOrdersByStatus);

export default router;
