import express from "express";
import * as controller from "./auth.controller.js";
import { Router } from "express";

const router = Router();

router.post("/register", controller.register);
router.get('/confirmEmail/:token',controller.confirmEmail);
router.post('/login',controller.login);
export default router;
