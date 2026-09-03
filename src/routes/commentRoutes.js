import { Router } from "express";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";
import { protect } from "../middlewares/authMiddleware.js";

// mergeParams مهمة: من غيرها الراوتر ده مش هيشوف :postId
// اللي جاي من الراوتر اللي فوقه (postRoutes)
export const nestedCommentRoutes = Router({ mergeParams: true });

nestedCommentRoutes
  .route("/")
  .get(getComments)
  .post(protect, createComment);

// دي مستقلة - الكومنت له id لوحده فمش محتاجين البوست
const commentRoutes = Router();

commentRoutes
  .route("/:id")
  .patch(protect, updateComment)
  .delete(protect, deleteComment);

export default commentRoutes;
