import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Minus, Plus, HelpCircle } from "lucide-react";

const Chatbot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Pawly, your friendly PawFrindu assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const messagesEndRef = useRef(null);

  // Hide tooltip after 8 seconds
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    setShowTooltip(false);
    if (!isChatOpen) {
      setIsMinimized(false);
    } else {
      // Reset messages when closing the chat
      setMessages([
        {
          id: 1,
          text: "Hello! I'm Pawly, your friendly PawFrindu assistant. How can I help you today?",
          isBot: true,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const toggleMinimize = (e) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Hide tooltip if it's still showing
    setShowTooltip(false);

    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      text: inputValue,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages([...messages, newUserMessage]);
    setInputValue("");
    setIsTyping(true);

    // Predefined responses for suggested questions
    const suggestedResponses = {
      "How do I adopt a pet?": "On PawFrindu, browse dogs, cats, and other pets available for adoption. Filter by location and preferences to find your perfect companion. Complete an online application and schedule a meet-and-greet to bring your new friend home.",
      "What training services do you offer?": "PawFrindu offers Basic Training to master obedience and socialization, making your pet a well-mannered companion. Our Guard Dog Training focuses on protection and alertness for your family’s safety. Explore both programs on our platform.",
      "How can I find a vet?": "Use PawFrindu’s vet search tool to find trusted veterinarians near your location. Filter by services and book appointments directly through our platform to ensure your pet’s care needs are met.",
    };

    // Check if input matches a suggested question
    const botResponseText = suggestedResponses[inputValue];
    if (botResponseText) {
      // Use predefined response
      const newBotMessage = {
        id: messages.length + 2,
        text: botResponseText,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, newBotMessage]);
      setIsTyping(false);
    } else {
      // Call Gemini API for other inputs
      try {
        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBH8iao8XGsdIjVjdpD8jWUpWhMEwFBrcM",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: "You are Pawly, an assistant for the PawFrindu platform. Provide a short response (under 100 words) tailored to our services: pet adoption, vet search by location, and training services (Basic Training for obedience/socialization, Guard Dog Training for protection/alertness).",
                    },
                    { text: inputValue },
                  ],
                },
              ],
            }),
          }
        );

        const data = await response.json();

        // Extract the bot response from the API
        const apiResponseText =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Sorry, I couldn't process your request. Please try again.";

        // Add bot message
        const newBotMessage = {
          id: messages.length + 2,
          text: apiResponseText,
          isBot: true,
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, newBotMessage]);
      } catch (error) {
        console.error("Error calling Gemini API:", error);
        const errorMessage = {
          id: messages.length + 2,
          text: "Oops, something went wrong. Please try again later.",
          isBot: true,
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat toggle button */}
      {!isChatOpen && (
        <div className="relative">
          {/* Helpful tooltip */}
          {showTooltip && (
            <div className="absolute right-0 bottom-16 w-64 p-3 bg-white rounded-lg shadow-lg border border-pink-100 mb-2 animate-fade-in">
              <div className="flex items-start">
                <HelpCircle className="w-5 h-5 text-pink-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700">
                    Need help with pet adoption or care? Ask Pawly for assistance!
                  </p>
                  <button
                    onClick={() => setShowTooltip(false)}
                    className="text-xs text-pink-500 mt-1 hover:text-pink-600"
                  >
                    Got it
                  </button>
                </div>
              </div>
              <div className="absolute -bottom-2 right-10 w-4 h-4 bg-white border-r border-b border-pink-100 transform rotate-45"></div>
            </div>
          )}

          <button
            onClick={toggleChat}
            className="flex items-center justify-center gap-2 px-5 py-3 text-white transition-all duration-300 bg-pink-500 rounded-full shadow-lg hover:bg-pink-600 hover:scale-105 group animate-pulse-slow"
            aria-label="Open chat assistant"
          >
            <MessageCircle className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
            <span className="font-medium">Ask Pawly</span>
          </button>
        </div>
      )}

      {/* Chat window */}
      {isChatOpen && (
        <div
          className={`
            bg-white rounded-2xl shadow-xl border border-pink-100 overflow-hidden
            transition-all duration-300 ease-in-out
            ${isMinimized ? "w-72 h-16" : "w-80 md:w-96 h-96"}
          `}
        >
          {/* Chat header */}
          <div
            className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-pink-500 to-pink-400 cursor-pointer"
            onClick={isMinimized ? toggleChat : null}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 mr-2 overflow-hidden bg-white rounded-full">
                <div className="flex items-center justify-center w-full h-full text-lg font-bold text-pink-500">
                  🐾
                </div>
              </div>
              <h3 className="font-semibold text-white">Pawly - Pawfrindu Assistant</h3>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={toggleMinimize}
                className="p-1 text-white transition-colors rounded-full hover:bg-pink-600"
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                {isMinimized ? <Plus size={18} /> : <Minus size={18} />}
              </button>
              <button
                onClick={toggleChat}
                className="p-1 text-white transition-colors rounded-full hover:bg-pink-600"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat body */}
          {!isMinimized && (
            <>
              <div className="flex flex-col h-64 p-4 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isBot ? "justify-start" : "justify-end"
                    } mb-3`}
                  >
                    <div
                      className={`
                        max-w-[80%] p-3 rounded-2xl 
                        ${
                          message.isBot
                            ? "bg-gray-100 text-gray-800 rounded-tl-none"
                            : "bg-pink-500 text-white rounded-tr-none"
                        }
                      `}
                    >
                      <p className="text-sm">{message.text}</p>
                      <span
                        className={`text-xs ${
                          message.isBot ? "text-gray-500" : "text-pink-100"
                        } mt-1 block`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Show suggested questions after first bot message if there's only one message */}
                {messages.length === 1 && (
                  <div className="mt-2 mb-4">
                    <p className="text-xs text-gray-500 mb-2">Try asking:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "How do I adopt a pet?",
                        "What training services do you offer?",
                        "How can I find a vet?",
                      ].map((question, idx) => (
                        <button
                          key={idx}
                          className="px-3 py-1.5 text-xs bg-pink-50 text-pink-500 rounded-full hover:bg-pink-100 transition-colors"
                          onClick={() => {
                            setInputValue(question);
                            handleSubmit({ preventDefault: () => {} });
                          }}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isTyping && (
                  <div className="flex justify-start mb-3">
                    <div className="max-w-[80%] p-3 bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat input */}
              <div className="flex items-center p-3 border-t border-gray-200">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
                  placeholder="Ask about pets, adoption, or care..."
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:border-pink-500"
                  aria-label="Type your message"
                />
                <button
                  onClick={handleSubmit}
                  className="flex items-center justify-center w-10 h-10 ml-2 text-white bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
                  disabled={!inputValue.trim()}
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;