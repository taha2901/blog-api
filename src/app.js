import express from "express";

const app = express();

// يقرا الـ JSON اللي جاي في الـ request body ويحطه في req.body
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// أي URL مش متعرّف
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// معالج الأخطاء العام - لازم ياخد 4 arguments عشان Express يعرفه
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

export default app;
