require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const fileRoutes = require("./routes/fileRoutes");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middlewares/authMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST;
const folderName = process.env.PDF_DIRECTORY_NAME || "pdfs";
connectDB();
app.use(express.json());
app.use(cors());
app.use(express.static(folderName));

app.use("/api/files", authMiddleware, fileRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
