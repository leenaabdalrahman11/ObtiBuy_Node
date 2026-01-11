import express from "express";
import * as controller from "./search.controller.js";

const router = express.Router();

router.get("/", controller.search);
router.post("/log", controller.logSearch);


export default router;
