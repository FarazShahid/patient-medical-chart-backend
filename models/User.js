const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  isTemporaryPassword: { type: Boolean, required: true, default: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
  isActive: { type: Boolean, default: true }, // ✅ added field
});

module.exports = mongoose.model("User", UserSchema);