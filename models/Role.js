const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
  role_id: { type: Number, unique: true },
  name: { type: String, required: true, unique: true },
  description: { type: String },
});

module.exports = mongoose.model("Role", RoleSchema);