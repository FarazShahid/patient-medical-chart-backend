const path = require("path");
const connectDB = require("../config/db");
const processPdfFolder = require("../controllers/fileDataController");

const folderName = process.env.PDF_DIRECTORY_NAME || "pdfs";
const pdfsFolder = path.join(process.cwd(), folderName);

async function run() {
  await connectDB();
  await processPdfFolder(pdfsFolder);
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Script failed:", err.message);
  process.exit(1);
});
