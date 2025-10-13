import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../index.css";

import {
  HelpCircle as HelpCircleIcon,
  MessageCircle as MessageCircleIcon,
  CheckCircle as CheckCircleIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  MapPin as MapPinIcon,
  Bot as BotIcon,
  X as XIcon,
  User as UserIcon,
  Send as SendIcon,
} from "lucide-react";

function Support() {
  const [activeTab, setActiveTab] = useState("faq");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: "bot",
      content:
        "Hello! I'm BusBuddy, your AI assistant. How can I help you today?",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    name: "",
    gmail: "",
    Contact: "",
    Subject: "",
    Message: "",
  });

  // Get user data from localStorage
  useEffect(() => {
    const getUserData = () => {
      try {
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
          const user = JSON.parse(userInfo);
          setInputs((prev) => ({
            ...prev,
            name:
              user.name ||
              `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
              "",
            gmail: user.email || "",
            Contact: user.phone || user.phoneNumber || "",
          }));
          // Ensure userId is set
          const userId = user._id || user.id;
          if (userId && !localStorage.getItem("userId")) {
            localStorage.setItem("userId", userId);
          }
        }
      } catch (err) {
        console.error("Error loading user data:", err);
      }
    };

    getUserData();
  }, []);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const sendRequest = async () => {
    try {
      let userId =
        localStorage.getItem("userId") || localStorage.getItem("user_id");

      // Fallback to userInfo if not found
      if (!userId) {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        userId = userInfo._id || userInfo.id || null;
        if (userId) {
          localStorage.setItem("userId", userId);
        }
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/contactUser`,
        {
          name: inputs.name,
          gmail: inputs.gmail,
          Contact: inputs.Contact,
          Subject: inputs.Subject,
          Message: inputs.Message,
          userId: userId || null,
          status: "Open",
          category: "General Inquiry",
          priority: "medium",
        }
      );

      return response.data;
    } catch (err) {
      console.error("Error sending message:", err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !inputs.name ||
      !inputs.gmail ||
      !inputs.Contact ||
      !inputs.Subject ||
      !inputs.Message
    ) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const result = await sendRequest();

      if (result.success) {
        setFormSubmitted(true);

        // Clear form
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        setInputs({
          name:
            userInfo.name ||
            `${userInfo.firstName || ""} ${userInfo.lastName || ""}`.trim() ||
            "",
          gmail: userInfo.email || "",
          Contact: userInfo.phone || userInfo.phoneNumber || "",
          Subject: "",
          Message: "",
        });

        // Redirect to profile with support tab after 3 seconds
        setTimeout(() => {
          setFormSubmitted(false);
          navigate("/user/userprofile?tab=support");
        }, 3000);
      } else {
        setError(result.message || "Failed to submit support ticket");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit support ticket. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setChatMessages((prev) => [...prev, { role: "user", content: userInput }]);
    const lowerInput = userInput.toLowerCase();
    let botResponse;

    if (lowerInput.includes("book") || lowerInput.includes("ticket")) {
      botResponse =
        "You can book tickets on our 'Book Seats' page — choose your route and travel date.";
    } else if (lowerInput.includes("cancel")) {
      botResponse =
        "You can cancel bookings up to 4 hours before departure via 'My Bookings'. A 10% fee applies.";
    } else if (lowerInput.includes("refund")) {
      botResponse =
        "Refunds are processed within 3–5 business days to your original payment method.";
    } else if (lowerInput.includes("track")) {
      botResponse =
        "Track your bus in real-time on the 'Track Bus' page using your booking ID.";
    } else if (lowerInput.includes("payment")) {
      botResponse =
        "We accept credit/debit cards, mobile banking, and e-wallets — all securely processed.";
    } else if (lowerInput.includes("contact")) {
      botResponse =
        "You can reach us anytime at +94 11 234 5678 or support@bustricky.lk.";
    } else if (["hi", "hello", "hey"].some((w) => lowerInput.includes(w))) {
      botResponse = "Hello! How can I help you today?";
    } else {
      botResponse =
        "I'm not sure I understand. Try asking about booking, cancellations, or payments.";
    }

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { role: "bot", content: botResponse },
      ]);
    }, 1000);
    setUserInput("");
  };

  const faqData = [
    {
      question: "How do I book a bus ticket?",
      answer:
        "Go to the 'Book Seats' page, choose your route and date, select a bus, and complete the payment.",
    },
    {
      question: "Can I cancel my booking?",
      answer:
        "Yes, up to 4 hours before departure. A 10% cancellation fee applies.",
    },
    {
      question: "How can I track my bus?",
      answer:
        "Use the 'Track Bus' page and enter your bus number or booking ID.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept credit/debit cards, mobile banking, and e-wallets — all encrypted.",
    },
    {
      question: "How do I get my e-ticket?",
      answer:
        "After payment, your e-ticket will be emailed and available in your dashboard.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Customer Support</h1>

      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("faq")}
            className={`py-3 px-6 font-medium ${
              activeTab === "faq"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <HelpCircleIcon size={18} className="inline mr-2" />
            FAQs
          </button>

          <button
            onClick={() => setActiveTab("contact")}
            className={`py-3 px-6 font-medium ${
              activeTab === "contact"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <MessageCircleIcon size={18} className="inline mr-2" />
            Contact Us
          </button>
        </div>
      </div>

      {activeTab === "faq" && (
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-5">
                <h3 className="text-lg font-medium">{faq.question}</h3>
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Can't find what you're looking for?
            </h3>
            <p className="text-blue-700 mb-4">
              Our team is here to help you with any question.
            </p>
            <button
              onClick={() => setActiveTab("contact")}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Contact Support
            </button>
          </div>
        </div>
      )}

      {activeTab === "contact" && (
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {formSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-green-700 mb-2">
                    Our team will contact you within 24 hours.
                  </p>
                  <p className="text-green-600 text-sm">
                    You can view your support tickets in your profile.
                  </p>
                  <button
                    onClick={() => navigate("/user/userprofile?tab=support")}
                    className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Go to Profile
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <form onSubmit={handleSubmit}>
                    {[
                      { label: "Full Name", name: "name", type: "text" },
                      { label: "Email", name: "gmail", type: "email" },
                      { label: "Phone", name: "Contact", type: "tel" },
                      { label: "Subject", name: "Subject", type: "text" },
                    ].map((field) => (
                      <div key={field.name} className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          name={field.name}
                          value={inputs[field.name]}
                          onChange={handleChange}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    ))}

                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2">
                        Message
                      </label>
                      <textarea
                        name="Message"
                        value={inputs.Message}
                        onChange={handleChange}
                        rows="5"
                        placeholder="Enter your message"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={isSubmitting}
                      ></textarea>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50"
                        onClick={() => {
                          const userInfo = JSON.parse(
                            localStorage.getItem("userInfo") || "{}"
                          );
                          setInputs({
                            name: userInfo.name || "",
                            gmail: userInfo.email || "",
                            Contact:
                              userInfo.phone || userInfo.phoneNumber || "",
                            Subject: "",
                            Message: "",
                          });
                        }}
                        disabled={isSubmitting}
                      >
                        Clear
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting...
                          </>
                        ) : (
                          "Send Message"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-6">
                Contact Information
              </h2>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <PhoneIcon
                      size={20}
                      className="mt-0.5 text-blue-600 mr-3"
                    />
                    <div>
                      <h3 className="font-medium">Phone Support</h3>
                      <p className="text-gray-600">+94 11 234 5678</p>
                      <p className="text-sm text-gray-500">Available 24/7</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MailIcon size={20} className="mt-0.5 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-medium">Email Support</h3>
                      <p className="text-gray-600">support@bustricky.lk</p>
                      <p className="text-sm text-gray-500">
                        Replies within 24 hours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPinIcon
                      size={20}
                      className="mt-0.5 text-blue-600 mr-3"
                    />
                    <div>
                      <h3 className="font-medium">Head Office</h3>
                      <p className="text-gray-600">
                        123 Main Street, Colombo 03, Sri Lanka
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 z-50"
        >
          <MessageCircleIcon size={24} />
        </button>
      )}

      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white rounded-lg shadow-xl z-50 flex flex-col overflow-hidden h-[500px]">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center">
              <BotIcon size={20} className="mr-2" />
              <h3 className="font-semibold">BusBuddy AI Assistant</h3>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white hover:text-blue-200"
            >
              <XIcon size={20} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-4">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white border border-gray-200 rounded-bl-none"
                    }`}
                  >
                    <div className="flex items-start">
                      {message.role === "bot" && (
                        <BotIcon
                          size={16}
                          className="mr-2 mt-1 flex-shrink-0"
                        />
                      )}
                      <p>{message.content}</p>
                      {message.role === "user" && (
                        <UserIcon
                          size={16}
                          className="ml-2 mt-1 flex-shrink-0"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-gray-200 bg-white"
          >
            <div className="flex">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700"
              >
                <SendIcon size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Support;
