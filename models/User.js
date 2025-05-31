import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  image: String,
  provider: String,
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);