import {
  Award,
  BarChart3,
  Bus,
  Calendar,
  Clock,
  MapPin,
  Route,
  TrendingUp,
  Check,
} from "lucide-react";
import { useEffect, useState } from "react";

const UserStats = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeFilter, setTimeFilter] = useState("week");
  const [isLoading, setIsLoading] = useState(false);

  const [stats] = useState({
    overview: {
      totalTrips: 156,
      totalDistance: 1247,
      totalTime: 2340,
      favoriteRoute: "Route 245",
      avgRating: 4.2,
      co2Saved: 145.6,
      moneySpent: 2340,
    },
    weekly: {
      trips: [
        { day: "Mon", trips: 4, distance: 28, time: 95 },
        { day: "Tue", trips: 6, distance: 42, time: 140 },
        { day: "Wed", trips: 3, distance: 21, time: 78 },
        { day: "Thu", trips: 5, distance: 35, time: 125 },
        { day: "Fri", trips: 8, distance: 56, time: 189 },
        { day: "Sat", trips: 2, distance: 14, time: 45 },
        { day: "Sun", trips: 1, distance: 7, time: 25 },
      ],
      routes: [
        {
          route: "Route 245",
          count: 45,
          percentage: 35,
          avgTime: 22,
          rating: 4.5,
        },
        {
          route: "Route 138",
          count: 32,
          percentage: 25,
          avgTime: 18,
          rating: 4.2,
        },
        {
          route: "Route 067",
          count: 28,
          percentage: 22,
          avgTime: 15,
          rating: 4.0,
        },
        {
          route: "Route 156",
          count: 23,
          percentage: 18,
          avgTime: 28,
          rating: 3.8,
        },
      ],
    },
    achievements: [
      {
        title: "Eco Warrior",
        desc: "Saved 100kg of CO2",
        icon: "🌱",
        unlocked: true,
      },
      {
        title: "Regular Commuter",
        desc: "Used bus 100 times",
        icon: "🚌",
        unlocked: true,
      },
      {
        title: "Early Bird",
        desc: "Caught 50 buses before 7 AM",
        icon: "🌅",
        unlocked: true,
      },
      {
        title: "Route Explorer",
        desc: "Used 10 different routes",
        icon: "🗺️",
        unlocked: false,
      },
      {
        title: "Weekend Warrior",
        desc: "Used bus on 20 weekends",
        icon: "⭐",
        unlocked: false,
      },
    ],
  });

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [timeFilter]);

  const StatCard = ({
    icon,
    title,
    value,
    subtitle,
    color = "blue",
    trend = null,
  }) => {
    const IconComponent = icon;
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">
                  {trend}
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 bg-${color}-100 rounded-lg`}>
            <IconComponent className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </div>
    );
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">User Statistics</h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "trips", label: "Trip Details", icon: Bus },
            { id: "routes", label: "Route Analysis", icon: Route },
            { id: "achievements", label: "Achievements", icon: Award },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Time Filter */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            {activeTab === "overview"
              ? "Overall Statistics"
              : activeTab === "trips"
              ? "Trip Statistics"
              : activeTab === "routes"
              ? "Route Usage"
              : "Your Achievements"}
          </h3>
          {activeTab !== "achievements" && (
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading statistics...</span>
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    icon={Bus}
                    title="Total Trips"
                    value={stats.overview.totalTrips}
                    subtitle="trips completed"
                    trend="+12% this month"
                  />
                  <StatCard
                    icon={MapPin}
                    title="Distance Traveled"
                    value={`${stats.overview.totalDistance} km`}
                    subtitle="total distance"
                    color="green"
                  />
                  <StatCard
                    icon={Clock}
                    title="Time Traveled"
                    value={formatTime(stats.overview.totalTime)}
                    subtitle="total time"
                    color="purple"
                  />
                  <StatCard
                    icon={Award}
                    title="Average Rating"
                    value={`${stats.overview.avgRating}/5`}
                    subtitle="service rating"
                    color="yellow"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    icon={TrendingUp}
                    title="CO2 Saved"
                    value={`${stats.overview.co2Saved} kg`}
                    subtitle="vs. private transport"
                    color="green"
                  />
                  <StatCard
                    icon={Calendar}
                    title="Money Spent"
                    value={`LKR ${stats.overview.moneySpent}`}
                    subtitle="total fare paid"
                    color="blue"
                  />
                  <StatCard
                    icon={Route}
                    title="Favorite Route"
                    value={stats.overview.favoriteRoute}
                    subtitle="most used route"
                    color="indigo"
                  />
                </div>
              </div>
            )}

            {activeTab === "trips" && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-800 mb-4">
                    Daily Trip Activity
                  </h4>
                  <div className="grid grid-cols-7 gap-2">
                    {stats.weekly.trips.map((day, index) => (
                      <div key={index} className="text-center">
                        <div className="text-sm font-medium text-gray-600 mb-2">
                          {day.day}
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                          <div className="text-lg font-bold text-blue-600">
                            {day.trips}
                          </div>
                          <div className="text-xs text-gray-500">trips</div>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="text-xs text-gray-600">
                            {day.distance}km
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTime(day.time)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    icon={Bus}
                    title="This Week"
                    value="29 trips"
                    subtitle="6 more than last week"
                    trend="+26%"
                  />
                  <StatCard
                    icon={Clock}
                    title="Avg Trip Time"
                    value="15 min"
                    subtitle="2 min faster than avg"
                    color="green"
                    trend="-12%"
                  />
                  <StatCard
                    icon={MapPin}
                    title="Longest Trip"
                    value="45 min"
                    subtitle="Route 245 to Airport"
                    color="purple"
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-800 mb-4">
                    Trip Patterns
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-3">
                        Most Active Hours
                      </h5>
                      <div className="space-y-2">
                        {[
                          { time: "8:00 AM", percentage: 35, trips: 54 },
                          { time: "6:00 PM", percentage: 28, trips: 44 },
                          { time: "12:00 PM", percentage: 20, trips: 31 },
                          { time: "10:00 AM", percentage: 17, trips: 27 },
                        ].map((hour, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm font-medium text-gray-700">
                              {hour.time}
                            </span>
                            <div className="flex items-center gap-3">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${hour.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-12">
                                {hour.trips}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-700 mb-3">
                        Trip Types
                      </h5>
                      <div className="space-y-3">
                        {[
                          {
                            type: "Work Commute",
                            count: 89,
                            color: "bg-blue-500",
                          },
                          {
                            type: "Shopping",
                            count: 34,
                            color: "bg-green-500",
                          },
                          { type: "Social", count: 21, color: "bg-purple-500" },
                          { type: "Other", count: 12, color: "bg-gray-500" },
                        ].map((type, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div
                              className={`w-3 h-3 rounded-full ${type.color}`}
                            ></div>
                            <span className="text-sm text-gray-700 flex-1">
                              {type.type}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {type.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "routes" && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-800 mb-4">
                    Most Used Routes
                  </h4>
                  <div className="space-y-4">
                    {stats.weekly.routes.map((route, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-600">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">
                                {route.route}
                              </div>
                              <div className="text-sm text-gray-600">
                                {route.count} trips • Avg {route.avgTime} min
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">
                              {route.percentage}%
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-gray-600">
                                Rating:
                              </span>
                              <span className="text-sm font-medium text-yellow-600">
                                {route.rating}/5
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${route.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    icon={Bus}
                    title="Favorite Route"
                    value="Route 245"
                    subtitle="35% of all trips"
                    color="blue"
                  />
                  <StatCard
                    icon={Clock}
                    title="Peak Usage Time"
                    value="8:00 AM"
                    subtitle="most active hour"
                    color="green"
                  />
                  <StatCard
                    icon={MapPin}
                    title="Common Destination"
                    value="Central Station"
                    subtitle="most frequent stop"
                    color="purple"
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-800 mb-4">
                    Route Performance
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-3">
                        On-Time Performance
                      </h5>
                      <div className="space-y-3">
                        {stats.weekly.routes.map((route, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm text-gray-700">
                              {route.route}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${85 + index * 3}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-600 w-8">
                                {85 + index * 3}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-700 mb-3">
                        Average Wait Time
                      </h5>
                      <div className="space-y-3">
                        {stats.weekly.routes.map((route, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm text-gray-700">
                              {route.route}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {3 + index * 2} min
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "achievements" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stats.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`rounded-lg p-6 border-2 transition-all ${
                        achievement.unlocked
                          ? "bg-white border-blue-200 shadow-sm hover:shadow-md"
                          : "bg-gray-50 border-gray-200 opacity-75"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-3">{achievement.icon}</div>
                        <h4
                          className={`font-semibold mb-2 ${
                            achievement.unlocked
                              ? "text-gray-800"
                              : "text-gray-500"
                          }`}
                        >
                          {achievement.title}
                        </h4>
                        <p
                          className={`text-sm ${
                            achievement.unlocked
                              ? "text-gray-600"
                              : "text-gray-400"
                          }`}
                        >
                          {achievement.desc}
                        </p>
                        {achievement.unlocked && (
                          <div className="mt-3 flex items-center justify-center gap-1 text-green-600">
                            <Check className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Unlocked
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-800 mb-4">
                    Progress to Next Achievement
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-blue-700">
                          Route Explorer
                        </span>
                        <span className="text-sm text-blue-600">
                          7/10 routes
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: "70%" }}
                        ></div>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Try 3 more different routes to unlock!
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-blue-700">
                          Weekend Warrior
                        </span>
                        <span className="text-sm text-blue-600">
                          12/20 weekends
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: "60%" }}
                        ></div>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Use the bus on 8 more weekends to unlock!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "overview" && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Environmental Impact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.overview.co2Saved} kg
                </div>
                <div className="text-sm text-green-700">
                  CO2 Emissions Saved
                </div>
                <div className="text-xs text-green-600 mt-1">
                  vs. private car usage
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-green-700">Trees Equivalent</div>
                <div className="text-xs text-green-600 mt-1">
                  CO2 absorption per year
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  LKR 15,680
                </div>
                <div className="text-sm text-green-700">Money Saved</div>
                <div className="text-xs text-green-600 mt-1">
                  vs. taxi/private transport
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-8 border-t border-gray-200 mt-8">
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            <BarChart3 className="w-4 h-4" />
            Export Statistics
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <Calendar className="w-4 h-4" />
            View Full Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
