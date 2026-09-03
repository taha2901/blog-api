import mongoose from "mongoose";
import Comment from "./Comment.js";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [120, "Title must be at most 120 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minlength: [10, "Content must be at least 10 characters"],
    },
    // بنخزّن الـ id بتاع اليوزر بس، مش بياناته
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // بيسرّع البحث بـ "بوستات فلان"
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// لما البوست يتمسح، امسح كومنتاته معاه عشان ما يفضلوش أيتام في الداتابيز
postSchema.pre("deleteOne", { document: true, query: false }, async function () {
  await Comment.deleteMany({ post: this._id });
});

export default mongoose.model("Post", postSchema);
