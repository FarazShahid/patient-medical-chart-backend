const express = require("express");
const router = express.Router();
const { getLogs } = require("../controllers/logsController");
const checkAdmin = require("../middlewares/checkAmdin");

router.get("/",checkAdmin, getLogs);

module.exports = router;