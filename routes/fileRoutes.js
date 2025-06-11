const express = require("express");
const fileController = require("../controllers/filesController");
const router = express.Router();

router.get("", fileController.getAllFiles);
router.get("/search", fileController.searchFiles);

module.exports = router;
