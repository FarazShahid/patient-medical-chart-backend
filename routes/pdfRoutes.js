// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const processPdfFile = require('../controllers/pdfProcessor');
// const path = require('path');
// const fs = require('fs');

// // Multer config (for single file upload)
// const upload = multer({
//   dest: path.join(__dirname, '../uploads/')
// });

// // POST /api/pdf/upload
// router.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

//     const filePath = req.file.path;

//     // Call the controller to process this file
//     const result = await processPdfFile(filePath, req.file.originalname);

//     res.status(200).json({ message: 'PDF processed successfully', data: result });
//   } catch (error) {
//     console.error('❌ Error processing PDF:', error);
//     res.status(500).json({ message: 'Error processing PDF' });
//   }
// });

// module.exports = router;
