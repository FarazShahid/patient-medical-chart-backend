const mongoose = require("mongoose");
const User = require("../models/User");
const Role = require("../models/Role");
const { encrypt } = require("../utils/encrypt"); // adjust path if needed
require("dotenv").config();

const usersToSeed = [
  {
    email: "admin@gmail.com",
    username: "admin",
    password: "123456",
    role_id: 1,
  },
  {
    email: "anna@yopmail.com",
    username: "anna",
    password: "123456",
    role_id: 1,
  },
];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const userData of usersToSeed) {
      const { email, username, password, role_id } = userData;

      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        console.log(`✅ User "${email}" already exists. Skipping.`);
        continue;
      }

      const roleData = await Role.findOne({ role_id });
      if (!roleData) {
        console.log(`❌ Role with role_id ${role_id} not found. Skipping ${email}`);
        continue;
      }

      const encryptedPassword = encrypt(password);

      const user = new User({
        email,
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
