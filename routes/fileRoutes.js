const express = require("express");
const fileController = require("../controllers/filesController");
const router = express.Router();

router.get("/search", fileController.searchFiles);
router.get("/files", fileController.getAllFiles);

module.exports = router;
