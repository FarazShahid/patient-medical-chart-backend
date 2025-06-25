const FileData = require("../models/FileData");
const { logToFile } = require("../utils/logger");

exports.searchFiles = async (req, res) => {
  try {
    const {
      name,
      dob,
      filename,
      address,
      gender,
      cityStateZip,
      recordId,
      page = 1,
      limit = 25,
      sortBy = "name",
      sort = "asc" 
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};

    if (name) query.name = { $regex: name, $options: "i" };
    if (dob) query.dob = { $regex: dob, $options: "i" };
    if (filename) query.filename = { $regex: filename, $options: "i" };
    if (address) query.address = { $regex: address, $options: "i" };
    if (gender) query.gender = { $regex: gender, $options: "i" };
    if (cityStateZip)
      query.cityStateZip = { $regex: cityStateZip, $options: "i" };
    if (recordId) query.recordId = { $regex: recordId, $options: "i" }; // ✅ FIXED: keep it as string-based regex
    const sortFields = sortBy.split(",");
    const sortDirections = sort.split(",");
    const allowedSortFields = ["name", "recordId"]; // you can extend this list
    const sortOptions = {};
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "name";
    const sortDirection = sort.toLowerCase() === "desc" ? -1 : 1;
    const pipeline = [
      { $match: query },
      {
        $addFields: {
          [`is${sortField}Alpha`]: {
            $cond: [
              {
                $regexMatch: {
                  input: { $ifNull: [`$${sortField}`, ""] },
                  regex: /^[A-Za-z]/, // ✅ Starts with letter only
                },
              },
              1, // Valid
              0, // Invalid (number, symbol, or empty)
            ],
          },
        },
      },
      {
        $sort: {
          [`is${sortField}Alpha`]: -1, // valid (1) on top
          [sortField]: sortDirection,
        },
      },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ];
    const [results, total] = await Promise.all([
      FileData.aggregate(pipeline),
      FileData.countDocuments(query),
    ]);
    // sortFields.forEach((field, i) => {
    //   if (allowedSortFields.includes(field)) {
    //     const direction = (sortDirections[i] || "asc").toLowerCase() === "desc" ? -1 : 1;
    //     sortOptions[field] = direction;
    //   }
    // });
    // const [results, total] = await Promise.all([
    //   FileData.find(query)
    //     .sort( sortOptions )
    //     .skip(skip)
    //     .limit(parseInt(limit)),
    //   FileData.countDocuments(query),
    // ]);

    res.json({
      total,
      page: parseInt(page),
      pageSize: parseInt(limit),
      results,
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error during search." });
  }
};

exports.getAllFiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;
   // Sorting logic
   const sortBy = req.query.sortBy || "name"; // supports comma-separated values
   const sort = req.query.sort || "asc";
   const sortFields = sortBy.split(",");
   const sortDirections = sort.split(",");

   const allowedSortFields = ["name", "recordId"];
   const sortOptions = {};
   const sortField = allowedSortFields.includes(sortBy) ? sortBy : "name";
   const sortDirection = sort === "desc" ? -1 : 1;

  //  sortFields.forEach((field, i) => {
  //    if (allowedSortFields.includes(field)) {
  //      const direction = (sortDirections[i] || "asc").toLowerCase() === "desc" ? -1 : 1;
  //      sortOptions[field] = direction;
  //    }
  //  });
  const pipeline = [
    {
      $addFields: {
        [`is${sortField}Valid`]: {
          $cond: [
            {
              $regexMatch: {
                input: { $ifNull: [`$${sortField}`, ""] },
                regex: /^[A-Za-z]/
              }
            },
            1, // valid name
            0  // invalid or special char start
          ]
        }
      }
    },
    {
      $sort: {
        [`is${sortField}Valid`]: -1, // valid names (1) first
        [sortField]: sortDirection
      }
    },
    { $skip: skip },
    { $limit: limit }
  ];
    // const [files, total] = await Promise.all([
    //   FileData.find().sort(sortOptions).skip(skip).limit(limit),
    //   FileData.countDocuments(),
    // ]);
    const [files, total] = await Promise.all([
      FileData.aggregate(pipeline),
      FileData.countDocuments()
    ]);

    res.json({
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
      results: files,
    });
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ message: "Server error while fetching files." });
  }
};
exports.pdfFileActivity = async (req, res) => {
  try {
    const user = req.user?.email || "Guest";
    const { filePath } = req.body;
    if (!filePath) {
      return res.status(400).json({ message: "File path is required." });
    }
    logToFile(
      `${req?.user?.username} ${user} opened PDF: ${filePath}`,
      "Activity"
    );
    res.status(200).json({ message: "Activity logged." });
  } catch (err) {
    console.error("Error fetching files:", err);
  }
};
