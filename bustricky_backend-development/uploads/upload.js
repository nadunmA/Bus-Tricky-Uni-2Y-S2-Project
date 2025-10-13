const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;

    if (
      file.fieldname === "profilePicture" ||
      file.fieldname === "ProfilePicture"
    ) {
      uploadPath = "uploads/profiles/";
    } else if (file.fieldname === "document") {
      uploadPath = "uploads/documents/";
    } else {
      uploadPath = "uploads/general/";
    }

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);

    const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
    console.log(`📄 Generated filename: ${filename}`);
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.fieldname === "profilePicture" ||
    file.fieldname === "ProfilePicture"
  ) {
    const allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
    ];
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only JPG, PNG, and GIF images are allowed for profile pictures"
        ),
        false
      );
    }
  } else if (file.fieldname === "document") {
    const allowedDocTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedDocTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Only PDF, DOC, and DOCX files are allowed for documents"),
        false
      );
    }
  } else {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"), false);
    }
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 5MB.",
        error: "FILE_TOO_LARGE",
      });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files uploaded.",
        error: "TOO_MANY_FILES",
      });
    }

    return res.status(400).json({
      success: false,
      message: "File upload error",
      error: err.code,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
      error: "INVALID_FILE_TYPE",
    });
  }

  next();
};

module.exports = upload;
module.exports.handleUploadError = handleUploadError;
