const Role = require("../models/Role");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const {encrypt,decrypt} =require('../utils/encrypt')
// Get all users with search and limit
exports.getUsers = async (req, res) => {
    try {
        const { limit = 10, page = 1, search = "" } = req.query;
    
        // First, find matching roles (if any)
        const matchingRoles = await Role.find({
          name: { $regex: search, $options: "i" },
        }).select("_id");
    
        const roleIds = matchingRoles.map((r) => r._id);
    
        const query = {
          _id: { $ne: req.user.id },
          email: { $ne: "admin@gmail.com" },
          $or: [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { role: { $in: roleIds } },
          ],
        };
    
        const users = await User.find(query)
          .populate("role")
          .sort({ _id: -1 })
          .limit(parseInt(limit))
          .skip((page - 1) * limit)
          .lean();
          const usersWithDecryptedPasswords = users.map((user) => {
            try {
              const decryptedPassword = decrypt(user.password);
              return { ...user, decryptedPassword };
            } catch (err) {
              console.warn(`Decryption failed for user ${user._id}`);
              return { ...user, decryptedPassword: null };
            }
          });
        const total = await User?.countDocuments(query);
    
        res.json({ users:usersWithDecryptedPasswords, total });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
      }
    };

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("role");
    if (!user) return res.status(404).json({ message: "User not found" });
    try {
        user.password = decrypt(user.password);
      } catch (error) {
        user.password = null; 
      }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { username, email, role } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, role },
      { new: true }
    ).populate("role");

    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // const hashed = await bcrypt.hash(newPassword, 10);
    const encryptedPassword = encrypt(newPassword);
    
    user.password = encryptedPassword;
    user.isTemporaryPassword = false;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Activate / Deactivate user
exports.toggleUserActive = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: `User ${isActive ? "activated" : "deactivated"}`, user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
