import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

// GET /api/posts/:postId/comments   (مفتوح)
export async function getComments(req, res, next) {
  try {
    // نتأكد إن البوست موجود الأول، عشان نفرّق بين
    // "بوست مش موجود" و "بوست موجود بس مفيهوش كومنتات"
    const exists = await Post.exists({ _id: req.params.postId });
    if (!exists) return res.status(404).json({ message: "Post not found" });

    const comments = await Comment.find({ post: req.params.postId })
      .populate("author", "name email")
      .sort({ createdAt: 1 }); // الأقدم الأول - ترتيب المحادثة الطبيعي

    res.json({ total: comments.length, comments });
  } catch (err) {
    next(err);
  }
}

// POST /api/posts/:postId/comments   (محمي)
export async function createComment(req, res, next) {
  try {
    const exists = await Post.exists({ _id: req.params.postId });
    if (!exists) return res.status(404).json({ message: "Post not found" });

    const comment = await Comment.create({
      content: req.body.content,
      post: req.params.postId,   // من الـ URL
      author: req.user._id,      // من التوكن
    });
    await comment.populate("author", "name email");

    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/comments/:id   (لصاحب الكومنت بس)
export async function updateComment(req, res, next) {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (!comment.author.equals(req.user._id)) {
      return res.status(403).json({ message: "You can only edit your own comments" });
    }

    if (req.body.content !== undefined) comment.content = req.body.content;
    await comment.save();
    await comment.populate("author", "name email");

    res.json({ comment });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/comments/:id   (لصاحب الكومنت أو صاحب البوست)
export async function deleteComment(req, res, next) {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const post = await Post.findById(comment.post);

    // صاحب البوست له حق يمسح أي كومنت على بوسته
    const isCommentAuthor = comment.author.equals(req.user._id);
    const isPostAuthor = post && post.author.equals(req.user._id);

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ message: "Not allowed to delete this comment" });
    }

    await comment.deleteOne();

    res.json({ message: "Comment deleted" });
  } catch (err) {
    next(err);
  }
}
