import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, TruckIcon } from 'lucide-react';
export function SelectUserType() {
  const navigate = useNavigate();
  return <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Join Bustricky.lk
        </h1>
        <p className="text-gray-600 text-center mb-10">
          Please select your account type to continue with the registration
          process.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button onClick={() => navigate('/user-signup')} className="flex flex-col items-center p-8 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <UserIcon size={32} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Passenger</h2>
            <p className="text-gray-600 text-center text-sm">
              Book tickets, track buses, and manage your journeys
            </p>
          </button>
          <button onClick={() => navigate('/driver-signup')} className="flex flex-col items-center p-8 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <TruckIcon size={32} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Driver</h2>
            <p className="text-gray-600 text-center text-sm">
              Manage routes, update bus status, and view passenger lists
            </p>
          </button>
        </div>
        <div className="mt-10 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-blue-600 font-medium hover:underline">
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>;
}