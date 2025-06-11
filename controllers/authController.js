const User = require("../models/User");
const { createToken } = require("../utils/jwt");
const bcrypt = require("bcryptjs");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (user.isTemporaryPassword) {
      return res.status(307).json({ redirect: true, email: user.email });
    }
    const token = createToken({
      id: user._id,
      email: user.email,
      username: user.username,
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const registerUser = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      isTemporaryPassword: true,
    });
    await user.save();

    console.log("user", user);

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    console.log("Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ error: "User not found" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    user.isTemporaryPassword = false;
    await user.save();
    return res.status(200).json({ message: "Password reset successfull" });
  } catch (err) {
    console.log("Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  login,
  registerUser,
  resetPassword,
};
