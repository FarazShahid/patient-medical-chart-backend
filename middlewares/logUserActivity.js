// middleware/logUserActivity.js
const { logToFile } = require("../utils/logger");

function logUserActivity(req, res, next) {
  const user = req.user?.email || "Guest"; // Adjust depending on your auth system
  const method = req.method;
  const url = req.originalUrl;
  logToFile(`${user} accessed ${method} ${url}`, "Activity");
  next();
}

module.exports = logUserActivity;
