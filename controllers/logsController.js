const fs = require("fs");
const path = require("path");
const User = require("../models/User"); // adjust your import

const logLineRegex = /^\[(.*?)\] \[(.*?)\] (.+?) ([\w.-]+@[\w.-]+\.\w+) (.*)$/;
const logFilePath = path.join(__dirname, "../logs/activity.log");

exports.getLogs = async (req, res) => {
  const { email, type } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 25, 25), 100);

  try {
    // Read full log file
    const data = fs.readFileSync(logFilePath, "utf8");
    const lines = data.split("\n").filter((line) => line.trim().length > 0);

    const logEntries = [];

    for (const line of lines) {
      const match = logLineRegex.exec(line.trim());
      if (!match) continue;

      const [, timestamp, logType, username, userEmail, actionType, rest = ""] =
        match;
      // ❌ Skip logs for yourself and admin@gmail.com
      if (
        userEmail === "admin@gmail.com" ||
        userEmail === req.user?.email // skip current user logs
      ) {
        continue;
      }
      // Apply filters early
      if (email && userEmail !== email) continue;
      if (type && logType !== type) continue;

      // Fetch username (optional)
      const logEntry = {
        timestamp,
        type: logType,
        email: userEmail,
        userName: username || null,
        action: `${actionType}${rest}`.trim(),
      };

      logEntries.push(logEntry);
    }
    logEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Paginate after enrichment
    const total = logEntries.length;
    const start = (page - 1) * limit;
    const paginated = logEntries.slice(start, start + limit);

    return res.json({
      success: true,
      data: paginated,
      total,
    });
  } catch (err) {
    console.error("Log parse error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Log fetch failed" });
  }
};
