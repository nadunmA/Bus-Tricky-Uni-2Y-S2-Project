import { ArrowLeft, Bus, Home, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="relative">
            <div className="text-8xl font-bold text-blue-100 mb-4">404</div>
            <Bus className="w-16 h-16 text-blue-400 mx-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            Oops! The page you're looking for seems to have taken a different
            route. It might have been moved, deleted, or you entered the wrong
            URL.
          </p>

          <div className="bg-blue-50 rounded-md p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">
              What you can do:
            </h3>
            <ul className="text-sm text-blue-700 space-y-1 text-left">
              <li>• Check the URL for typos</li>
              <li>• Go back to the previous page</li>
              <li>• Return to the homepage</li>
              <li>• Use the search feature</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoHome}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Homepage
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGoBack}
                className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition duration-200 flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Go Back
              </button>

              <button
                onClick={handleGoToLogin}
                className="bg-white border border-blue-600 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-50 transition duration-200 flex items-center justify-center"
              >
                <Search className="w-4 h-4 mr-1" />
                Login
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">
            Still having trouble? Contact our support team.
          </p>
          <a
            href="mailto:support@bustrack.com"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            support@bustrack.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
