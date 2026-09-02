import jwt from "jsonwebtoken";
import User from "../models/User.js";

// الحارس: بيتأكد إن اللي بيطلب معاه توكن سليم قبل ما يعدّي للـ controller
export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization;

    // التوكن بييجي بالشكل ده:  Authorization: Bearer <token>
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = header.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // التوقيع غلط أو التوكن انتهت صلاحيته
      return res.status(401).json({ message: "Not authorized, invalid or expired token" });
    }

    // التوكن سليم، بس اليوزر ممكن يكون اتمسح بعد ما اتعمل
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user; // من هنا ورايح أي controller يعرف مين اللي بيطلب
    next();
  } catch (err) {
    next(err);
  }
}
