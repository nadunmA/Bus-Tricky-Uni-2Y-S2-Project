import { API_ENDPOINTS, apiService, handleApiError } from "./Api";

export class UploadService {
  static async uploadFile(file, uploadType = "general", onProgress = null) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", uploadType);

      const response = await apiService.upload(
        API_ENDPOINTS.UPLOADS.FILE,
        formData,
        onProgress
      );

      return {
        success: true,
        data: response.data,
        message: "File uploaded successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message || "File upload failed",
      };
    }
  }

  static async uploadAvatar(file, onProgress = null) {
    try {
      if (!UploadService.validateImageFile(file)) {
        return {
          success: false,
          error: { code: "INVALID_FILE" },
          message: "Please select a valid image file (JPG, PNG, GIF)",
        };
      }

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await apiService.upload(
        API_ENDPOINTS.UPLOADS.AVATAR,
        formData,
        onProgress
      );

      return {
        success: true,
        data: response.data,
        message: "Avatar uploaded successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message || "Avatar upload failed",
      };
    }
  }

  static async uploadBusImage(busId, file, onProgress = null) {
    try {
      if (!UploadService.validateImageFile(file)) {
        return {
          success: false,
          error: { code: "INVALID_FILE" },
          message: "Please select a valid image file (JPG, PNG, GIF)",
        };
      }

      const formData = new FormData();
      formData.append("busImage", file);
      formData.append("busId", busId);

      const response = await apiService.upload(
        API_ENDPOINTS.UPLOADS.BUS_IMAGE,
        formData,
        onProgress
      );

      return {
        success: true,
        data: response.data,
        message: "Bus image uploaded successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message || "Bus image upload failed",
      };
    }
  }

  static async uploadRouteMap(routeId, file, onProgress = null) {
    try {
      if (!UploadService.validateImageFile(file)) {
        return {
          success: false,
          error: { code: "INVALID_FILE" },
          message: "Please select a valid image file (JPG, PNG, GIF)",
        };
      }

      const formData = new FormData();
      formData.append("routeMap", file);
      formData.append("routeId", routeId);

      const response = await apiService.upload(
        API_ENDPOINTS.UPLOADS.ROUTE_MAP,
        formData,
        onProgress
      );

      return {
        success: true,
        data: response.data,
        message: "Route map uploaded successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message || "Route map upload failed",
      };
    }
  }

  static async uploadDocument(file, documentType, onProgress = null) {
    try {
      if (!UploadService.validateDocumentFile(file)) {
        return {
          success: false,
          error: { code: "INVALID_FILE" },
          message: "Please select a valid document file (PDF, DOC, DOCX)",
        };
      }

      const formData = new FormData();
      formData.append("document", file);
      formData.append("type", documentType);

      const response = await apiService.upload(
        API_ENDPOINTS.UPLOADS.DOCUMENT,
        formData,
        onProgress
      );

      return {
        success: true,
        data: response.data,
        message: "Document uploaded successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message || "Document upload failed",
      };
    }
  }

  static async uploadCSV(file, importType, onProgress = null) {
    try {
      if (!UploadService.validateCSVFile(file)) {
        return {
          success: false,
          error: { code: "INVALID_FILE" },
          message: "Please select a valid CSV file",
        };
      }

      const formData = new FormData();
      formData.append("csvFile", file);
      formData.append("importType", importType);

      const response = await apiService.upload(
        API_ENDPOINTS.UPLOADS.CSV_IMPORT,
        formData,
        onProgress
      );

      return {
        success: true,
        data: response.data,
        message: "CSV uploaded and processed successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message || "CSV upload failed",
      };
    }
  }

  static async uploadMultipleFiles(
    files,
    uploadType = "general",
    onProgress = null
  ) {
    try {
      const formData = new FormData();

      files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });
      formData.append("type", uploadType);

      const response = await apiService.upload(
        API_ENDPOINTS.UPLOADS.MULTIPLE,
        formData,
        onProgress
      );

      return {
        success: true,
        data: response.data,
        message: `${files.length} files uploaded successfully`,
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message || "Multiple file upload failed",
      };
    }
  }

  static async deleteFile(fileId) {
    try {
      const response = await apiService.delete(
        `${API_ENDPOINTS.UPLOADS.BASE}/${fileId}`
      );

      return {
        success: true,
        data: response.data,
        message: "File deleted successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message || "File deletion failed",
      };
    }
  }

  static async getFileInfo(fileId) {
    try {
      const response = await apiService.get(
        `${API_ENDPOINTS.UPLOADS.BASE}/${fileId}`
      );

      return {
        success: true,
        data: response.data,
        message: "File info retrieved successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message || "Failed to get file info",
      };
    }
  }

  static validateImageFile(file) {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }

  static validateDocumentFile(file) {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }

  static validateCSVFile(file) {
    const allowedTypes = ["text/csv", "application/vnd.ms-excel"];
    const maxSize = 50 * 1024 * 1024; // 50MB

    return (
      (allowedTypes.includes(file.type) || file.name.endsWith(".csv")) &&
      file.size <= maxSize
    );
  }

  static validateVideoFile(file) {
    const allowedTypes = ["video/mp4", "video/avi", "video/mov", "video/wmv"];
    const maxSize = 100 * 1024 * 1024; // 100MB

    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  static createProgressTracker(onProgress) {
    return (progressEvent) => {
      if (progressEvent.lengthComputable && onProgress) {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress({
          loaded: progressEvent.loaded,
          total: progressEvent.total,
          percentage: progress,
        });
      }
    };
  }

  static async uploadBatch(
    files,
    uploadType = "general",
    onFileProgress = null,
    onOverallProgress = null
  ) {
    const results = [];
    let completedCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const fileProgressTracker = onFileProgress
          ? (progress) => onFileProgress(i, progress, file.name)
          : null;

        const result = await UploadService.uploadFile(
          file,
          uploadType,
          fileProgressTracker
        );
        results.push({ file: file.name, result });

        completedCount++;

        if (onOverallProgress) {
          onOverallProgress({
            completed: completedCount,
            total: files.length,
            percentage: Math.round((completedCount / files.length) * 100),
          });
        }
      }

      const successCount = results.filter((r) => r.result.success).length;
      const failureCount = results.length - successCount;

      return {
        success: failureCount === 0,
        data: {
          results,
          summary: {
            total: files.length,
            successful: successCount,
            failed: failureCount,
          },
        },
        message: `Batch upload completed: ${successCount} successful, ${failureCount} failed`,
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: "Batch upload failed",
        data: { results },
      };
    }
  }
}

export default UploadService;
