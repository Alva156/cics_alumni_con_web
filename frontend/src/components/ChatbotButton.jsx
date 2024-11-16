import React from "react";
import { useNavigate } from "react-router-dom";
import chatbot from "../assets/chatbotbutton.png";

const ChatbotButton = () => {
  const navigate = useNavigate();

  const handleChatbotClick = () => {
    navigate("/user-chatbot");
  };

  return (
    <button
      onClick={handleChatbotClick}
      className="fixed bottom-4 right-4 p-3 bg-[rgba(212,42,46,0.8)] text-white rounded-full shadow-lg hover:bg-[rgba(167,28,31,0.8)] transition z-50"
      aria-label="Chatbot"
    >
      <img src={chatbot} alt="Chatbot" className="h-10 w-10" />
    </button>
  );
};

export default ChatbotButton;
