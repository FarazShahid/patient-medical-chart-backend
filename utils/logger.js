// utils/logger.js
const fs = require("fs");
const path = require("path");

const logFilePath = path.join(process.cwd(), "logs/activity.log");
if (!fs.existsSync(path.dirname(logFilePath))) {
  fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
}

function logToFile(message, type = "Log") {
  const timestamp = new Date().toISOString();
  const fullMessage = `[${timestamp}] [${type}] ${message}\n`;
  fs.appendFileSync(logFilePath, fullMessage);
  console.log(fullMessage.trim());
}

module.exports = {
  logToFile,
};
