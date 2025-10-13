import { AlertCircle, Bell, Check, Globe, Save, Shield } from "lucide-react";
import { useState } from "react";

const UserPreferences = () => {
  const [preferences, setPreferences] = useState({
    notifications: {
      busArrival: true,
      delays: true,
      routeChanges: false,
      maintenance: true,
      promotions: false,
      emailNotifications: true,
      smsNotifications: false,
    },
    display: {
      theme: "light",
      language: "en",
      units: "metric",
      mapStyle: "standard",
      showTraffic: true,
      autoRefresh: true,
    },
    privacy: {
      shareLocation: true,
      analytics: false,
      personalizedAds: false,
      shareTrips: true,
      publicProfile: false,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleNotificationChange = (key) => {
    setPreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [key]: !preferences.notifications[key],
      },
    });
  };

  const handleDisplayChange = (key, value) => {
    setPreferences({
      ...preferences,
      display: {
        ...preferences.display,
        [key]: value,
      },
    });
  };

  const handlePrivacyChange = (key) => {
    setPreferences({
      ...preferences,
      privacy: {
        ...preferences.privacy,
        [key]: !preferences.privacy[key],
      },
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError("Failed to save preferences. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
    </label>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              User Preferences
            </h2>
          </div>

          {success && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              <Check className="w-5 h-5" />
              <span className="font-medium">Saved successfully!</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Bell className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Notification Settings
              </h3>
            </div>
            <div className="space-y-4 bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                  {
                    key: "busArrival",
                    label: "Bus Arrival Alerts",
                    desc: "Get notified when your bus is approaching your stop",
                  },
                  {
                    key: "delays",
                    label: "Delay Notifications",
                    desc: "Receive alerts about bus delays and cancellations",
                  },
                  {
                    key: "routeChanges",
                    label: "Route Changes",
                    desc: "Updates about temporary route modifications",
                  },
                  {
                    key: "maintenance",
                    label: "Service Maintenance",
                    desc: "Notifications about scheduled maintenance work",
                  },
                  {
                    key: "promotions",
                    label: "Promotions & Offers",
                    desc: "Special offers and promotional content",
                  },
                  {
                    key: "emailNotifications",
                    label: "Email Notifications",
                    desc: "Receive notifications via email",
                  },
                ].map(({ key, label, desc }) => (
                  <div
                    key={key}
                    className="flex items-start justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{label}</div>
                      <div className="text-sm text-gray-600">{desc}</div>
                    </div>
                    <ToggleSwitch
                      checked={preferences.notifications[key]}
                      onChange={() => handleNotificationChange(key)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-6">
              <Globe className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Display Settings
              </h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    value={preferences.display.theme}
                    onChange={(e) =>
                      handleDisplayChange("theme", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={preferences.display.language}
                    onChange={(e) =>
                      handleDisplayChange("language", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="si">සිංහල (Sinhala)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distance Units
                  </label>
                  <select
                    value={preferences.display.units}
                    onChange={(e) =>
                      handleDisplayChange("units", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="metric">Metric (km, m)</option>
                    <option value="imperial">Imperial (mi, ft)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Map Style
                  </label>
                  <select
                    value={preferences.display.mapStyle}
                    onChange={(e) =>
                      handleDisplayChange("mapStyle", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="standard">Standard</option>
                    <option value="satellite">Satellite</option>
                    <option value="terrain">Terrain</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-800">
                      Show Traffic Layer
                    </div>
                    <div className="text-sm text-gray-600">
                      Display real-time traffic information on maps
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={preferences.display.showTraffic}
                    onChange={() =>
                      handleDisplayChange(
                        "showTraffic",
                        !preferences.display.showTraffic
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-800">
                      Auto Refresh
                    </div>
                    <div className="text-sm text-gray-600">
                      Automatically refresh bus locations every 30 seconds
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={preferences.display.autoRefresh}
                    onChange={() =>
                      handleDisplayChange(
                        "autoRefresh",
                        !preferences.display.autoRefresh
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Privacy & Data
              </h3>
            </div>
            <div className="space-y-4 bg-gray-50 rounded-lg p-6">
              {[
                {
                  key: "shareLocation",
                  label: "Share Location",
                  desc: "Allow location sharing for accurate bus tracking and personalized routes",
                },
                {
                  key: "analytics",
                  label: "Usage Analytics",
                  desc: "Help improve the service by sharing anonymous usage data",
                },
                {
                  key: "personalizedAds",
                  label: "Personalized Advertisements",
                  desc: "Show ads based on your preferences and travel patterns",
                },
                {
                  key: "shareTrips",
                  label: "Share Trip Data",
                  desc: "Allow anonymized trip data to be used for route optimization",
                },
                {
                  key: "publicProfile",
                  label: "Public Profile",
                  desc: "Make your profile visible to other users (name and photo only)",
                },
              ].map(({ key, label, desc }) => (
                <div
                  key={key}
                  className="flex items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{label}</div>
                    <div className="text-sm text-gray-600">{desc}</div>
                  </div>
                  <ToggleSwitch
                    checked={preferences.privacy[key]}
                    onChange={() => handlePrivacyChange(key)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Data Management
            </h3>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Download My Data
                </button>
                <button className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Clear Trip History
                </button>
                <button className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium">
                  Delete Account
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Data deletion and downloads may take up to 24 hours to process
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-8 border-t border-gray-200 mt-8">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Save className="w-5 h-5" />
            {isLoading ? "Saving..." : "Save All Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPreferences;
