// src/admin/UserAnalytics.jsx
import {
  Activity,
  BarChart3,
  Calendar,
  Clock,
  MapPin,
  PieChart,
  Smartphone,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiService } from "../services/api";
import { exportUsersToPDF } from "../utils/pdfExport";

const UserAnalytics = () => {
  const [timeRange, setTimeRange] = useState("7days");
  const [loading, setLoading] = useState(true);

  // Real data states
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    inactiveUsers: 0,
    verifiedUsers: 0,
    pendingVerification: 0,
  });
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [userTypeData, setUserTypeData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [activityData, setActivityData] = useState([]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await apiService.get("/users/analytics");

      if (response.data.success) {
        const data = response.data.data;
        setUserStats(data.userStats || {});
        setUserGrowthData(data.userGrowthData || []);
        setUserTypeData(data.userTypeData || []);
        setLocationData(data.locationData || []);
        setRecentActivity(data.recentActivity || []);
        setDeviceData(data.deviceData || []);
        setActivityData(data.activityData || []);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const handleExportUserReport = async () => {
    try {
      // Assuming /users endpoint returns all users; adjust if needed based on your API
      const response = await apiService.get("/users");
      if (response.data.success) {
        const users = response.data.data || []; // Adjust based on actual response structure
        exportUsersToPDF(users);
      }
    } catch (error) {
      console.error("Failed to fetch users for export:", error);
      // Optionally, add user feedback like toast notification
    }
  };

  const StatCard = ({ title, value, icon, trend, color = "blue" }) => {
    const IconComponent = icon;
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold text-${color}-600`}>
              {value?.toLocaleString() || 0}
            </p>
            {trend && (
              <p
                className={`text-sm ${
                  trend > 0 ? "text-green-600" : "text-red-600"
                } flex items-center mt-1`}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                {trend > 0 ? "+" : ""}
                {trend}% this month
              </p>
            )}
          </div>
          <div className={`p-3 bg-${color}-100 rounded-full`}>
            <IconComponent className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                User Analytics
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive insights into user behavior and engagement
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last Year</option>
              </select>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
              >
                <Activity className="w-4 h-4 mr-2" />
                {loading ? "Loading..." : "Refresh Data"}
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={userStats.totalUsers}
            icon={Users}
            trend={8.2}
            color="blue"
          />
          <StatCard
            title="Active Users"
            value={userStats.activeUsers}
            icon={UserCheck}
            trend={12.5}
            color="green"
          />
          <StatCard
            title="New Users"
            value={userStats.newUsers}
            icon={UserPlus}
            trend={-2.1}
            color="indigo"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                User Growth Trend
              </h3>
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-gray-500">Loading chart data...</div>
              </div>
            ) : userGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-gray-500">No growth data available</div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                User Type Distribution
              </h3>
              <PieChart className="w-5 h-5 text-blue-600" />
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-gray-500">Loading chart data...</div>
              </div>
            ) : userTypeData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={userTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {userTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [value.toLocaleString(), "Users"]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {userTypeData.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-gray-500">No user type data available</div>
              </div>
            )}
          </div>
        </div>

        {/* Device Usage & Peak Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Device Usage */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Device Usage
              </h3>
              <Smartphone className="w-5 h-5 text-blue-600" />
            </div>
            {deviceData.length > 0 ? (
              <>
                <div className="space-y-4">
                  {deviceData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 bg-blue-600 rounded mr-3"
                          style={{
                            backgroundColor:
                              index === 0
                                ? "#3B82F6"
                                : index === 1
                                ? "#60A5FA"
                                : "#93C5FD",
                          }}
                        ></div>
                        <span className="font-medium text-gray-700">
                          {item.device}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">
                          {item.users?.toLocaleString() || 0}
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                          {item.percentage || 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  {deviceData.map((item, index) => (
                    <div key={index} className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.device}</span>
                        <span>{item.percentage || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${item.percentage || 0}%`,
                            backgroundColor:
                              index === 0
                                ? "#3B82F6"
                                : index === 1
                                ? "#60A5FA"
                                : "#93C5FD",
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[200px]">
                <div className="text-gray-500">
                  {loading
                    ? "Loading device data..."
                    : "No device data available"}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Peak Usage Hours
              </h3>
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            {activityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="logins" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px]">
                <div className="text-gray-500">
                  {loading
                    ? "Loading activity data..."
                    : "No activity data available"}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              User Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <UserCheck className="w-5 h-5 text-green-600 mr-3" />
                  <span className="font-medium text-green-700">Verified</span>
                </div>
                <span className="text-green-600 font-bold">
                  {userStats.verifiedUsers?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                  <span className="font-medium text-yellow-700">Pending</span>
                </div>
                <span className="text-yellow-600 font-bold">
                  {userStats.pendingVerification?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <UserX className="w-5 h-5 text-red-600 mr-3" />
                  <span className="font-medium text-red-700">Inactive</span>
                </div>
                <span className="text-red-600 font-bold">
                  {userStats.inactiveUsers?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Top Locations
              </h3>
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-3">
              {locationData.length > 0 ? (
                locationData.map((location, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-700">
                        {location.city}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">
                        {location.users?.toLocaleString() || 0}
                      </span>
                      <span className="text-xs text-blue-600 font-medium">
                        {location.percentage || 0}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  {loading ? "Loading..." : "No location data available"}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleExportUserReport}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Users className="w-4 h-4 mr-2" />
                Export User Report
              </button>
              <button className="w-full flex items-center justify-center px-4 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Analytics
              </button>
              <button className="w-full flex items-center justify-center px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Report
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            User Engagement Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">4.2</div>
              <div className="text-sm text-gray-600">Avg. Sessions/Day</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                12m 34s
              </div>
              <div className="text-sm text-gray-600">Avg. Session Duration</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {userStats.totalUsers > 0
                  ? (
                      (userStats.activeUsers / userStats.totalUsers) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600">User Retention Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {userStats.totalUsers > 0
                  ? (
                      (userStats.verifiedUsers / userStats.totalUsers) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600">Verification Rate</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent User Activity
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {activity.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activity.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                          {activity.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activity.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activity.time}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      {loading
                        ? "Loading recent activity..."
                        : "No recent activity found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All Activity →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;
