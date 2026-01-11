import express from "express";
import * as dashboardController from "./dashboard.controller.js";
import fileUpload, { fileValidation } from "../../utils/multer.js";

const router = express.Router();

router.get("/users/count", dashboardController.getUsersCount);
router.get("/products/count", dashboardController.getProductsCount);
router.get("/orders/count", dashboardController.getOrdersCount);
router.get("/orders/revenue", dashboardController.getRevenue);
router.get("/orders/sales", dashboardController.getSalesData);
router.get("/orders/recent", dashboardController.getRecentOrders);
router.get("/orders/totalrevenue", dashboardController.getTotalRevenue);
router.get("/orders/test-fetch", dashboardController.testFetchOrders);
router.get("/overview", dashboardController.getDashboardOverview);
router.get("/analytics/top-found", dashboardController.topFoundSearches);
router.get("/analytics/top-not-found", dashboardController.topNotFoundSearches);
router.put("/target", dashboardController.updateMonthlyTarget);


router.put(
  "/products/update/:id",

  fileUpload(fileValidation.image).fields([
    { name: "mainImage", maxCount: 1 },
    { name: "subImages", maxCount: 4 },
  ]),
  dashboardController.update
);

export default router;
