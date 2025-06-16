// seedRoles.js
const mongoose = require("mongoose");
const Role = require("../models/Role"); // adjust path as needed
require("dotenv").config();

// MongoDB connection string

async function seedRoles() {
  try {
       await mongoose.connect(process.env.MONGO_URI);
    const existingAdmin = await Role.findOne({ name: "admin" });
    const existingUser = await Role.findOne({ name: "user" });

    let lastRole = await Role.findOne().sort({ role_id: -1 });
    let nextRoleId = lastRole ? lastRole.role_id + 1 : 1;

    if (!existingAdmin) {
      await Role.create({
        role_id: nextRoleId++,
        name: "admin",
        description: "Administrator role",
      });
      console.log("Admin role created");
    } else {
      console.log("Admin role already exists");
    }

    if (!existingUser) {
      await Role.create({
        role_id: nextRoleId++,
        name: "user",
        description: "Standard user role",
      });
      console.log("User role created");
    } else {
      console.log("User role already exists");
    }

    await mongoose.disconnect();
    console.log("Done seeding roles.");
  } catch (err) {
    console.error("Error seeding roles:", err);
    process.exit(1);
  }
}

seedRoles();
