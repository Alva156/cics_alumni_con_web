import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function Survey() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [surveys, setSurveys] = useState([]);
  const [answeredSurveys, setAnsweredSurveys] = useState([]);
  const [unansweredSurveys, setUnansweredSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessMessage, setSuccessMessage] = useState(false);
  const [showErrorMessage, setErrorMessage] = useState(false);
  const [showMessage, setshowMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("Name (A-Z)");
  const [userResponses, setUserResponses] = useState({});
  const modalRef = useRef(null);

  const openModal = async (survey) => {
    await fetchSurveyById(survey._id);
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
    const userAnswer = userResponses[question._id]; // Get the user's answer for the question
    switch (question.questionType) {
      case "radio":
        return question.choices.map((choice, idx) => (
          <div key={idx} className="flex items-center mb-2">
            <input
              type="radio"
              name={question._id}
              value={choice}
              checked={userAnswer === choice} // Check if the answer matches
              onChange={() =>
                handleResponseChange(question._id, choice, "radio")
              }
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
              name={question._id}
              value={choice}
              checked={userAnswer && userAnswer.includes(choice)} // Check if choice is selected
              onChange={() =>
                handleResponseChange(question._id, choice, "checkbox")
              }
              className="mr-2"
            />
            <label>{choice}</label>
          </div>
        ));
      case "textInput":
        return (
          <input
            type="text"
            name={question._id}
            value={userAnswer || ""} // Pre-fill with existing answer
            onChange={(e) =>
              handleResponseChange(question._id, e.target.value, "textInput")
            }
            className="w-full px-2 py-1 border rounded mb-2"
          />
        );
      case "textArea":
        return (
          <textarea
            name={question._id}
            value={userAnswer || ""} // Pre-fill with existing answer
            onChange={(e) =>
              handleResponseChange(question._id, e.target.value, "textArea")
            }
            className="w-full px-2 py-1 border rounded mb-2"
            rows="4"
          ></textarea>
        );
      default:
        return null;
    }
  };

  // Filter surveys based on whether they are answered or not

  const handleResponseChange = (questionId, answer, type) => {
    setUserResponses((prev) => ({
      ...prev,
      [questionId]:
        type === "checkbox"
          ? (prev[questionId] || []).includes(answer)
            ? prev[questionId].filter((item) => item !== answer)
            : [...(prev[questionId] || []), answer]
          : answer,
    }));
  };

  const handleSaveResponse = async () => {
    try {
      const answers = Object.entries(userResponses).map(
        ([questionId, answer]) => ({
          questionId,
          answer,
        })
      );

      // Log the data being sent to the backend
      console.log("Sending response to backend:", {
        surveyId: selectedSurvey._id,
        answers,
      });

      // Make sure the token is included in the request cookies
      const response = await axios.post(
        `${backendUrl}/survey/respond`,
        {
          surveyId: selectedSurvey._id,
          answers,
        },
        { withCredentials: true }
      ); // Enable withCredentials to send cookies

      setshowMessage("Response saved successfully!");
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);

      console.log("Response saved successfully:", response.data);

      // Refresh the surveys to update answered and unanswered sections
      await fetchSurveys();

      // Close the modal after the data is refreshed
      closeModal();
    } catch (error) {
      if (error.response) {
        console.error("Error saving response:", error.response.data);
        console.error("HTTP status code:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
    }
  };

  const fetchSurveys = async () => {
    try {
      // Use axios to make a GET request with credentials
      const response = await axios.get(`${backendUrl}/survey/viewpublish`, {
        withCredentials: true,
      });

      // Extract data from response
      const data = response.data;

      // Check if the response contains the expected structure with answeredSurveys and unansweredSurveys
      if (data.answeredSurveys && data.unansweredSurveys) {
        console.log("Fetched answered and unanswered surveys:", data);

        // Set the surveys for both answered and unanswered sections
        setAnsweredSurveys(data.answeredSurveys);
        setUnansweredSurveys(data.unansweredSurveys);
      } else {
        // Handle unexpected response structure
        console.error("Unexpected response format:", data);
      }
    } catch (error) {
      if (error.response) {
        console.error("Error fetching surveys:", error.response.data);
        console.error("HTTP status code:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
    }
  };

  // Use effect to fetch on component mount
  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveyById = async (surveyId) => {
    try {
      const response = await axios.get(
        `${backendUrl}/survey/viewpublish/${surveyId}`,
        { withCredentials: true } // Ensures cookies are sent with the request
      );
      const surveyData = response.data;
      setSelectedSurvey(surveyData);

      const existingResponses = surveyData.questions.reduce((acc, question) => {
        const previousAnswer = surveyData.previousAnswers.find(
          (answer) => answer.questionId === question._id
        );
        acc[question._id] = previousAnswer ? previousAnswer.answer : "";
        return acc;
      }, {});
      setUserResponses(existingResponses);

      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching survey by ID:", error.message);
    }
  };

  const filteredAndSortedSurveys = unansweredSurveys
    .filter((survey) => {
      return survey.name.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      if (sortOption === "Name (A-Z)") {
        return a.name.localeCompare(b.name);
      } else if (sortOption === "Name (Z-A)") {
        return b.name.localeCompare(a.name);
      } else if (sortOption === "Responses (Lowest-Highest)") {
        return (a.responseCount || 0) - (b.responseCount || 0);
      } else if (sortOption === "Responses (Highest-Lowest)") {
        return (b.responseCount || 0) - (a.responseCount || 0);
      }
      return 0;
    });

  const filteredAndSortedAnsweredSurveys = answeredSurveys
    .filter((survey) => {
      return survey.name.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      if (sortOption === "Name (A-Z)") {
        return a.name.localeCompare(b.name);
      } else if (sortOption === "Name (Z-A)") {
        return b.name.localeCompare(a.name);
      } else if (sortOption === "Responses (Lowest-Highest)") {
        return (a.responseCount || 0) - (b.responseCount || 0);
      } else if (sortOption === "Responses (Highest-Lowest)") {
        return (b.responseCount || 0) - (a.responseCount || 0);
      }
      return 0;
    });

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green text-white p-4 rounded-lg shadow-lg z-50">
          <p>{showMessage}</p>
        </div>
      )}

      {showErrorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red text-white p-4 rounded-lg shadow-lg z-50">
          <p>{showMessage}</p>
        </div>
      )}

      <h1 className="text-2xl font-medium text-gray-700 mb-6">Survey</h1>

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search Survey"
          className="w-full border border-black rounded-lg px-4 py-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
          onClick={() => setSearchTerm("")}
        >
          X
        </span>
      </div>

      <div className="mb-6">
        <span className="text-sm">Sort by:</span>
        <select
          className="ml-2 border border-black rounded px-3 py-1 text-sm"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="Name (A-Z)">Name (A-Z)</option>
          <option value="Name (Z-A)">Name (Z-A)</option>
          <option value="Responses (Lowest-Highest)">
            Responses (Lowest-Highest)
          </option>
          <option value="Responses (Highest-Lowest)">
            Responses (Highest-Lowest)
          </option>
        </select>
      </div>

      <div className="text-lg mb-4">Unanswered</div>

      <hr className="mb-6 border-black" />

      {filteredAndSortedSurveys.map((survey) => (
        <div
          key={survey._id}
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

      {filteredAndSortedAnsweredSurveys.map((survey) => (
        <div
          key={survey._id}
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

      {/* Modal */}
      {isModalOpen && selectedSurvey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            ref={modalRef}
            className="bg-white p-6 md:p-8 lg:p-12 rounded-lg max-w-full md:max-w-3xl lg:max-w-4xl w-full h-auto overflow-y-auto max-h-full relative"
          >
            <button
              className="absolute top-4 right-4 text-black text-2xl"
              onClick={closeModal}
            >
              &times;
            </button>
            <div className="text-2xl font-medium mb-2">
              {selectedSurvey.name}
            </div>

            {selectedSurvey.questions.map((question, index) => (
              <div
                key={index}
                className="w-full rounded px-4 py-2 border border-black my-2"
              >
                <div className="font-medium">
                  {index + 1}
                  <span className="mr-2">.</span>
                  {question.questionText}
                </div>
                <div>
                  {renderInputField({
                    ...question,
                    answer: userResponses[question._id],
                  })}
                </div>
              </div>
            ))}

            {/* BOTTOM BUTTONS */}
            <div className="flex justify-center mt-16 space-x-3">
              <div>
                <button
                  className="btn md:w-64 w-52 bg-fgray text-white"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
              <div>
                <button
                  className="btn md:w-64 w-52 bg-green text-white"
                  onClick={handleSaveResponse}
                >
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
