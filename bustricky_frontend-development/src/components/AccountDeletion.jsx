import { AlertTriangle, Lock, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserService } from "../services/UserService";

const AccountDeletion = ({ onError, onSuccess }) => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [step, setStep] = useState(1);

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      onError("Password is required for account deletion");
      return;
    }

    if (confirmText !== "DELETE") {
      onError('Please type "DELETE" to confirm account deletion');
      return;
    }

    try {
      setIsDeleting(true);

      const response = await UserService.deleteAccount(password, reason);

      if (response.success) {
        localStorage.clear();
        sessionStorage.clear();

        if (onSuccess) {
          onSuccess("Account deleted successfully");
        }

        setTimeout(() => {
          navigate("/user/login", {
            replace: true,
            state: { message: "Your account has been deleted successfully" },
          });
        }, 2000);
      } else {
        onError(response.message || "Failed to delete account");
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      onError("An error occurred while deleting your account");
    } finally {
      setIsDeleting(false);
    }
  };

  const resetModal = () => {
    setPassword("");
    setReason("");
    setConfirmText("");
    setStep(1);
    setShowDeleteModal(false);
  };

  const reasonOptions = [
    "No longer need the service",
    "Privacy concerns",
    "Found a better alternative",
    "Too many emails/notifications",
    "Account security concerns",
    "Service not meeting expectations",
    "Other",
  ];

  return (
    <>
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertTriangle className="w-6 h-6 text-red-600 mr-3 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Delete Account
            </h3>
            <p className="text-red-700 text-sm mb-4">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <div className="bg-red-100 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-red-800 mb-2">
                What will be deleted:
              </h4>
              <ul className="text-red-700 text-sm space-y-1">
                <li>• Your profile and personal information</li>
                <li>• Trip history and travel data</li>
                <li>• Driver credentials and license information</li>
                <li>• All preferences and settings</li>
                <li>• Account access and login credentials</li>
              </ul>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {step === 1 && (
              <>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        Delete Account
                      </h3>
                    </div>
                    <button
                      onClick={resetModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800 font-medium mb-2">
                      ⚠️ This action is irreversible
                    </p>
                    <p className="text-red-700 text-sm">
                      Your driver account and all associated data will be
                      permanently deleted. You will lose access to:
                    </p>
                    <ul className="mt-3 text-red-700 text-sm space-y-1">
                      <li>• Driver credentials and certifications</li>
                      <li>• Trip history and earnings data</li>
                      <li>• Route assignments and schedules</li>
                      <li>• Performance metrics and ratings</li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for deletion (optional)
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select a reason...</option>
                      {reasonOptions.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={resetModal}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Lock className="w-6 h-6 text-red-600 mr-3" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        Confirm Password
                      </h3>
                    </div>
                    <button
                      onClick={resetModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 mb-6">
                    Please enter your current password to confirm account
                    deletion.
                  </p>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your password"
                      autoFocus
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!password.trim()}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Trash2 className="w-6 h-6 text-red-600 mr-3" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        Final Confirmation
                      </h3>
                    </div>
                    <button
                      onClick={resetModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                    <p className="text-red-800 font-medium mb-2">
                      Last chance to reconsider
                    </p>
                    <p className="text-red-700 text-sm">
                      This is your final warning. Once deleted, your account
                      cannot be recovered.
                    </p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type "DELETE" to confirm
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Type DELETE to confirm"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      disabled={isDeleting}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={
                        confirmText !== "DELETE" ||
                        !password.trim() ||
                        isDeleting
                      }
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isDeleting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AccountDeletion;
