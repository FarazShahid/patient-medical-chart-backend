const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");
const FileData = require("../models/FileData");
const extractFields = require("../extractors/fieldExtractor");

const logFilePath = path.join(process.cwd(), "logs/app.log");
if (!fs.existsSync(path.dirname(logFilePath))) {
  fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
}

function logToFile(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFilePath, `[${timestamp}] ${message}\n`);
  console.log(`[${timestamp}] ${message}`);
}

async function processPdfFolder(folderPath, baseFolder = folderPath) {
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name);

    if (entry.isDirectory()) {
      // Recursive call, passing baseFolder unchanged
      await processPdfFolder(fullPath, baseFolder);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) {
      const duplicate = await FileData.findOne({ filename: entry.name });
      if (duplicate) {
        const msg = `[Warning] Skipped duplicate: ${entry.name}`;
        logToFile(msg);
        continue;
      }
      try {
        const dataBuffer = fs.readFileSync(fullPath);
        const data = await pdf(dataBuffer);
        const fields = extractFields(data.text);

        // Calculate relative path inside baseFolder (pdfs)
        const relativePath = path
          .relative(baseFolder, fullPath)
          .replace(/\\/g, "/");

        const doc = new FileData({
          filename: entry.name,
          path: relativePath, // Save relative path, e.g. subfolder/file.pdf
          ...fields,
        });
        const savedDoc = await doc.save();
        if (savedDoc) {
          const msg = `[Log] Saved data for ${entry.name}:, ${fields}`;
          logToFile(msg);
        }
      } catch (err) {
        const msg = `[Error] processing ${entry.name}:, ${err.message}`;
        logToFile(msg);
      }
    }
  }
}

module.exports = processPdfFolder;
