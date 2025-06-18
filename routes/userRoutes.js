const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const checkAdmin = require("../middlewares/checkAmdin");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/",authMiddleware, userController.getUsers); 
router.get("/:id",authMiddleware, userController.getUserById);
// router.post("/", userController.createUser);
router.put("/:id",authMiddleware,checkAdmin, userController.updateUser);
router.put("/:id/change-status",authMiddleware,checkAdmin, userController.toggleUserActive);
router.put("/:id/password",authMiddleware,checkAdmin, userController.changePassword);
router.delete("/:id",checkAdmin,authMiddleware ,userController.deleteUser);

module.exports = router;
