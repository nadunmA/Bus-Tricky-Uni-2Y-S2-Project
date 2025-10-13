const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

class UploadService {
  constructor() {
    this.allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    this.maxFileSize = 5 * 1024 * 1024;
    this.uploadDir = "uploads/profiles";
    this.thumbnailDir = "uploads/profiles/thumbnails";

    this.ensureDirectoriesExist();
  }

  ensureDirectoriesExist() {
    const dirs = [this.uploadDir, this.thumbnailDir];
    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  getStorage() {
    return multer.diskStorage({
      destination: (req, files, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const filename = `profile-${
          req.user?.id || "guest"
        }-${uniqueSuffix}${path.extname(file.originalname)}`;
        cb(null, filename);
      },
    });
  }

  fileFilter(req, file, cb) {
    if (this.allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ErrorResponse(
          "Only image files (JPEG, JPG, PNG, WebP) are allowed",
          400
        ),
        false
      );
    }
  }

  getUploadMiddleware() {
    return multer({
      storage: this.getStorage(),
      fileFilter: this.fileFilter.bind(this),
      limits: {
        fileSize: this.maxFileSize,
        files: 1,
      },
    });
  }

  async processImage(filepath, options = {}) {
    try {
      const {
        width = 400,
        height = 400,
        quality = 85,
        createThumbnail = true,
        thumbnailWidth = 150,
        thumbnailHeight = 150,
      } = options;

      const filename = path.basename(filepath);
      const processedPath = path.join(this.uploadDir, `processed-${filename}`);

      await sharp(filepath)
        .resize(width, height, {
          fit: "cover",
          position: "center",
        })
        .jpeg({ quality })
        .toFile(processedPath);

      if (createThumbnail) {
        const thumbnailPath = path.join(this.thumbnailDir, `thumb-${filename}`);
        await sharp(filepath)
          .resize(thumbnailWidth, thumbnailHeight, {
            fit: "cover",
            position: "center",
          })
          .jpeg({ quality: 70 })
          .toFile(thumbnailPath);
      }

      fs.unlinkSync(filepath);
      fs.renameSync(processedPath, filepath);

      return {
        success: true,
        filepath,
        thumbnailPath: createThumbnail
          ? path.join(this.thumbnailDir, `thumb-${filename}`)
          : null,
      };
    } catch (error) {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      throw new ErrorResponse("Error processing image", 500);
    }
  }

  async deleteFile(filepath) {
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }

      const filename = path.basename(filepath);
      const thumbnailPath = path.join(this.thumbnailDir, `thumb-${filename}`);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }

      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  async deleteOldProfilePicture(oldPath) {
    if (oldPath && oldPath !== "default-avatar.png") {
      await this.deleteFile(oldPath);
    }
  }

  validateFileSize(fileSize) {
    return fileSize <= this.maxFileSize;
  }

  getFileExtension(filename) {
    return path.extname(filename).toLowerCase();
  }

  generateUniqueFilename(originalName, userId = null) {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = this.getFileExtension(originalName);
    return `profile-${userId || "guest"}-${timestamp}-${random}${ext}`;
  }

  isImageFile(mimetype) {
    return this.allowedImageTypes.includes(mimetype);
  }

  getFileSizeString(bytes) {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }

  async validateImageDimensions(filepath, minWidth = 100, minHeight = 100) {
    try {
      const metadata = await sharp(filepath).metadata();
      return {
        valid: metadata.width >= minWidth && metadata.height >= minHeight,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
      };
    } catch (error) {
      throw new ErrorResponse("Error reading image metadata", 400);
    }
  }

  async cleanupOldFiles(daysOld = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const files = fs.readdirSync(this.uploadDir);
      let deletedCount = 0;

      for (const file of files) {
        const filepath = path.join(this.uploadDir, file);
        const stats = fs.statSync(filepath);

        if (stats.mtime < cutoffDate && file.startsWith("temp-")) {
          fs.unlinkSync(filepath);
          deletedCount++;
        }
      }

      console.log(`Cleaned up ${deletedCount} old files`);
      return deletedCount;
    } catch (error) {
      console.error("Error during cleanup:", error);
      return 0;
    }
  }

  async getUploadStats() {
    try {
      const files = fs.readdirSync(this.uploadDir);
      let totalSize = 0;
      let fileCount = files.length;

      for (const file of files) {
        const filepath = path.join(this.uploadDir, file);
        const stats = fs.statSync(filepath);
        totalSize += stats.size;
      }

      return {
        fileCount,
        totalSize: this.getFileSizeString(totalSize),
        totalSizeBytes: totalSize,
        directory: this.uploadDir,
      };
    } catch (error) {
      console.error("Error getting upload stats:", error);
      return null;
    }
  }

  handleUploadError(error) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return new ErrorResponse(
        `File size too large. Maximum allowed size is ${this.getFileSizeString(
          this.maxFileSize
        )}`,
        400
      );
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return new ErrorResponse("Too many files uploaded", 400);
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return new ErrorResponse("Unexpected file field", 400);
    }

    return new ErrorResponse(error.message || "File upload error", 400);
  }
}

module.exports = new UploadService();
