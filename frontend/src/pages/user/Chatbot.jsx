import React, { useState, useRef, useEffect } from "react";
import alumniconnectlogo2 from "../../assets/alumniconnectlogo2.png";
import chatbotimage from "../../assets/chatbotimage.jpg";

function Chatbot() {
  const [step, setStep] = useState(1);
  const [conversation, setConversation] = useState([]);
  const [stepHistory, setStepHistory] = useState([]);
  const [currentOptions, setCurrentOptions] = useState([]);

  // Ref for chat container
  const chatContainerRef = useRef(null);

  // Define custom results for each option
  const results = {
    // Navigation
    Home: [
      "1. Sign In: Enter your registered credentials (username and password) to log in to the system.",
      "2. Navigate to Home Page: Click on the 'Home' tab in the navigation bar.",
      "3. View the Landing Page: The homepage will display the platform's Mission & Vision statements, along with links to the various pages available.",
    ],

    Alumni: [
      "1. Sign In: Enter your registered credentials (username and password) to log in to the system.",
      "2. Navigate to Alumni Page: Click on the 'Alumni' tab in the navigation bar or scroll through the home page to find the “Alumni” link.",
      "3. View the Alumni Page: You may search, sort, and filter the list of alumni according to your preferences. In this page, the primary information, secondary information, educational background, career background, contact information, and attachment/s of alumni are available.",
    ],

    Survey: [
      "1. Sign In: Enter your registered credentials (username and password) to log in to the system.",
      "2. Navigate to Survey Page: Click on the 'Survey' tab in the navigation bar or scroll through the home page to find the “Survey” link.",
      "3. View the Survey Page: You can view and answer the survey questions published by the admins.",
    ],

    Content: [
      "1. Sign In: Enter your registered credentials (username and password) to log in to the system.",
      "2. Navigate to Contents Page: Click on the 'Contents' tab in the navigation bar, which will display a dropdown menu including: Companies, News, Events, Certifications, Document Request Steps, and Job/Internship Referrals or scroll through the home page to find links for each content.",
      "3. View the Contents Page: Each content page will include information such as the name, description, address, image, and contact details for the Company, News, Event, Certification, Document, or Job.",
    ],

    Chatbot: [
      "1. Sign In: Enter your registered credentials (username and password) to log in to the system.",
      "2. Navigate to Chatbot Page: Click on the 'Chatbot' tab in the navigation bar or scroll through the home page to find the “Chatbot” link.",
      "3. View the Chatbot Page: Click the 'Get Started' button, and the inquiry options will be displayed. You can inquire about platform navigation, documents, certifications, and jobs; however, there will be no option to chat live with an administrator.",
    ],

    //Certifications

    "Computer Science Certification": [
      "1. Certified Information Systems Auditor (CISA) - ISACA: A global benchmark for IT professionals in auditing and security, requiring a 150-question exam and five years of experience.",
      "2. Certified Information Security Manager (CISM) - ISACA: Validates expertise in IT security management and risk, requiring a four-hour exam with 150 questions and in-depth knowledge of security policies.",
      "3. Certified Information Systems Security Professional (CISSP) - (ISC)²: Demonstrates proficiency in managing information security programs, requiring a pass on the CISSP exam and five years of relevant experience.",
      "4. CompTIA Security+: Confirms foundational security skills and practical problem-solving abilities, paving the way for careers in software development, security consulting, or systems administration.",
      "5. CompTIA Cloud Essentials+: Covers essential cloud computing concepts, ensuring candidates understand key components of cloud solutions, including business principles and compliance.",
      "6. CompTIA Cloud+: Certifies candidates’ ability to maintain and optimize cloud infrastructure services, addressing configurations, management, and troubleshooting.",
      "7. VMware Certified Professional 6 - Data Center Virtualization (VCP6-DCV): Validates the ability to administer and troubleshoot vSphere V6 infrastructures, requiring six months of experience and specific training.",
      "8. HDI Desktop Advanced Support Technician (HDI-DAST): Confirms the ability to enhance on-site customer interactions and understand service-level agreements, including performing root cause analyses.",
      "9. HDI Technical Support Professional (HDI-TSP): Emphasizes customer service and incident management practices, focusing on effective incident escalation and metric management.",
      "10. ITIL 4: Offers various certification levels to help individuals deliver services consistently through well-defined processes, with training available online or in-person.",
      "11. SAP Certified Technology Associate: Verifies knowledge for SAP project management, building on consulting skills and validating advanced business skills and methodologies.",
      "12. Microsoft SQL Server Certifications: Provides various certifications covering data management, analytics, and database administration, starting with the entry-level Microsoft Technology Associate.",
      "13. Cisco Certified Internetwork Expert (CCIE) Data Center: Verifies expertise in planning, operating, monitoring, and troubleshooting complex data networks, positioning candidates for leadership roles in IT infrastructure.",
    ],

    "Information Systems Certification": [
      "1. Information Systems Analyst: Supports recent graduates with a four-year degree in Computer Information Systems, covering topics like organizational skills, professional skills, and strategic systems development.",
      "2. Associate Computing Professional (ACP): Designed for newcomers to the field,  requiring the ISP exam and one specialty exam, providing skills for a competitive edge in the career market.",
      "3. Certified Computing Professional (CCP): For highly skilled professionals at master and expert levels, requiring completion of the ISP core exam and two specialty exams.",
      "4. Certified Information Systems Auditor (CISA): Requires five years of professional experience in IS auditing, with a college degree as a substitute for some experience; involves passing the CISA exam and adhering to a Code of Professional Ethics.",
      "5. Certified Information Systems Security Professional (CISSP): Requires a minimum of five years of professional experience, with a bachelor’s degree reducing the requirement by one year; involves passing an exam and maintaining ethical standards.",
      "6. Certified in Risk and Information Systems Control (CRISC): Teaches risk identification and management using IS controls, requiring at least three years of work experience, with ongoing education credits available to maintain certification.",
    ],

    "Information Technology Certification": [
      "1. CompTIA A+: Entry-level certification for IT technicians covering hardware and software troubleshooting.",
      "2. CompTIA Network+: Focuses on networking concepts and skills.",
      "3. CompTIA Security+: Covers foundational cybersecurity knowledge.",
      "4. Cisco Certified Network Associate (CCNA): Validates skills in networking and IT infrastructure.",
      "5. Microsoft Certified: Azure Fundamentals: Introduces cloud concepts and Microsoft Azure services.",
      "6. AWS Certified Cloud Practitioner: Basic certification for Amazon Web Services.",
      "7. Certified Ethical Hacker (CEH): Focuses on penetration testing and ethical hacking techniques.",
      "8. Google IT Support Professional Certificate: Covers IT support fundamentals.",
      "9. Certified Information Systems Security Professional (CISSP): Advanced certification in information security (more suited for experienced professionals).",
      "10. ITIL Foundation: Provides an understanding of IT service management.",
    ],

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
        addChatMessage("chatbot", ["Navigation", "Certifications", "Jobs"]);
      } else if (previousStep === 3) {
        addChatMessage("chatbot", "You chose:");
        addChatMessage("chatbot", currentOptions); // Restore options from Step 3
      }
    }
  };

  const handleGetStarted = () => {
    addChatMessage("user", "Get Started");
    addChatMessage("chatbot", "Hello CICS Alumni! Please choose an option:");
    addChatMessage("chatbot", ["Navigation", "Certifications", "Jobs"]);
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
      } else if (option === "Certifications") {
        options = [
          "Computer Science Certification",
          "Information Systems Certification",
          "Information Technology Certification",
          "Go back",
        ];
      } else if (option === "Jobs") {
        options = [
          "Accountancy",
          "Architecture",
          "Arts and Letters",
          "Civil Law",
          "Commerce and Business Administration",
          "Education",
          "Engineering",
          "Fine Arts and Design",
          "Graduate School?",
          "Graduate School of Law?",
          "Information and Computing Sciences",
          "Medicine and Surgery",
          "Music",
          "Nursing",
          "Pharmacy",
          "Physical Education and Athletics",
          "Rehabilitation Sciences",
          "Science",
          "Tourism and Hospitality Management",
          "Canon Law",
          "Philosophy",
          "Sacred Theology",
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

    setTimeout(() => {
      // Display result text as a chatbot message
      addChatMessage(
        "chatbot",
        `You selected ${subOption}. Here are your results:`
      );

      // If the result is an array, join it with <br /> for line breaks
      const formattedResult = Array.isArray(result)
        ? result.join("<br />")
        : result;

      addChatMessage("chatbot", formattedResult); // Ensure result is displayed properly
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
                src={alumniconnectlogo2}
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
                      className={`btn w-full bg-blue text-white py-2 rounded-lg`}
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
                <div dangerouslySetInnerHTML={{ __html: chat.message }} />
              )}
            </div>
          </div>
        ))}

        {/* Start Button for Initial Setup */}
        {step === 1 && (
          <div
            className="p-6 rounded-lg shadow-lg text-center h-[62vh] flex flex-col items-center justify-center"
            style={{
              backgroundImage: `url(${chatbotimage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="mb-4 font-bold sm:text-2xl text-xl text-white">
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
