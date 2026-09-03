import Post from "../models/Post.js";

// بيرجّع البوست لو موجود واللي بيطلب هو صاحبه، وإلا بيرد بالخطأ المناسب
async function findOwnedPost(id, userId, res) {
  const post = await Post.findById(id);

  if (!post) {
    res.status(404).json({ message: "Post not found" });
    return null;
  }

  // author هنا ObjectId مش string، فلازم equals مش ===
  if (!post.author.equals(userId)) {
    res.status(403).json({ message: "You can only modify your own posts" });
    return null;
  }

  return post;
}

// GET /api/posts  (مفتوح)
export async function getPosts(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

    // فلترة اختيارية: ?author=<id>  أو  ?tag=node
    const filter = {};
    if (req.query.author) filter.author = req.query.author;
    if (req.query.tag) filter.tags = req.query.tag;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("author", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Post.countDocuments(filter),
    ]);

    res.json({ page, limit, total, pages: Math.ceil(total / limit), posts });
  } catch (err) {
    next(err);
  }
}

// GET /api/posts/:id  (مفتوح)
export async function getPost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name email");

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json({ post });
  } catch (err) {
    next(err);
  }
}

// POST /api/posts  (محمي)
export async function createPost(req, res, next) {
  try {
    const { title, content, tags } = req.body;

    // الكاتب بيتاخد من التوكن، مش من الـ body
    const post = await Post.create({ title, content, tags, author: req.user._id });
    await post.populate("author", "name email");

    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/posts/:id  (محمي + لصاحب البوست بس)
export async function updatePost(req, res, next) {
  try {
    const post = await findOwnedPost(req.params.id, req.user._id, res);
    if (!post) return;

    const { title, content, tags } = req.body;
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (tags !== undefined) post.tags = tags;

    await post.save(); // save عشان الـ validation تشتغل
    await post.populate("author", "name email");

    res.json({ post });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/posts/:id  (محمي + لصاحب البوست بس)
export async function deletePost(req, res, next) {
  try {
    const post = await findOwnedPost(req.params.id, req.user._id, res);
    if (!post) return;

    await post.deleteOne();

    res.json({ message: "Post deleted" });
  } catch (err) {
    next(err);
  }
}
