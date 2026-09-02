import jwt from "jsonwebtoken";
import User from "../models/User.js";

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// POST /api/auth/register
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const user = await User.create({ name, email, password });

    res.status(201).json({ user, token: signToken(user._id) });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // لازم select("+password") عشان الباسورد مخفي بالافتراض في الـ model
    const user = await User.findOne({ email }).select("+password");

    // نفس الرسالة في الحالتين - عشان محدش يعرف الإيميل ده مسجّل ولا لأ
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({ user, token: signToken(user._id) });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me  (محمي)
export async function getMe(req, res) {
  // protect حطّ اليوزر هنا خلاص، مش محتاجين نروح للداتابيز تاني
  res.json({ user: req.user });
}
