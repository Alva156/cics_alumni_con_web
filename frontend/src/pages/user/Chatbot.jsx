import React, { useState, useRef, useEffect } from "react";
import alumniconnectlogo2 from "../../assets/alumniconnectlogo2.png";
import chatbotsymbol from "../../assets/chatbot.png";
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
    Accountancy: [
      "1. Accounting Assistant",
      "2. Accounting Clerk",
      "3. Account Manager",
      "4. Accountant",
      "5. Financial Planner",
      "6. Financial Adviser",
      "7. Business Analyst",
      "8. Investment Adviser",
      "9. Financial Modeler",
      "10. Actuary",
    ],

    Architecture: [
      "1. Graphic Designer",
      "2. Framer",
      "3. Project Coordinator",
      "4. Interior Designer",
      "5. Lighting Consultant",
      "6. CAD Designer",
      "7. Professor",
      "8. Architectural Drafter",
      "9. Restoration Manager",
      "10. Architectural Technologist",
      "11. Archivist",
      "12. Industrial Designer",
      "13. Landscape Architect",
      "14. Urban Planner",
      "15. Structural Designer",
      "16. Building Architect",
      "17. Project Manager",
      "18. CAD Detailer",
      "19. Architectural Historian",
      "20. Researcher",
      "21. Structural Engineer",
      "22. Architect",
    ],

    "Arts and Letters": [
      "1. Production Assistant",
      "2. Admissions Counselor",
      "3. Event Planner",
      "4. Author",
      "5. Journalist",
      "6. Social Media Manager",
      "7. Graphic Designer",
      "8. Copywriter",
      "9. Interior Designer",
      "10. Marketing Specialist",
      "11. Art Director",
      "12. Web Developer",
      "13. Sales Manager",
      "14. Economist",
    ],

    "Civil Law": [
      "1. Mediator",
      "2. Paralegal",
      "3. Compliance Officer",
      "4. Legal Administrative Assistant",
      "5. Lawyer",
      "6. Judge",
      "7. Jury Consultant",
      "8. Law Enforcement Officer",
      "9. Law Librarian",
      "10. Accountant",
      "11. Financial Analyst",
      "12. Consultant",
      "13. Court Reporter",
      "14. General Counsel",
      "15. Human Resource Manager",
      "16. Journalism",
      "17. Law Professor",
      "18. Legal Consultant",
      "19. Legal Editor",
      "20. Lobbyist",
    ],

    "Commerce and Business Administration": [
      "1. Accountant",
      "2. Actuary",
      "3. Business Consultant",
      "4. Business Manager",
      "5. Chief Executive Officer",
      "6. Chief Financial Officer",
      "7. Chief Operating Officer",
      "8. Data Analyst",
      "9. Director of Operations",
      "10. Financial Analyst",
      "11. Health Services Administrator",
      "12. Human Resources Specialist",
      "13. Logistics Manager",
      "14. Management Consultant",
      "15. Market Research Analyst",
      "16. Marketing Manager",
      "17. Office Manager",
      "18. Project Manager",
      "19. Sales Manager",
      "20. Senior Business Analyst",
    ],

    Education: [
      "1. Career Counselor",
      "2. Academic Coach",
      "3. Camp Director",
      "4. Student Coordinator",
      "5. Child Care Director",
      "6. Lifestyle Coach",
      "7. Substance Abuse Counselor",
      "8. Corporate Trainer",
      "9. School Counselor",
      "10. School Psychologist",
      "11. Tutor",
      "12. Librarian",
      "13. Freelance Writer",
      "14. Associate Editor",
      "15. Educational Consultant",
      "16. Instructional Designer",
      "17. School Principal",
    ],

    Engineering: [
      "1. Marine Engineer",
      "2. Industrial Engineer",
      "3. Mechanical Engineer",
      "4. Computer Engineer",
      "5. Chemical Engineer",
      "6. Biomedical Engineer",
      "7. Petroleum Engineer",
      "8. Civil Engineer",
      "9. Environmental Engineer",
      "10. Electrical Engineer",
      "11. Nuclear Engineer",
      "12. Aeronautical Engineer",
      "13. Materials Engineer",
      "14. Software Engineer",
    ],

    "Fine Arts and Design": [
      "1. Music Director",
      "2. Illustrator",
      "3. Photographer",
      "4. Animator",
      "5. Web Designer",
      "6. Graphic Designer",
      "7. Art Teacher",
      "8. Musician",
      "9. Fashion Designer",
      "10. Curator",
      "11. Artist",
      "12. Interior Designer",
      "13. Writer",
      "14. Video Game Designer",
      "15. Art Director",
      "16. Videographer",
      "17. Concept Artist",
      "18. User Interface (UI) Designer",
      "19. UX Designer",
      "20. Architect",
      "21. Actor",
      "22. Printmaker",
      "23. Creative Writer",
      "24. Director",
      "25. Film Sound Editor",
      "26. Art Agent",
      "27. Band Manager",
      "28. Sound Engineer",
      "29. Commercial Artist",
      "30. Multimedia Artist",
      "31. Freelance Writer",
      "32. Advertising Designer",
      "33. Multimedia Artist",
      "34. Conservator",
      "35. Exhibition Designer",
      "36. Advertising Art Director",
      "37. Art Therapist",
      "38. Community Arts Worker",
      "39. Commercial Art Gallery Manager",
      "40. Museum Exhibitions Officer",
      "41. Arts Administrator",
      "42. Vfx Artist",
      "43. Craft Artist",
      "44. Special Effects Technician",
      "45. Community Arts Worker",
      "46. Fine Artist",
    ],

    "Information and Computing Sciences": [
      "1. Animator",
      "2. Health Information Technician",
      "3. Webmaster",
      "4. Computer Programmer",
      "5. Web Developer",
      "6. Computer Systems Analyst",
      "7. Business Analyst",
      "8. Video Game Designer",
      "9. Information Security Analyst",
      "10. Computer Engineer",
      "11. Application Developer",
      "12. Database Administrator",
      "13. Knowledge Engineer",
      "14. Software Test Engineer",
      "15. UX Designer",
      "16. Computer and Information Systems Manager",
      "17. Software Developer",
      "18. Software Engineer",
      "19. Cloud Engineer",
      "20. Data Scientist",
      "21. Computer Network Architect",
    ],

    "Medicine and Surgery": [
      "1. Dietary Aide",
      "2. Home Health Aide",
      "3. Veterinary Assistant",
      "4. Medical Records Clerk",
      "5. Patient Care Technician",
      "6. Nursing Assistant",
      "7. Certified Nursing Assistant",
      "8. Medical Scribe",
      "9. Medical Receptionist",
      "10. Medical Assistant",
      "11. Medical Secretary",
      "12. Athletic Trainer",
      "13. Licensed Practical Nurse",
      "14. Nutritionist",
      "15. Registered Nurse",
      "16. Health Administrator",
      "17. Ultrasound Technician",
      "18. Physical Therapist",
      "19. Audiologist",
      "20. Occupational Therapist",
      "21. Director of Nursing",
      "22. Neonatal Nurse",
      "23. Veterinarian",
      "24. Pharmacist",
      "25. Pediatrician",
      "26. Dentist",
      "27. Physician",
      "28. Surgeon",
      "29. Medical Director",
      "30. Psychiatrist",
      "31. Chief Medical Officer",
      "32. Anesthesiologist",
    ],

    Music: [
      "1. Actor",
      "2. Production Assistant",
      "3. Sound Engineer",
      "4. Public Relations Assistant",
      "5. Social Media Coordinator",
      "6. Event Coordinator",
      "7. Theater Manager",
      "8. Librarian",
      "9. Music Teacher",
      "10. Disc Jockey (DJ)",
      "11. Piano Teacher",
      "12. Music Director",
      "13. Music Minister",
      "14. Promotions Coordinator",
      "15. Musician",
      "16. Studio Manager",
      "17. Specialist Tours Manager",
      "18. Merchandise Manager",
      "19. Recruiter",
      "20. Media Manager",
      "21. Professor",
      "22. Historian",
    ],

    Nursing: [
      "1. Nurse Health Coach",
      "2. Nurse Nutritionist",
      "3. Medical Claims Analyst",
      "4. Public Health Nurse",
      "5. Hospice Nurse",
      "6. Nurse Educator",
      "7. Health Services Director",
      "8. Home Care Nurse",
      "9. Legal Nurse Consultant",
      "10. Medical Writer",
      "11. Nurse Case Manager",
      "12. Nurse Midwife",
      "13. Nurse Practitioner",
      "14. Emergency Room Nurse",
      "15. Oncology Nurse",
      "16. Nurse Anesthetist",
    ],

    Pharmacy: [
      "1. Pharmacy Clerk",
      "2. Pharmacy Dispenser",
      "3. Pharmacy Assistant",
      "4. Pharmacy Technician",
      "5. Pharmacist",
      "6. Chemotherapy Pharmacist",
      "7. Nuclear Pharmacist",
      "8. Long-Term Care Pharmacists",
      "9. Staff Pharmacist",
      "10. Director of Pharmacy",
      "11. Pharmacist in Charge",
      "12. Pharmacy Manager",
      "13. Pharmacy Specialist",
      "14. Clinical Pharmacist",
      "15. Health Outcomes Pharmacist",
      "16. Pharmacologist",
    ],

    "Physical Education and Athletics": [
      "1. Dance Instructor",
      "2. Athletic Coach",
      "3. Sport Journalist",
      "4. Athletic Trainer",
      "5. Physical Education Teacher",
      "6. Sports Dietitian",
      "7. Fitness Instructor",
      "8. Senior Fitness Instructor",
      "9. Physical Therapist",
      "10. Occupational Therapist",
    ],

    "Rehabilitation Sciences": [
      "1. Case Manager",
      "2. Clinical Research Coordinator",
      "3. Design Engineer",
      "4. Occupational Therapist",
      "5. Physical Therapist",
      "6. Rehabilitation Director",
      "7. Speech Pathologist",
      "8. Rehab RN",
    ],

    Science: [
      "1. Forensic Science Technician",
      "2. Biochemical Technician",
      "3. Nuclear Technician",
      "4. Microbiologist",
      "5. Meteorologist",
      "6. Chemical Engineer",
      "7. Environmental Scientist",
      "8. Geologist",
      "9. Laboratory Manager",
      "10. Cartographer",
      "11. Geographer",
      "12. Molecular Technical Supervisor",
      "13. Ecologist",
      "14. Geotechnical Engineer",
      "15. Hydrologist",
      "16. Molecular Biologist",
      "17. Computational Biologist",
      "18. Epidemiologist",
      "19. Environmental Engineer",
      "20. Regulatory Medicine Veterinarian",
      "21. Research Chemist",
      "22. Biomedical Engineer",
      "23. Life Science Consultant",
      "24. Oceanographer",
      "25. Materials Engineer",
      "26. Medical Scientist",
      "27. Aeronautical Engineer",
      "28. Pharmacy Manager",
      "29. Geophysicist",
      "30. Pharmacist",
      "31. Medical Research Scientist",
      "32. Astronomer",
      "33. Nuclear Physicist",
      "34. Biostatistician",
      "35. Neurologist",
    ],

    "Tourism and Hospitality Management": [
      "1. Cruise Agent",
      "2. Sports Center Manager",
      "3. Food Truck Manager",
      "4. Pastry Chef",
      "5. Airport Manager",
      "6. Spa Manager",
      "7. Hotel Assistant General Manager",
      "8. Tour Manager",
      "9. Cafe Manager",
      "10. Activity Manager",
      "11. Hotel Sales Coordinator",
      "12. Resort Manager",
      "13. Travel Agent",
      "14. Catering Manager",
      "15. Entertainment Manager",
      "16. Guest Services Manager",
      "17. Director of Housekeeping",
      "18. Park Manager",
      "19. Food Service Director",
      "20. Travel Consultant",
    ],

    "Canon Law": [
      "1. Canon Lawyer (Advocate)",
      "2. Church Tribunal Official",
      "3. Canonical Consultant",
      "4. Parish Administrator",
      "5. Professor of Canon Law",
      "6. Director of Pastoral Care",
      "7. Canonical Auditor",
      "8. Church Administrator",
      "9. Missionary or Chaplain",
      "10. Advocate for Church Reform",
      "11. Researcher or Writer",
      "12. Clerical Positions (e.g., Priest, Bishop)",
      "13. Mediation and Conflict Resolution Specialist",
    ],

    Philosophy: [
      "1. Teacher",
      "2. Paralegal",
      "3. Marketing Consultant",
      "4. Research Consultant",
      "5. Data Analyst",
      "6. Professor",
      "7. Lawyer",
      "8. Health Services Administrator",
      "9. Journalist",
      "10. Psychologist",
    ],

    "Sacred Theology": [
      "1. Music Minister",
      "2. Nonprofit Coordinator",
      "3. Manager of Volunteer Services",
      "4. Youth Pastor",
      "5. Religious Education Teacher",
      "6. Missionary",
      "7. Journalist",
      "8. Pastor",
      "9. Community Organizer",
      "10. Writer",
      "11. Librarian",
      "12. Chaplain",
      "13. Program Director",
      "14. Development Director",
      "15. Religion Professor",
    ],
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
      <div className="flex items-center mb-4">
        <img src={chatbotsymbol} alt="Logo" className="w-10 h-10 mr-2" />
        <h1 className="text-2xl font-medium text-gray-700">
          AlumniConnect Chatbot
        </h1>
      </div>
      {/* Chat Container */}
      <div
        className="w-full h-[80vh] bg-white p-6 rounded-lg shadow-lg flex flex-col space-y-4 overflow-auto"
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
        {/* Start Button for Initial Setup */}
        {step === 1 && (
          <div
            className="relative p-6 rounded-lg shadow-lg text-center h-[62vh] flex flex-col items-center justify-center"
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

            {/* Credit Overlay */}
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                color: "white",
                padding: "10px",
                borderRadius: "5px",
                fontSize: "14px",
                zIndex: "20",
                textAlign: "right",
              }}
            >
              Photo Courtesy of UST ICS
            </div>
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
