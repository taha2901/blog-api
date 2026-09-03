import express from "express";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// يقرا الـ JSON اللي جاي في الـ request body ويحطه في req.body
app.use(express.json());

// في Express 5 لو مفيش body أصلاً، req.body بيفضل undefined
// السطر ده بيخليها {} عشان الـ controllers ما تقعش وهي بتقرا منها
app.use((req, res, next) => {
  if (!req.body) req.body = {};
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// لازم يفضلوا آخر حاجة، وبالترتيب ده
app.use(notFound);
app.use(errorHandler);

export default app;
