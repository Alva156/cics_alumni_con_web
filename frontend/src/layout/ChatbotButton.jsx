// src/components/ChatbotButton.js
import React from "react";
import { useNavigate } from "react-router-dom";
import chatbot from "../assets/chatbot.png"; // Adjust path as necessary

const ChatbotButton = () => {
  const navigate = useNavigate();

  const handleChatbotClick = () => {
    navigate("/user-chatbot");
  };

  return (
    <button
      onClick={handleChatbotClick}
      className="fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
      aria-label="Chatbot"
    >
      <img src={chatbot} alt="Chatbot" className="h-10 w-10" />
    </button>
  );
};

export default ChatbotButton;
