const mongoose = require("mongoose");
const fs = require("fs");
const User = require("../models/User");
const Role = require("../models/Role");
const { encrypt } = require("../utils/encrypt"); // adjust path if needed
require("dotenv").config();

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to DB");

    // Load users from file
    const rawData = fs.readFileSync("./transformedUsers.json", "utf-8");
    const usersToSeed = JSON.parse(rawData);

    for (const userData of usersToSeed) {
      const { email, username, password, role_id } = userData;

      // Skip empty or invalid entries
      if (!email || !username || !password || !role_id) {
        console.log(`⚠️ Skipping invalid entry:`, userData);
        continue;
      }

      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username }],
      });

      if (existingUser) {
        console.log(`✅ User "${email}" already exists. Skipping.`);
        continue;
      }

      const roleData = await Role.findOne({ role_id });
      if (!roleData) {
        console.log(`❌ Role "${role_id}" not found. Skipping ${email}`);
        continue;
      }

      const encryptedPassword = encrypt(password);

      const user = new User({
        email: email.toLowerCase(),
        username,
        password: encryptedPassword,
        isTemporaryPassword: roleData.name.toLowerCase() === "admin",
        role: roleData._id,
      });

      await user.save();
      console.log(`✅ User "${email}" created successfully.`);
    }

    await mongoose.disconnect();
    console.log("🎉 Done seeding users.");
  } catch (err) {
    console.error("❌ Error seeding users:", err);
    process.exit(1);
  }
}

seedUsers();
