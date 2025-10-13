import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import UserAnalytics from "./admin/UserAnalytics";
import UserDetail from "./admin/UserDetail";
import UserEdit from "./admin/UserEdit";
import UserList from "./admin/UserList";
import "./App.css";

import "leaflet/dist/leaflet.css";
import AdminDashboard from "./pages/adminDashboard";
import AdminProfile from "./pages/adminPage";
import BusManagement from "./admin/BusManagement";
import EditProfile from "./user/EditProfile";
import UserProfile from "./user/UserProfile";

import Login from "./pages/Login";
import UserSignup from "./pages/UserSignup";
import ChangePassword from "./user/ChangePassword";
import DriverEdit from "./user/DriverEdit";
import DriverProfile from "./user/DriverProfile";
import UserPreferences from "./user/UserPreferences";
import UserStats from "./user/UserStats";

import EmailVerification from "./auth/EmailVerification";
import ForgotPassword from "./auth/ForgotPassword";
import ResendVerification from "./auth/ResendVerification";
import ResetPassword from "./auth/ResetPassword";

import NotFoundPage from "./pages/NotFoundPage";

// BusTricky New Routes
import { Home } from "./pages/Home";
import { TrackBus } from "./pages/TrackBus";
import { BookSeats } from "./pages/BookSeats";
import { RoutesPage } from "./pages/RoutesPage";
import { Support } from "./pages/Support";
import { SelectUserType } from "./pages/SelectUserType";

import { UserDashboard } from "./pages/UserDashboard";
import { DriverDashboard } from "./pages/DriverDashboard";
import { SeatSelection } from "./pages/SeatSelection";
import { Payment } from "./pages/Payment";
import { BookingDetails } from "./pages/BookingDetails";
import { ETicket } from "./pages/ETicket";

// Admin imports
import { AdminRoutes } from "./admin/AdminRoutes";

// Context & Layout
import { AuthProvider } from "./context/AuthContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

// Layout wrapper component
function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  const handleLogin = (user) => {
    console.log("User logged in:", user);
  };

  const handleSignup = (user) => {
    console.log("User signed up:", user);
  };

  const handleSwitchToSignup = () => {
    window.location.href = "/user/signup";
  };

  const handleSwitchToLogin = () => {
    window.location.href = "/user/login";
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Home & Main Routes (WITH Header/Footer) */}
          <Route
            path="/"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />
          <Route
            path="/track-bus"
            element={
              <MainLayout>
                <TrackBus />
              </MainLayout>
            }
          />
          <Route
            path="/book-seats"
            element={
              <MainLayout>
                <BookSeats />
              </MainLayout>
            }
          />
          <Route
            path="/routes"
            element={
              <MainLayout>
                <RoutesPage />
              </MainLayout>
            }
          />
          <Route
            path="/support"
            element={
              <MainLayout>
                <Support />
              </MainLayout>
            }
          />

          {/* Auth Routes (WITHOUT Header/Footer) */}
          <Route path="/select-user-type" element={<SelectUserType />} />
          <Route
            path="/login"
            element={
              <Login
                onLogin={handleLogin}
                onSwitchToSignup={handleSwitchToSignup}
              />
            }
          />
          <Route
            path="/user/login"
            element={
              <Login
                onLogin={handleLogin}
                onSwitchToSignup={handleSwitchToSignup}
              />
            }
          />
          <Route
            path="/auth/login"
            element={
              <Login
                onLogin={handleLogin}
                onSwitchToSignup={handleSwitchToSignup}
              />
            }
          />
          <Route
            path="/user/signup"
            element={
              <UserSignup
                onSignup={handleSignup}
                onSwitchToLogin={handleSwitchToLogin}
              />
            }
          />
          <Route
            path="/signup"
            element={
              <UserSignup
                onSignup={handleSignup}
                onSwitchToLogin={handleSwitchToLogin}
              />
            }
          />
          <Route
            path="/user-signup"
            element={
              <UserSignup
                onSignup={handleSignup}
                onSwitchToLogin={handleSwitchToLogin}
              />
            }
          />

          <Route path="/auth/forgotpassword" element={<ForgotPassword />} />
          <Route path="/auth/resetpassword" element={<ResetPassword />} />
          <Route
            path="/auth/emailverification"
            element={<EmailVerification />}
          />
          <Route
            path="/auth/resendverification"
            element={<ResendVerification />}
          />

          {/* Booking & Payment Routes (WITH Header/Footer) */}
          <Route
            path="/seat-selection/:routeId"
            element={
              <MainLayout>
                <SeatSelection />
              </MainLayout>
            }
          />
          <Route
            path="/payment/:bookingId"
            element={
              <MainLayout>
                <Payment />
              </MainLayout>
            }
          />
          <Route
            path="/booking-details/:bookingId"
            element={
              <MainLayout>
                <BookingDetails />
              </MainLayout>
            }
          />
          <Route
            path="/e-ticket/:bookingId"
            element={
              <MainLayout>
                <ETicket />
              </MainLayout>
            }
          />

          {/* Dashboard Routes (WITH Header/Footer) */}
          <Route
            path="/user-dashboard"
            element={
              <MainLayout>
                <UserDashboard />
              </MainLayout>
            }
          />
          <Route
            path="/driver-dashboard"
            element={
              <MainLayout>
                <DriverDashboard />
              </MainLayout>
            }
          />

          {/* Admin Routes (WITH Header/Footer) */}
          <Route
            path="/admin/profile"
            element={
              <MainLayout>
                <AdminProfile />
              </MainLayout>
            }
          />
          <Route
            path="/admin/admindashboard"
            element={
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            }
          />
          <Route
            path="/admin/userlist"
            element={
              <MainLayout>
                <UserList />
              </MainLayout>
            }
          />
          <Route
            path="/admin/userdetail/:userId"
            element={
              <MainLayout>
                <UserDetail />
              </MainLayout>
            }
          />
          <Route
            path="/admin/useredit/:userId"
            element={
              <MainLayout>
                <UserEdit />
              </MainLayout>
            }
          />
          <Route
            path="/admin/useranalytics"
            element={
              <MainLayout>
                <UserAnalytics />
              </MainLayout>
            }
          />
          <Route
            path="/admin/routes"
            element={
              <MainLayout>
                <AdminRoutes />
              </MainLayout>
            }
          />
          <Route
            path="/admin/bus-management"
            element={
              <MainLayout>
                <BusManagement />
              </MainLayout>
            }
          />
          <Route
            path="/admin/adduser"
            element={
              <MainLayout>
                <UserSignup
                  onSignup={handleSignup}
                  onSwitchToLogin={handleSwitchToLogin}
                />
              </MainLayout>
            }
          />

          {/* User Routes (WITH Header/Footer) */}
          <Route
            path="/user/userprofile"
            element={
              <MainLayout>
                <UserProfile />
              </MainLayout>
            }
          />
          <Route
            path="/user/usereditprofile"
            element={
              <MainLayout>
                <EditProfile />
              </MainLayout>
            }
          />
          <Route
            path="/user/changepassword"
            element={
              <MainLayout>
                <ChangePassword />
              </MainLayout>
            }
          />
          <Route
            path="/user/userpreferences"
            element={
              <MainLayout>
                <UserPreferences />
              </MainLayout>
            }
          />
          <Route
            path="/user/userstats"
            element={
              <MainLayout>
                <UserStats />
              </MainLayout>
            }
          />

          {/* Driver Routes (WITH Header/Footer) */}
          <Route
            path="/driver/profile"
            element={
              <MainLayout>
                <DriverProfile />
              </MainLayout>
            }
          />
          <Route
            path="/driver/profile/:id"
            element={
              <MainLayout>
                <DriverProfile />
              </MainLayout>
            }
          />
          <Route
            path="/driver/driveredit"
            element={
              <MainLayout>
                <DriverEdit />
              </MainLayout>
            }
          />
          <Route
            path="/driver/driveredit/:userId"
            element={
              <MainLayout>
                <DriverEdit />
              </MainLayout>
            }
          />
          <Route
            path="/driver/dashboard/:id"
            element={
              <MainLayout>
                <DriverProfile />
              </MainLayout>
            }
          />

          {/* 404 Page (WITH Header/Footer) */}
          <Route
            path="/pages/notFoundpage"
            element={
              <MainLayout>
                <NotFoundPage />
              </MainLayout>
            }
          />
          <Route
            path="*"
            element={
              <MainLayout>
                <NotFoundPage />
              </MainLayout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
