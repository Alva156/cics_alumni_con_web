import React, { useState, useRef, useEffect } from "react";

function Chatbot() {
  const [step, setStep] = useState(1);
  const [conversation, setConversation] = useState([]);
  const [stepHistory, setStepHistory] = useState([]);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [resultText, setResultText] = useState("");

  // Ref for chat container
  const chatContainerRef = useRef(null);

  // Define custom results for each option
  const results = {
    // Navigation
    Home: "Sample result for Home",
    Alumni: "Sample result for Alumni",
    Survey: "Sample result for Survey",
    Content: "Sample result for Content",
    Chatbot: "Sample result for Chatbot",

    // Documents
    "Available Documents": "Sample result for Available Documents",
    "How to Request": "Sample result for How to Request",
    "Contact Details": "Sample result for Contact Details",

    // Certifications
    "Computer Science Certification":
      "Certification result for Computer Science",
    "Information Systems Certification":
      "Certification result for Information Systems",
    "Information Technology Certification":
      "Certification result for Information Technology",

    // Jobs
    "Computer Science Job": "Job result for Computer Science",
    "Information Systems Job": "Job result for Information Systems",
    "Information Technology Job": "Job result for Information Technology",
  };

  const addChatMessage = (from, message) => {
    setConversation((prevConversation) => [
      ...prevConversation,
      { from, message },
    ]);
  };

  const goBack = () => {
    if (stepHistory.length > 0) {
      const previousStep = stepHistory.pop();
      setStep(previousStep);
      setStepHistory([...stepHistory]);

      // Add "Go back" message for user
      addChatMessage("user", "Go back");

      // Remove last user and chatbot messages
      setConversation((prev) => prev.slice(0, -2));

      // Display options based on previous step
      if (previousStep === 2) {
        addChatMessage("chatbot", "Hi! Please choose an option:");
        addChatMessage("chatbot", [
          "Navigation",
          "Documents",
          "Certifications",
          "Jobs",
        ]);
      } else if (previousStep === 3) {
        addChatMessage("chatbot", "You chose:");
        addChatMessage("chatbot", currentOptions); // Restore options from Step 3
      }
    }
  };

  const handleGetStarted = () => {
    addChatMessage("user", "Get Started");
    addChatMessage("chatbot", "Hello CICS Alumni! Please choose an option:");
    addChatMessage("chatbot", [
      "Navigation",
      "Documents",
      "Certifications",
      "Jobs",
    ]);
    setStepHistory([1]);
    setStep(2);
  };

  const handleMainOptionClick = (option) => {
    addChatMessage("user", option);
    setStepHistory((prevHistory) => [...prevHistory, step]);
    setStep(3);

    setTimeout(() => {
      addChatMessage("chatbot", `You chose ${option}. Here are your options:`);
      let options = [];
      if (option === "Navigation") {
        options = ["Home", "Alumni", "Survey", "Content", "Chatbot", "Go back"];
      } else if (option === "Documents") {
        options = [
          "Available Documents",
          "How to Request",
          "Contact Details",
          "Go back",
        ];
      } else if (option === "Certifications") {
        options = [
          "Computer Science Certification",
          "Information Systems Certification",
          "Information Technology Certification",
          "Go back",
        ];
      } else if (option === "Jobs") {
        options = [
          "Computer Science Job",
          "Information Systems Job",
          "Information Technology Job",
          "Go back",
        ];
      }
      setCurrentOptions(options); // Save options for the current step
      addChatMessage("chatbot", options); // Display options for the current step
    }, 500);
  };

  const handleSubOptionClick = (subOption) => {
    if (subOption === "Go back") {
      goBack();
      return;
    }

    addChatMessage("user", subOption);
    setStepHistory((prevHistory) => [...prevHistory, step]);
    setStep(4);

    // Determine the result text based on the selected option
    const result = results[subOption] || `No result found for ${subOption}`;

    // Add messages after updating state
    setTimeout(() => {
      // Display result text as a chatbot message
      addChatMessage(
        "chatbot",
        `You selected ${subOption}. Here are your results:`
      );
      addChatMessage("chatbot", result); // Ensure result is not empty
      addChatMessage("chatbot", ["Go back"]); // Add "Go back" button
    }, 500);
  };

  const handleAskAgain = () => {
    addChatMessage("user", "Ask Again");
    setConversation([]);
    setStepHistory([]);
    handleGetStarted();
  };

  // Scroll to the bottom of the chat container whenever the conversation updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
      <h1 className="text-xl mb-4">Chatbot</h1>
      {/* Chat Container */}
      <div
        className="w-full h-[62vh] bg-white p-6 rounded-lg shadow-lg flex flex-col space-y-4 overflow-auto"
        ref={chatContainerRef}
      >
        {/* Chat Messages */}
        {conversation.map((chat, index) => (
          <div
            key={index}
            className={`flex ${
              chat.from === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {chat.from === "chatbot" && (
              <img
                src="https://via.placeholder.com/40" // Replace with your image URL
                alt="Chatbot Avatar"
                className="w-10 h-10 rounded mr-2" // Adjust size and margin as needed
              />
            )}
            <div
              className={`${
                chat.from === "user"
                  ? "bg-gray-400 text-white"
                  : "bg-fgray text-white"
              } rounded-lg p-4 mb-2 max-w-xs`}
            >
              {Array.isArray(chat.message) ? (
                <div className="space-y-2">
                  {chat.message.map((option, idx) => (
                    <button
                      key={idx}
                      className={`btn w-full ${
                        step === 4 && option === "Go back"
                          ? "bg-blue text-white py-2 rounded-lg"
                          : "bg-blue text-white py-2 rounded-lg"
                      }`}
                      onClick={
                        step === 2
                          ? () => handleMainOptionClick(option)
                          : () => handleSubOptionClick(option)
                      }
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                chat.message
              )}
            </div>
          </div>
        ))}

        {/* Start Button for Initial Setup */}
        {step === 1 && (
          <div className="p-6 rounded-lg shadow-lg text-center bg-red h-[62vh] flex flex-col items-center justify-center">
            <div className="mb-4 font-light sm:text-2xl text-xl text-white">
              Welcome to Chatbot! Please click Get Started to continue.
            </div>
            <button
              className="btn bg-gray-600 text-white py-2 px-4 rounded-lg text-xl w-72"
              onClick={handleGetStarted}
            >
              Get Started
            </button>
          </div>
        )}

        {/* Final Results and Options */}
        {step === 4 && (
          <div className="flex flex-col space-y-4">
            <div className="flex justify-center mt-4">
              <button
                className="btn bg-green text-white py-2 px-6 rounded-lg"
                onClick={handleAskAgain}
              >
                Ask Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chatbot;
