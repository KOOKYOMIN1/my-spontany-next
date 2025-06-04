import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  image: String,
  provider: String,
}, { timestamps: true });

// 핫리로드 시 모델 중복 방지
export default mongoose.models?.User || mongoose.model("User", UserSchema);