require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const fileRoutes = require("./routes/fileRoutes");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middlewares/authMiddleware");
const logUserActivity = require("./middlewares/logUserActivity");
const roleRoutes = require("./routes/rolesRoutes");
const userRoutes = require("./routes/userRoutes");
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST;
const folderName = process.env.PDF_DIRECTORY_NAME || "pdfs";
connectDB();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://132.141.100.179",
    methods: "GET, POST, PUT, DELETE, PATCH", // Allowed HTTP methods
  })
);
app.use(express.static(folderName));

app.use("/api/files", authMiddleware, logUserActivity, fileRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/roles", authMiddleware, logUserActivity, roleRoutes);
app.use("/api/users", authMiddleware, logUserActivity, userRoutes);

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
