import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BusIcon,
  MapPinIcon,
  CalendarIcon,
  CreditCardIcon,
  TicketIcon,
} from "lucide-react";
import { routes } from "../utils/mockData";
import { useAuth } from "../context/AuthContext";

export function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleBookSeats = () => {
    if (!isAuthenticated) {
      alert("Please login to book seats");
      navigate("/login");
      return;
    }
    navigate("/book-seats");
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-16 relative">
        <div className="absolute inset-0 z-0 opacity-60">
          <img
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=2069&q=80"
            alt="Sri Lankan bus on the road"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Book Your Bus Journey Across Sri Lanka
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Travel comfortably and safely with Bustricky.lk - Sri Lanka's
            leading online bus booking platform.
          </p>
          <button
            onClick={handleBookSeats}
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-md font-semibold text-lg hover:bg-blue-50 transition-colors"
          >
            Book Your Seats Now
          </button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Choose Your Route</h3>
              <p className="text-gray-600">
                Select your departure and arrival locations, along with your
                preferred travel date.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BusIcon size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Select Your Seats</h3>
              <p className="text-gray-600">
                Choose from available buses and select your preferred seats from
                the interactive seating map.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TicketIcon size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Your E-Ticket</h3>
              <p className="text-gray-600">
                Complete your payment securely and receive your e-ticket
                instantly via email or SMS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Popular Routes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.slice(0, 6).map((route) => (
              <div
                key={route.id}
                className="relative rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={
                      route.image ||
                      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={`${route.from} to ${route.to}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                </div>

                {/* Card Content */}
                <div className="relative p-6 text-white">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-semibold">{route.from}</div>
                    <div className="text-gray-200">→</div>
                    <div className="text-lg font-semibold">{route.to}</div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-200 mb-4">
                    <div>Distance: {route.distance}</div>
                    <div>Duration: {route.duration}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xl font-bold text-yellow-300">
                      Rs. {route.price.toLocaleString()}
                    </div>
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          alert("Please login to book seats");
                          navigate("/login");
                          return;
                        }
                        navigate(
                          `/book-seats?from=${route.from}&to=${route.to}`
                        );
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/routes"
              className="inline-block px-6 py-3 border border-blue-600 text-blue-600 rounded-md font-medium hover:bg-blue-50 transition-colors"
            >
              View All Routes
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Bustricky.lk
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="text-blue-600 mb-3">
                <CreditCardIcon size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600">
                Multiple secure payment options with instant confirmation.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="text-blue-600 mb-3">
                <CalendarIcon size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Rescheduling</h3>
              <p className="text-gray-600">
                Hassle-free rescheduling of your bookings when plans change.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="text-blue-600 mb-3">
                <TicketIcon size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant E-Tickets</h3>
              <p className="text-gray-600">
                Receive your e-tickets instantly via email or SMS.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="text-blue-600 mb-3">
                <BusIcon size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Live Bus Tracking</h3>
              <p className="text-gray-600">
                Track your bus in real-time to plan your journey better.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Book Your Journey?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied travelers who book their bus tickets
            with Bustricky.lk every day.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleBookSeats}
              className="px-8 py-3 bg-white text-blue-600 rounded-md font-semibold text-lg hover:bg-blue-50 transition-colors"
            >
              Book Now
            </button>
            <Link
              to="/track-bus"
              className="px-8 py-3 border border-white text-white rounded-md font-semibold text-lg hover:bg-blue-700 transition-colors"
            >
              Track Your Bus
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
