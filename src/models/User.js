import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // ميرجعش في نتايج الـ find إلا لو طلبته صراحة
    },
  },
  { timestamps: true } // بيضيف createdAt و updatedAt لوحده
);

// بيشتغل قبل أي save - بيعمل hash للباسورد
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return; // متعملش hash تاني لو الباسورد ماتغيرش
  this.password = await bcrypt.hash(this.password, 10);
});

// بيقارن باسورد جاي من المستخدم بالـ hash المخزّن
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// شبكة أمان: امسح الباسورد من أي رد بيتحوّل لـ JSON
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
