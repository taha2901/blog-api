import { Router } from "express";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/postController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router
  .route("/")
  .get(getPosts)              // مفتوح للكل
  .post(protect, createPost); // لازم تكون مسجّل

router
  .route("/:id")
  .get(getPost)                 // مفتوح للكل
  .patch(protect, updatePost)   // لصاحب البوست بس
  .delete(protect, deletePost); // لصاحب البوست بس

export default router;
