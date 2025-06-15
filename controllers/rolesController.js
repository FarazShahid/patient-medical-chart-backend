const Role = require("../models/Role");
const User = require("../models/User");

// Create Role (with auto-incremented role_id)
exports.createRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Role name is required" });
    }

    const existing = await Role.findOne({ name });
    if (existing) {
      return res.status(409).json({ error: "Role name already exists" });
    }

    const lastRole = await Role.findOne().sort({ role_id: -1 });
    const nextRoleId = lastRole ? lastRole.role_id + 1 : 1;

    const newRole = new Role({
      role_id: nextRoleId,
      name,
      description,
    });

    await newRole.save();
    res.status(201).json({ message: "Role created", role: newRole });
  } catch (err) {
    console.error("Create role error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get All Roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json({ roles });
  } catch (err) {
    console.error("Get roles error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Single Role by ID
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ error: "Role not found" });

    res.status(200).json({ role });
  } catch (err) {
    console.error("Get role by ID error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update Role
exports.updateRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ error: "Role not found" });

    if (name) role.name = name;
    if (description !== undefined) role.description = description;

    await role.save();
    res.status(200).json({ message: "Role updated", role });
  } catch (err) {
    console.error("Update role error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete Role (with user reference check)
exports.deleteRole = async (req, res) => {
  try {
    const roleId = req.params.id;

    // Check if role exists
    const role = await Role.findById(roleId);
    if (!role) return res.status(404).json({ error: "Role not found" });

    // Check if any user has this role
    const usersWithRole = await User.findOne({ role: role._id });
    if (usersWithRole) {
      return res
        .status(400)
        .json({ error: "Cannot delete role assigned to existing users" });
    }

    await role.deleteOne();
    res.status(200).json({ message: "Role deleted successfully" });
  } catch (err) {
    console.error("Delete role error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
