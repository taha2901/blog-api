// بيمسك أي URL مش متعرّف
export function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// المكان الوحيد اللي بيتحول فيه أي error لرد مفهوم للمستخدم
export function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || "Internal server error";

  // JSON مكسور جاي من express.json()
  if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON body";
  }

  // أخطاء الـ validation بتاعة Mongoose - بنجمّع كل الرسايل
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }

  // إيميل مكرر - الخطأ ده جاي من MongoDB نفسها مش من Mongoose
  if (err.code === 11000) {
    status = 409;
    message = `${Object.keys(err.keyValue)[0]} already exists`;
  }

  // ID شكله غلط أصلاً (مش ObjectId صالح)
  if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (status === 500) console.error(err);

  res.status(status).json({ message });
}
