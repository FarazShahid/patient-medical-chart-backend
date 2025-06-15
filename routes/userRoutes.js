const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const checkAdmin = require("../middlewares/checkAmdin");

router.get("/", userController.getUsers); 
router.get("/:id", userController.getUserById);
// router.post("/", userController.createUser);
router.put("/:id",checkAdmin, userController.updateUser);
router.put("/:id/change-status",checkAdmin, userController.toggleUserActive);
router.put("/:id/password",checkAdmin, userController.changePassword);
router.delete("/:id",checkAdmin, userController.deleteUser);

module.exports = router;
