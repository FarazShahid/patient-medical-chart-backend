const User = require("../models/User");
const { createToken } = require("../utils/jwt");
const bcrypt = require("bcryptjs");
const { logToFile } = require("../utils/logger");
const Role = require("../models/Role");
const jwt = require('jsonwebtoken'); // Only if not already imported
const SECRET = process.env.JWT_SECRET; // Or however you store your secret
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ✅ Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ error: "Your account is inactive. Please contact admin." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.isTemporaryPassword) {
      logToFile(`${email} used temporary password`, "Auth");
      return res.status(307).json({ redirect: true, email: user.email });
    }

    const token = createToken({
      id: user._id,
      email: user.email,
      username: user.username,
    });

    logToFile(`${email} logged in`, "Auth");

    const populatedUser = await User.findById(user._id)
      .populate("role", "role_id name description -_id")
      .select("email username role");

    res.json({
      token,
      email: populatedUser.email,
      username: populatedUser.username,
      role: populatedUser.role,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};


const registerUser = async (req, res) => {
  try {
    const { email, password, username, role } = req.body;
    if ((!email || !password || !username, !role)) {
      return res
        .status(400)
        .json({ error: "Bad request missing a required field" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "Email or username already exists" });
    }
    const roleData = await Role.findOne({ role_id: role });
    if (!roleData) {
      return res.status(400).json({ error: "Invalid role provided" });
    }

    // Set isTemporaryPassword to true only if role is 'admin'
    const isTemporaryPassword = roleData.name.toLowerCase() === "admin";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      isTemporaryPassword,
      role: roleData._id,
    });
    const userObject = user.toObject();
    delete userObject.password;

    // Replace `role` ObjectId with role details
    userObject.role = {
      role_id: roleData.role_id,
      name: roleData.name,
    };
    await user.save();
    logToFile(`${email} new user created`, "Auth");
    res.status(201).json({
      message: "User registered successfully",
      user: userObject,
    });
    console.log("user", user);
  } catch (err) {
    console.log("Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // 1. Find the user whose password is to be reset
    const user = await User.findOne({ email }).populate('role');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. If the user is not an admin, check if requester is admin
    if (user.role.name !== 'admin') {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const requestingUser = await User.findById(decoded.id).populate('role');

        if (!requestingUser || requestingUser.role.name !== 'admin') {
          return res.status(403).json({ error: "Access denied. Admin only." });
        }
      } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }
    }

    // 3. Reset password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    user.isTemporaryPassword = false;
    await user.save();

    logToFile(`${email} password reset`, "Auth");
    return res.status(200).json({ message: "Password reset successful" });

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = {
  login,
  registerUser,
  resetPassword,
};
