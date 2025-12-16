import { Router } from "express";
import * as controller from './review.controller.js';

const router = Router();
router.get("/latest", controller.getLatestReviews);

export default router;
