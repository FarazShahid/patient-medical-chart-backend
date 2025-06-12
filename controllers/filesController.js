const FileData = require("../models/FileData");
const { logToFile } = require("../utils/logger");

exports.searchFiles = async (req, res) => {
  try {
    const {
      name,
      dob,
      filename,
      address,
      gender,
      cityStateZip,
      recordId,
      page = 1,
      limit = 25,
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};

    if (name) query.name = { $regex: name, $options: "i" };
    if (dob) query.dob = { $regex: dob, $options: "i" };
    if (filename) query.filename = { $regex: filename, $options: "i" };
    if (address) query.address = { $regex: address, $options: "i" };
    if (gender) query.gender = { $regex: gender, $options: "i" };
    if (cityStateZip)
      query.cityStateZip = { $regex: cityStateZip, $options: "i" };
    if (recordId) query.recordId = { $regex: recordId, $options: "i" }; // ✅ FIXED: keep it as string-based regex

    const [results, total] = await Promise.all([
      FileData.find(query).skip(skip).limit(parseInt(limit)),
      FileData.countDocuments(query),
    ]);

    res.json({
      total,
      page: parseInt(page),
      pageSize: parseInt(limit),
      results,
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error during search." });
  }
};

exports.getAllFiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
      FileData.find().skip(skip).limit(limit),
      FileData.countDocuments(),
    ]);

    res.json({
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
      results: files,
    });
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ message: "Server error while fetching files." });
  }
};
exports.pdfFileActivity = async (req, res) => {
  try {
    const user = req.user?.email || "Guest";
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({ message: "File path is required." });
    }
    logToFile(`${user} opened PDF: ${filePath}`, "Activity");
    res.status(200).json({ message: "Activity logged." });
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ message: "Server error while fetching files." });
  }
};
