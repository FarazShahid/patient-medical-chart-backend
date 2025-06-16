// middlewares/checkAdmin.js
const User = require("../models/User");

const checkAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.id; // req.user should be set by JWT middleware
// console.log(userId,'userId',req)
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).populate("role");

    if (!user || user.role.name !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    next();
  } catch (err) {
    console.error("Admin check error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = checkAdmin;
