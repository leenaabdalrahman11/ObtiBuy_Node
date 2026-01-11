import cors from "cors";
import connectDb from "../DB/connection.js";
import { sendEmail } from "./utils/sendEmail.js";

import authRouter from "./modules/auth/auth.router.js";
import categoryRouter from "./modules/category/category.router.js";
import productRouter from "./modules/Product/product.router.js";
import couponRouter from "./modules/coupon/coupon.router.js";
import cartRouter from "./modules/cart/cart.router.js";
import orderRouter from "./modules/order/order.router.js";
import globalReviewRouter from "./modules/review/globalReview.router.js";
import subCategoryRouter from "./modules/subCategory/subCategory.router.js";
import dashboardRoutes from "./modules/dashboard/dashboard.router.js";
import reviewRouter from "./modules/review/review.router.js";
import userRouter from "./modules/user/user.router.js";
import settingsRouter from "./modules/settings/settings.router.js";
import searchRouter from "./modules/search/search.routes.js";
import promoSectionRoutes from "./modules/promoSections/promoSections.router.js";
import homeSectionRoutes from "./modules/homeSection/homeSection.routes.js";

const initApp = async (app, express) => {
  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "https://react-opti-buy-ocui.vercel.app",
        "https://react-opti-buy-ocui.vercel.app/",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json());

  await connectDb();

  app.get("/", (req, res) => res.status(200).json({ message: "welcome..." }));

  app.use("/auth", authRouter);
  app.use("/categories", categoryRouter);
  app.use("/products", productRouter);
  app.use("/coupon", couponRouter);
  app.use("/cart", cartRouter);
  app.use("/order", orderRouter);
  app.use("/reviews", reviewRouter);
  app.use("/reviews", globalReviewRouter);
  app.use("/dashboard", dashboardRoutes);
  app.use("/users", userRouter);
  app.use("/settings", settingsRouter);

  app.use("/subcategory", subCategoryRouter);
  app.use("/search", searchRouter);
  app.use("/api/promo-sections", promoSectionRoutes);
  app.use("/api/home-sections", homeSectionRoutes);

  app.get("/test-email", async (req, res) => {
    try {
      const info = await sendEmail(
        process.env.TEST_EMAIL || process.env.SENDER_EMAIL,
        "Brevo Test",
        "<h1>It works</h1>"
      );
      res.status(200).json({ ok: true, messageId: info?.messageId });
    } catch (e) {
      res.status(500).json({
        ok: false,
        name: e?.name,
        message: e?.message,
        code: e?.code,
        response: e?.response,
        responseCode: e?.responseCode,
      });
    }
  });
};

export default initApp;
