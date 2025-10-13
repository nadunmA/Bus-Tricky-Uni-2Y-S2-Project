import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapIcon, TruckIcon, UsersIcon, CalendarIcon, ClockIcon, BarChartIcon, BellIcon, LogOutIcon, UserIcon, SettingsIcon, CheckCircleIcon, XCircleIcon, AlertTriangleIcon } from 'lucide-react';
export function DriverDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const driver = {
    name: 'Saman Fernando',
    email: 'saman@example.com',
    phone: '+94 77 987 6543',
    licenseNumber: 'DL12345678',
    busCompany: 'Superline Express',
    busNumber: 'NW-5678',
    route: 'Colombo - Kandy'
  };
  // Mock upcoming trips
  const upcomingTrips = [{
    id: 'T1001',
    route: 'Colombo - Kandy',
    date: '2023-07-15',
    departureTime: '07:30',
    arrivalTime: '11:00',
    status: 'Scheduled',
    passengersCount: 32,
    busId: 'B1001'
  }, {
    id: 'T1002',
    route: 'Kandy - Colombo',
    date: '2023-07-15',
    departureTime: '16:00',
    arrivalTime: '19:30',
    status: 'Scheduled',
    passengersCount: 28,
    busId: 'B1001'
  }, {
    id: 'T1003',
    route: 'Colombo - Kandy',
    date: '2023-07-16',
    departureTime: '07:30',
    arrivalTime: '11:00',
    status: 'Scheduled',
    passengersCount: 18,
    busId: 'B1001'
  }];
  return <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Driver Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Driver Profile */}
            <div className="p-6 bg-blue-600 text-white">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold mx-auto mb-4">
                {driver.name.charAt(0)}
              </div>
              <h2 className="text-xl font-semibold text-center">
                {driver.name}
              </h2>
              <p className="text-blue-100 text-center">{driver.busCompany}</p>
            </div>
            {/* Navigation */}
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center p-3 rounded-md ${activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <BarChartIcon size={18} className="mr-3" />
                    <span>Overview</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('trips')} className={`w-full flex items-center p-3 rounded-md ${activeTab === 'trips' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <TruckIcon size={18} className="mr-3" />
                    <span>My Trips</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('passengers')} className={`w-full flex items-center p-3 rounded-md ${activeTab === 'passengers' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <UsersIcon size={18} className="mr-3" />
                    <span>Passengers</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center p-3 rounded-md ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <UserIcon size={18} className="mr-3" />
                    <span>Profile</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center p-3 rounded-md ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <SettingsIcon size={18} className="mr-3" />
                    <span>Settings</span>
                  </button>
                </li>
                <li className="pt-4 border-t border-gray-200">
                  <Link to="/login" className="w-full flex items-center p-3 rounded-md text-red-600 hover:bg-red-50">
                    <LogOutIcon size={18} className="mr-3" />
                    <span>Logout</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          {/* Bus Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="font-semibold mb-4">Bus Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Bus Number:</span>
                <span className="font-medium">{driver.busNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Route:</span>
                <span className="font-medium">{driver.route}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">License Number:</span>
                <span className="font-medium">{driver.licenseNumber}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Overview Tab */}
          {activeTab === 'overview' && <div>
              <h2 className="text-xl font-semibold mb-6">Dashboard Overview</h2>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-600">Today's Trips</h3>
                    <TruckIcon size={24} className="text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold">2</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Colombo - Kandy (Round Trip)
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-600">Total Passengers</h3>
                    <UsersIcon size={24} className="text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold">60</p>
                  <p className="text-sm text-gray-500 mt-2">
                    For today's trips
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-600">Next Departure</h3>
                    <ClockIcon size={24} className="text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold">07:30</p>
                  <p className="text-sm text-gray-500 mt-2">Colombo - Kandy</p>
                </div>
              </div>
              {/* Today's Schedule */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div className="p-6 border-b">
                  <h3 className="font-semibold text-lg">Today's Schedule</h3>
                </div>
                <div className="p-6">
                  <div className="relative">
                    {/* Timeline */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-blue-200"></div>
                    <div className="space-y-8">
                      <div className="relative pl-14">
                        <div className="absolute left-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <CheckCircleIcon size={18} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon size={14} className="mr-1" />
                            <span>07:30 AM</span>
                          </div>
                          <h4 className="font-medium mt-1">
                            Departure from Colombo
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            32 passengers, Bus #B1001
                          </p>
                        </div>
                      </div>
                      <div className="relative pl-14">
                        <div className="absolute left-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center">
                            <AlertTriangleIcon size={18} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon size={14} className="mr-1" />
                            <span>11:00 AM</span>
                          </div>
                          <h4 className="font-medium mt-1">Arrival in Kandy</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Bus Terminal, Kandy
                          </p>
                        </div>
                      </div>
                      <div className="relative pl-14">
                        <div className="absolute left-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center">
                            <AlertTriangleIcon size={18} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon size={14} className="mr-1" />
                            <span>16:00 PM</span>
                          </div>
                          <h4 className="font-medium mt-1">
                            Departure from Kandy
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            28 passengers, Bus #B1001
                          </p>
                        </div>
                      </div>
                      <div className="relative pl-14">
                        <div className="absolute left-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center">
                            <AlertTriangleIcon size={18} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon size={14} className="mr-1" />
                            <span>19:30 PM</span>
                          </div>
                          <h4 className="font-medium mt-1">
                            Arrival in Colombo
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Central Bus Terminal, Colombo
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="p-4 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors flex flex-col items-center">
                    <MapIcon size={24} className="text-blue-600 mb-2" />
                    <span className="text-sm font-medium">Start Trip</span>
                  </button>
                  <button className="p-4 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors flex flex-col items-center">
                    <UsersIcon size={24} className="text-blue-600 mb-2" />
                    <span className="text-sm font-medium">
                      View Passenger List
                    </span>
                  </button>
                  <button className="p-4 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors flex flex-col items-center">
                    <AlertTriangleIcon size={24} className="text-blue-600 mb-2" />
                    <span className="text-sm font-medium">Report Issue</span>
                  </button>
                </div>
              </div>
            </div>}
          {/* Trips Tab */}
          {activeTab === 'trips' && <div>
              <h2 className="text-xl font-semibold mb-6">My Trips</h2>
              {/* Trip Filters */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Date Range
                    </label>
                    <select className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>Today</option>
                      <option>Tomorrow</option>
                      <option>This Week</option>
                      <option>This Month</option>
                      <option>Custom Range</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Route
                    </label>
                    <select className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>All Routes</option>
                      <option>Colombo - Kandy</option>
                      <option>Kandy - Colombo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Status
                    </label>
                    <select className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>All Statuses</option>
                      <option>Scheduled</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
              {/* Upcoming Trips */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div className="p-6 border-b">
                  <h3 className="font-semibold text-lg">Upcoming Trips</h3>
                </div>
                <div className="p-6">
                  {upcomingTrips.map(trip => <div key={trip.id} className="border rounded-lg mb-4 overflow-hidden">
                      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="font-medium mr-3">
                            Trip #{trip.id}
                          </span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {trip.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Bus #{trip.busId}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                          <div className="mb-4 md:mb-0">
                            <h4 className="font-semibold">{trip.route}</h4>
                            <div className="flex items-center text-gray-600 mt-1">
                              <CalendarIcon size={16} className="mr-1" />
                              <span>{trip.date}</span>
                            </div>
                          </div>
                          <div className="mb-4 md:mb-0">
                            <div className="flex items-center">
                              <ClockIcon size={16} className="mr-1 text-blue-600" />
                              <span>Departure: {trip.departureTime}</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <ClockIcon size={16} className="mr-1 text-blue-600" />
                              <span>Arrival: {trip.arrivalTime}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              Passengers
                            </div>
                            <div className="font-medium">
                              {trip.passengersCount}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                            Start Trip
                          </button>
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
                            View Passengers
                          </button>
                          <button className="px-4 py-2 border border-red-500 text-red-600 rounded-md hover:bg-red-50 transition-colors text-sm">
                            Report Issue
                          </button>
                        </div>
                      </div>
                    </div>)}
                </div>
              </div>
              {/* Trip History */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b">
                  <h3 className="font-semibold text-lg">Trip History</h3>
                </div>
                <div className="p-6">
                  <div className="border rounded-lg mb-4 overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="font-medium mr-3">Trip #T1000</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Completed
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">Bus #B1001</div>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div className="mb-4 md:mb-0">
                          <h4 className="font-semibold">Colombo - Kandy</h4>
                          <div className="flex items-center text-gray-600 mt-1">
                            <CalendarIcon size={16} className="mr-1" />
                            <span>2023-07-14</span>
                          </div>
                        </div>
                        <div className="mb-4 md:mb-0">
                          <div className="flex items-center">
                            <ClockIcon size={16} className="mr-1 text-blue-600" />
                            <span>Departure: 07:30</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <ClockIcon size={16} className="mr-1 text-blue-600" />
                            <span>Arrival: 10:45</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            Passengers
                          </div>
                          <div className="font-medium">36</div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                      View All Trip History
                    </button>
                  </div>
                </div>
              </div>
            </div>}
          {/* Other tabs would be implemented similarly */}
          {activeTab === 'passengers' && <div>
              <h2 className="text-xl font-semibold mb-6">
                Passenger Management
              </h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600">
                  Select a trip to view passenger details.
                </p>
              </div>
            </div>}
          {activeTab === 'profile' && <div>
              <h2 className="text-xl font-semibold mb-6">Driver Profile</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Full Name
                      </label>
                      <input type="text" value={driver.name} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" readOnly />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Email Address
                      </label>
                      <input type="email" value={driver.email} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" readOnly />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Phone Number
                      </label>
                      <input type="tel" value={driver.phone} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" readOnly />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        License Number
                      </label>
                      <input type="text" value={driver.licenseNumber} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" readOnly />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Bus Company
                      </label>
                      <input type="text" value={driver.busCompany} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" readOnly />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Bus Number
                      </label>
                      <input type="text" value={driver.busNumber} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" readOnly />
                    </div>
                  </div>
                  <div className="pt-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>}
          {activeTab === 'settings' && <div>
              <h2 className="text-xl font-semibold mb-6">Settings</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600">
                  Account and application settings will be displayed here.
                </p>
              </div>
            </div>}
        </div>
      </div>
    </div>;
}