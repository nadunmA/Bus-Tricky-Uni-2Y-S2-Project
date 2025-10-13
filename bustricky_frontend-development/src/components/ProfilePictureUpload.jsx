import {
  AlertCircle,
  Camera,
  CheckCircle,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { UserService } from "../services/UserService";

const ProfilePictureUpload = ({ currentUser, onUpdate, onError }) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const getImageUrl = (profilePicture) => {
    if (!profilePicture) return null;

    if (profilePicture.startsWith("http")) {
      return profilePicture;
    }

    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

    const path = profilePicture.startsWith("/")
      ? profilePicture
      : `/${profilePicture}`;
    const fullUrl = `${backendUrl}${path}`;

    return fullUrl;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      onError("Please select a valid image file (JPG, PNG, GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onError("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    setShowUploadModal(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      const result = await UserService.uploadProfilePicture(
        selectedFile,
        (progress) => setUploadProgress(progress)
      );

      if (result.success) {
        onUpdate("Profile picture updated successfully");
        setShowUploadModal(false);
        setPreview(null);
        setSelectedFile(null);

        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        onError(result.message || "Failed to upload profile picture");
      }
    } catch (error) {
      console.error("Upload error:", error);
      onError("Failed to upload profile picture");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!currentUser?.profilePicture) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete your profile picture?"
    );
    if (!confirmDelete) return;

    try {
      setDeleting(true);

      const result = await UserService.deleteProfilePicture();

      if (result.success) {
        onUpdate("Profile picture deleted successfully");
        window.location.reload();
      } else {
        onError(result.message || "Failed to delete profile picture");
      }
    } catch (error) {
      console.error("Delete error:", error);
      onError("Failed to delete profile picture");
    } finally {
      setDeleting(false);
    }
  };

  const cancelUpload = () => {
    setShowUploadModal(false);
    setPreview(null);
    setSelectedFile(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gray-200 border-2 border-gray-300 overflow-hidden">
            {currentUser?.profilePicture ? (
              <img
                src={getImageUrl(currentUser.profilePicture)}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : null}

            <div
              className="w-full h-full flex items-center justify-center"
              style={{ display: currentUser?.profilePicture ? "none" : "flex" }}
            >
              <User className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || deleting}
            className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
          >
            <Camera className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex-1">
          <h4 className="font-medium text-gray-900">Profile Picture</h4>
          <p className="text-sm text-gray-500 mb-3">
            Upload a photo to personalize your profile
          </p>

          <div className="flex space-x-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || deleting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center text-sm"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New
                </>
              )}
            </button>

            {currentUser?.profilePicture && (
              <button
                onClick={handleDelete}
                disabled={uploading || deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center text-sm"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {import.meta.env.DEV && (
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <div>
            Profile Picture Path: {currentUser?.profilePicture || "None"}
          </div>
          <div>
            Constructed URL:{" "}
            {getImageUrl(currentUser?.profilePicture) || "None"}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Profile Picture
              </h3>
              <button
                onClick={cancelUpload}
                disabled={uploading}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {preview && (
              <div className="mb-4">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-gray-200">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {uploading && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {selectedFile && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-gray-600">
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-gray-600">Type: {selectedFile.type}</p>
                </div>
              </div>
            )}

            <div className="mb-6 text-xs text-gray-500">
              <p className="flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Maximum file size: 5MB
              </p>
              <p className="flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Supported formats: JPG, PNG, GIF
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={cancelUpload}
                disabled={uploading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePictureUpload;
