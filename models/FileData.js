const mongoose = require("mongoose");

const fileDataSchema = new mongoose.Schema(
  {
    recordId: String,
    filename: String,
    path: String,
    name: String,
    dob: String,
    address: String,
    gender: String,
    cityStateZip: String
  },
  { timestamps: true }
);

fileDataSchema.index({ filename: "text" });
fileDataSchema.index({ name: "text" });
fileDataSchema.index({ dob: "text" });
fileDataSchema.index({ address: "text" });
fileDataSchema.index({ recordId: "text" });
fileDataSchema.index({ name: 1 });
fileDataSchema.index({ recordId: 1 });
module.exports = mongoose.model("FileData", fileDataSchema);
