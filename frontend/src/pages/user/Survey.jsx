import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { uniqueId } from "lodash";

function Survey() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userResponses, setUserResponses] = useState({});
  const modalRef = useRef(null);

  // const surveys = [
  //   {
  //     name: "Survey Name 1",
  //     response: "999 responses",
  //     answered: false,
  //     questions: [
  //       {
  //         question: "Question 1",
  //         questionContent: "hello world",
  //         questionType: "radio",
  //         choices: ["choice 1", "choice 2", "choice 3"],
  //       },
  //       {
  //         question: "Question 2",
  //         questionContent: "hello world",
  //         questionType: "checkbox",
  //         choices: ["choice 1", "choice 2", "choice 3"],
  //       },
  //       {
  //         question: "Question 3",
  //         questionContent: "hello world",
  //         questionType: "textInput",
  //       },
  //       {
  //         question: "Question 4",
  //         questionContent: "hello world",
  //         questionType: "textArea",
  //       },
  //     ],
  //   },
  //   {
  //     name: "Survey Name 2",
  //     response: "500 responses",
  //     answered: true,
  //     questions: [
  //       {
  //         question: "Question 1",
  //         questionContent: "another question content",
  //         questionType: "radio",
  //         choices: ["option 1", "option 2"],
  //       },
  //     ],
  //   },
  // ];

  const openModal = (survey) => {
    fetchSurveyById(survey._id);
};

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSurvey(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isModalOpen]);

  const renderInputField = (question) => {
    switch (question.questionType) {
      case "radio":
        return question.choices.map((choice, idx) => (
          <div key={idx} className="flex items-center mb-2">
            <input
              type="radio"
              name={question.question}
              value={choice}
              className="mr-2"
            />
            <label>{choice}</label>
          </div>
        ));
      case "checkbox":
        return question.choices.map((choice, idx) => (
          <div key={idx} className="flex items-center mb-2">
            <input
              type="checkbox"
              name={question.question}
              value={choice}
              className="mr-2"
            />
            <label>{choice}</label>
          </div>
        ));
      case "textInput":
        return (
          <input
            type="text"
            name={question.question}
            className="w-full px-2 py-1 border rounded mb-2"
          />
        );
      case "textArea":
        return (
          <textarea
            name={question.question}
            className="w-full px-2 py-1 border rounded mb-2"
            rows="4"
          ></textarea>
        );
      default:
        return null;
    }
  };

  // Filter surveys based on whether they are answered or not
  const unansweredSurveys = surveys.filter((survey) => !survey.answered);
  const answeredSurveys = surveys.filter((survey) => survey.answered);

  const handleResponseChange = (questionId, answer) => {
    // Update user responses based on input changes
    setUserResponses(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSaveResponse = async () => {
    try {
        const answers = Object.entries(userResponses).map(([questionId, answer]) => ({
            questionId,
            answer,
        }));

        const response = await axios.post(`${backendUrl}/survey/respond`, {
            surveyId: selectedSurvey._id,
            answers,
        });

        console.log("Response saved:", response.data);
        closeModal(); // Close the modal after saving
    } catch (error) {
        console.error("Error saving response:", error.message);
    }
};

  const fetchSurveys = async () => {
    try {
        const response = await fetch(`${backendUrl}/survey/viewpublish`); // Updated to view all surveys
        const data = await response.json();

        // Check if data is an array and set surveys accordingly
        if (Array.isArray(data)) {
            console.log("Fetched all surveys:", data);
            setSurveys(data);
        } else {
            console.error("Unexpected response format:", data);
        }
    } catch (error) {
        console.error("Error fetching surveys:", error.message);
    }
};

// Use effect to fetch on component mount
useEffect(() => {
    fetchSurveys();
}, []);

const fetchSurveyById = async (surveyId) => {
  try {
      const response = await axios.get(`${backendUrl}/survey/viewpublish/${surveyId}`);
      setSelectedSurvey(response.data);
      setIsModalOpen(true);
  } catch (error) {
      console.error("Error fetching survey by ID:", error.message);
  }
};
  
  

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
      <h1 className="text-2xl font-medium text-gray-700 mb-6">Survey</h1>

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search Survey"
          className="w-full border border-black rounded-lg px-4 py-2"
        />
        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer">
          X
        </span>
      </div>

      <div className="mb-6">
        <span className="text-sm">Sort by:</span>
        <select className="ml-2 border border-black rounded px-3 py-1 text-sm">
          <option>Name (A-Z)</option>
          <option>Name (Z-A)</option>
        </select>
      </div>

      <div className="text-lg mb-4">Unanswered</div>

      <hr className="mb-6 border-black" />

      {surveys.map((survey) => (
  <div
    key={survey._id} // Use survey ID for unique keys
    className="survey-card mb-4 p-4 border border-black rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
    onClick={() => openModal(survey)}
    aria-label={`Survey: ${survey.name}, ${survey.responseCount} responses`}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === "Enter" && openModal(survey)}
  >
    <h3 className="text-lg font-semibold mb-1">{survey.name}</h3>
    <p className="text-sm text-gray-600">
      <span className="font-bold">{survey.responseCount}</span> responses
    </p>
  </div>
))}


      <div className="text-lg mb-4">Answered</div>

      <hr className="mb-6 border-black" />

      {answeredSurveys.map((survey, index) => (
        <div
          key={index}
          className="mb-4 p-4 border border-black rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => openModal(survey)}
          aria-label={`Survey: ${survey.name}, ${survey.responseCount} responses`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && openModal(survey)}
        >
          <div className="text-md font-medium mb-1">{survey.name}</div>
          <div className="text-sm text-gray-600">
            <strong>{survey.responseCount}</strong> responses
          </div>
        </div>
      ))}


      {/* Modal */}
      {isModalOpen && selectedSurvey && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div ref={modalRef} className="bg-white p-6 rounded-lg w-full h-auto overflow-y-auto relative">
          <button className="absolute top-4 right-4 text-black text-2xl" onClick={closeModal}>
            &times;
          </button>
          <div className="text-2xl font-medium mb-2">{selectedSurvey.name}</div>

          {selectedSurvey.questions.map((question, index) => (
            <div key={index} className="w-full rounded px-4 py-2 border border-black my-2">
              <div className="font-medium ">
                {index + 1}
                <span className="mr-2">.</span>
                {question.questionText}
              </div>
              <div>{renderInputField(question)}</div>
            </div>
          ))}

          {/* BOTTOM BUTTONS */}
          <div className="flex justify-center mt-16 space-x-3">
            <div className="">
              <button className="btn md:w-64 w-52 bg-fgray text-white" onClick={closeModal}>
                Cancel
              </button>
            </div>
            <div className="">
              <button className="btn md:w-64 w-52 bg-green text-white" onClick={handleSaveResponse}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  
    </div>
  );
}

export default Survey;
