import React, { useEffect, useState, useRef } from 'react';
import { HelpCircleIcon, MessageCircleIcon, PhoneIcon, MailIcon, MapPinIcon, ArrowRightIcon, CheckCircleIcon, SendIcon, BotIcon, UserIcon, XIcon } from 'lucide-react';
import axios from "axios";
export function Support() {
  const [activeTab, setActiveTab] = useState('faq');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  // AI Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([{
    role: 'bot',
    content: "Hello! I'm BusBuddy, your AI assistant. How can I help you today?"
  }]);
  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef(null);
  const handleInputChange = e => {
    const {
      name,
      value
    } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
 const handleSubmitContact = async (e) => {
  e.preventDefault();

  const userId = localStorage.getItem("userId");

  try {
    const response = await axios.post("http://localhost:8000/api/contact/", {
      name: contactForm.name,
      gmail: contactForm.email,   // ✅ match backend field name
      Contact: contactForm.phone, // ✅ match backend field name
      Subject: contactForm.subject,
      Message: contactForm.message,
       userId: userId || null, 
    });

    console.log("Response:", response.data);
    setFormSubmitted(true);

    // Reset form after 5 seconds
    setTimeout(() => {
      setFormSubmitted(false);
      setContactForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }, 5000);
  } catch (error) {
    console.error("Error sending message:", error);
    alert("Failed to send message. Please try again.");
  }
};
  // Chat functionality
  useEffect(() => {
    // Scroll to bottom of chat when messages change
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, [chatMessages]);
  const handleSendMessage = e => {
    e.preventDefault();
    if (!userInput.trim()) return;
    // Add user message
    setChatMessages(prev => [...prev, {
      role: 'user',
      content: userInput
    }]);
    // Process user input and generate response
    setTimeout(() => {
      let botResponse;
      const lowerInput = userInput.toLowerCase();
      // Simple pattern matching for common questions
      if (lowerInput.includes('book') || lowerInput.includes('ticket')) {
        botResponse = "You can book tickets by visiting our 'Book Seats' page. Select your origin, destination, and travel date, then choose your preferred bus and seats.";
      } else if (lowerInput.includes('cancel')) {
        botResponse = "You can cancel your booking up to 4 hours before departure. A 10% cancellation fee applies. Go to 'My Bookings' in your dashboard to cancel.";
      } else if (lowerInput.includes('refund')) {
        botResponse = 'Refunds are processed within 3-5 business days to your original payment method. A 10% cancellation fee applies to all cancellations.';
      } else if (lowerInput.includes('track') || lowerInput.includes('location')) {
        botResponse = "You can track your bus in real-time by visiting our 'Track Bus' page and entering your booking details or bus number.";
      } else if (lowerInput.includes('payment') || lowerInput.includes('pay')) {
        botResponse = 'We accept credit/debit cards, mobile banking, and e-wallets. All transactions are secure and encrypted.';
      } else if (lowerInput.includes('contact') || lowerInput.includes('support')) {
        botResponse = "You can reach our customer support team at +94 11 234 5678 or email us at support@bustricky.lk. We're available 24/7.";
      } else if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
        botResponse = 'Hello! How can I help you with your bus travel needs today?';
      } else {
        botResponse = "I'm not sure I understand your question. Could you rephrase it or ask about booking, cancellation, refunds, tracking, or payment methods?";
      }
      setChatMessages(prev => [...prev, {
        role: 'bot',
        content: botResponse
      }]);
    }, 1000);
    setUserInput('');
  };
  // FAQ data
  const faqData = [{
    question: 'How do I book a bus ticket?',
    answer: "You can book a bus ticket by visiting our 'Book Seats' page, selecting your origin and destination, choosing your travel date, selecting a bus, and completing the payment process. You'll receive an e-ticket via email or SMS after successful booking."
  }, {
    question: 'Can I cancel my booking?',
    answer: 'Yes, you can cancel your booking up to 4 hours before the scheduled departure time. A 10% cancellation fee will be charged, and the remaining amount will be refunded to your original payment method within 3-5 business days.'
  }, {
    question: 'How can I track my bus?',
    answer: "You can track your bus in real-time by visiting our 'Track Bus' page and entering your bus number, route details, or booking ID. The system will show you the current location of your bus and the estimated arrival time."
  }, {
    question: 'What payment methods are accepted?',
    answer: 'We accept credit/debit cards, mobile banking, and e-wallets for online payments. All transactions are secure and encrypted.'
  }, {
    question: 'How do I get my e-ticket?',
    answer: 'After successful payment, your e-ticket will be sent to your registered email address and phone number via SMS. You can also view and download your e-ticket from your account dashboard.'
  }, {
    question: 'Can I change my seat after booking?',
    answer: "Yes, you can change your seat up to 4 hours before departure, subject to availability. Log in to your account, go to 'My Bookings', select the booking you want to modify, and click on 'Change Seats'."
  }, {
    question: 'What if I miss my bus?',
    answer: 'If you miss your bus, your ticket becomes invalid. However, you can contact our customer support team, and they might be able to help you book a seat on the next available bus, subject to availability and additional charges.'
  }, {
    question: 'How early should I arrive at the bus station?',
    answer: 'We recommend arriving at the bus station at least 15-30 minutes before the scheduled departure time to ensure a smooth boarding process.'
  }];
  return <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Customer Support</h1>
      {/* Support Tabs */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex border-b">
          <button onClick={() => setActiveTab('faq')} className={`py-3 px-6 font-medium ${activeTab === 'faq' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}>
            <HelpCircleIcon size={18} className="inline mr-2" />
            FAQs
          </button>
          <button onClick={() => setActiveTab('contact')} className={`py-3 px-6 font-medium ${activeTab === 'contact' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}>
            <MessageCircleIcon size={18} className="inline mr-2" />
            Contact Us
          </button>
        </div>
      </div>
      {/* FAQ Tab */}
      {activeTab === 'faq' && <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqData.map((faq, index) => <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-5">
                  <h3 className="text-lg font-medium">{faq.question}</h3>
                  <p className="mt-2 text-gray-600">{faq.answer}</p>
                </div>
              </div>)}
          </div>
          <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Can't find what you're looking for?
            </h3>
            <p className="text-blue-700 mb-4">
              Our support team is here to help you with any questions or issues.
            </p>
            <button onClick={() => setActiveTab('contact')} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Contact Support
            </button>
          </div>
        </div>}
      {/* Contact Us Tab */}
      {activeTab === 'contact' && <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="md:col-span-2">
              <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
              {formSubmitted ? <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-green-700">
                    Thank you for contacting us. Our support team will get back
                    to you within 24 hours.
                  </p>
                </div> : <div className="bg-white rounded-lg shadow-md p-6">
                  <form onSubmit={handleSubmitContact}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Full Name
                        </label>
                        <input type="text" name="name" value={contactForm.name} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Your name" required />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Email Address
                        </label>
                        <input type="email" name="email" value={contactForm.email} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="your.email@example.com" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Phone Number
                        </label>
                        <input type="tel" name="phone" value={contactForm.phone} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="+94 XX XXX XXXX" />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Subject
                        </label>
                        <select name="subject" value={contactForm.subject} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                          <option value="">Select a subject</option>
                          <option value="Booking Issue">Booking Issue</option>
                          <option value="Cancellation & Refund">
                            Cancellation & Refund
                          </option>
                          <option value="Payment Problem">
                            Payment Problem
                          </option>
                          <option value="Bus Tracking">Bus Tracking</option>
                          <option value="Technical Support">
                            Technical Support
                          </option>
                          <option value="General Inquiry">
                            General Inquiry
                          </option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-6">
                      <label className="block text-gray-700 font-medium mb-2">
                        Message
                      </label>
                      <textarea name="message" value={contactForm.message} onChange={handleInputChange} rows={5} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Please describe your issue or question in detail..." required></textarea>
                    </div>
                    <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
                      Send Message
                    </button>
                  </form>
                </div>}
            </div>
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">
                Contact Information
              </h2>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <PhoneIcon size={20} className="mt-0.5 text-blue-600 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Phone Support</h3>
                      <p className="text-gray-600">+94 11 234 5678</p>
                      <p className="text-sm text-gray-500">Available 24/7</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MailIcon size={20} className="mt-0.5 text-blue-600 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Email Support</h3>
                      <p className="text-gray-600">support@bustricky.lk</p>
                      <p className="text-sm text-gray-500">
                        We'll respond within 24 hours
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPinIcon size={20} className="mt-0.5 text-blue-600 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Head Office</h3>
                      <p className="text-gray-600">
                        123 Main Street, Colombo 03, Sri Lanka
                      </p>
                      <p className="text-sm text-gray-500">
                        Mon-Fri: 9:00 AM - 5:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-medium mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="flex items-center text-blue-600 hover:underline">
                      <ArrowRightIcon size={14} className="mr-2" />
                      <span>Terms & Conditions</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center text-blue-600 hover:underline">
                      <ArrowRightIcon size={14} className="mr-2" />
                      <span>Privacy Policy</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center text-blue-600 hover:underline">
                      <ArrowRightIcon size={14} className="mr-2" />
                      <span>Refund Policy</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center text-blue-600 hover:underline">
                      <ArrowRightIcon size={14} className="mr-2" />
                      <span>About Us</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>}
      {/* AI Chatbot Button */}
      <button onClick={() => setIsChatOpen(true)} className={`fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 ${isChatOpen ? 'hidden' : 'flex'}`}>
        <MessageCircleIcon size={24} />
      </button>
      {/* AI Chatbot Interface */}
      {isChatOpen && <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white rounded-lg shadow-xl z-50 flex flex-col overflow-hidden" style={{
      height: '500px'
    }}>
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center">
              <BotIcon size={20} className="mr-2" />
              <h3 className="font-semibold">BusBuddy AI Assistant</h3>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-white hover:text-blue-200 transition-colors">
              <XIcon size={20} />
            </button>
          </div>
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-4">
              {chatMessages.map((message, index) => <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 rounded-bl-none'}`}>
                    <div className="flex items-start">
                      {message.role === 'bot' && <BotIcon size={16} className="mr-2 mt-1 flex-shrink-0" />}
                      <p>{message.content}</p>
                      {message.role === 'user' && <UserIcon size={16} className="ml-2 mt-1 flex-shrink-0" />}
                    </div>
                  </div>
                </div>)}
              <div ref={chatEndRef} />
            </div>
          </div>
          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
            <div className="flex">
              <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} placeholder="Type your message..." className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <button type="submit" className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700 transition-colors">
                <SendIcon size={18} />
              </button>
            </div>
          </form>
        </div>}
    </div>;
}