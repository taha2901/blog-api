import { Router } from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

// مفتوحة للكل
router.post("/register", register);
router.post("/login", login);

// محمية - protect بتشتغل الأول، ولو عدّت بس بيوصل لـ getMe
router.get("/me", protect, getMe);

export default router;
