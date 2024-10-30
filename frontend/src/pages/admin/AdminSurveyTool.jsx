import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { uniqueId } from "lodash"; // Make sure you import uniqueId

function AdminSurveyTool() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showMessage, setshowMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [questions, setQuestions] = useState([
    { questionText: "", questionType: "", choices: [""] },
  ]);

  // MODALS LOGIC
  const modalRef = useRef(null);

  const openViewModal = (survey) => {
    setSelectedSurvey(survey);
    setIsViewModalOpen(true);
  };

  const openEditModal = (survey) => {
    setSelectedSurvey(survey);
    setQuestions(
      survey.questions.map((question) => ({
        ...question,
        choices:
          question.choices ||
          (question.questionType === "radio" ||
            question.questionType === "checkbox"
            ? [""]
            : []),
      }))
    );
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (isViewModalOpen || isEditModalOpen || isAddModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isViewModalOpen, isEditModalOpen, isAddModalOpen]);

  const openAddModal = () => {
    setSelectedSurvey(null);
    setQuestions([{ questionText: "", questionType: "radio", choices: [""] }]);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setSelectedSurvey(null);
  };

  const openDeleteModal = (survey) => {
    setSelectedSurvey(survey);
    setIsDeleteModalOpen(true);
  };

  // QUESTION and OPTIONS LOGIC
  const handleAddOption = (questionIndex) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];

    // Only add options if the question type is radio or checkbox
    if (
      question.questionType === "radio" ||
      question.questionType === "checkbox"
    ) {
      const lastOption = question.choices.slice(-1)[0];

      if (lastOption !== "") {
        question.choices.push("");
        setQuestions(newQuestions);
      }
    }
  };

  const handleOptionChange = (questionIndex, optionIndex, newValue) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].choices[optionIndex] = newValue;
    setQuestions(updatedQuestions);
  };

  const handleQuestionChange = (questionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].questionText = value;
    setQuestions(newQuestions);
  };

  const handleQuestionTypeChange = (questionIndex, newType) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      const question = { ...updatedQuestions[questionIndex] };

      question.questionType = newType;

      // Initialize choices for multiple choice types
      if (newType === "radio" || newType === "checkbox") {
        // Initialize with one empty choice if there are no choices
        if (!question.choices || question.choices.length === 0) {
          question.choices = [""];
        }
      } else {
        // Clear choices for non-choice types
        question.choices = [];
      }

      updatedQuestions[questionIndex] = question;
      return updatedQuestions;
    });
  };

  const handleDeleteOption = (questionIndex, optionIndex) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      const updatedChoices = [...updatedQuestions[questionIndex].choices];

      // Remove the selected choice by its index
      updatedChoices.splice(optionIndex, 1);
      updatedQuestions[questionIndex].choices = updatedChoices;

      return updatedQuestions;
    });
  };

  const renderOptionInputs = (question, questionIndex) => {
    const { questionType, choices } = question;

    if (questionType === "radio" || questionType === "checkbox") {
      return choices.map((option, optionIndex) => (
        <div key={optionIndex} className="flex items-center mb-2">
          <input
            type={questionType}
            name={`question-${questionIndex}`}
            disabled
            className="mr-2"
          />
          <input
            type="text"
            className="border border-black px-2 py-1 rounded w-full"
            value={option}
            onChange={(e) =>
              handleOptionChange(questionIndex, optionIndex, e.target.value)
            }
          />
          <button
            className="ml-2 w-4 h-4 rounded-full bg-[#BE142E]"
            onClick={() => handleDeleteOption(questionIndex, optionIndex)}
          >

          </button>
        </div>
      ));
    } else if (questionType === "textInput") {
      return (
        <input
          type="text"
          className="border border-black px-2 py-1 rounded w-full"
        />
      );
    } else if (questionType === "textArea") {
      return (
        <textarea
          className="border border-black px-2 py-1 rounded w-full"
          rows="4"
        ></textarea>
      );
    }
    return null;
  };

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

  const addQuestion = () => {
    // Add a new question with default values
    setQuestions((prevQuestions) => [
      ...prevQuestions,
      { questionText: "", questionType: "", choices: [""] },
    ]);
  };

  const handleDeleteQuestion = (questionIndex) => {
    const updatedQuestions = questions.filter((_, index) => index !== questionIndex);
    setQuestions(updatedQuestions);
  };

  const unansweredSurveys = surveys.filter(survey => !survey.published);
  const answeredSurveys = surveys.filter(survey => survey.published);


  // MAIN FUNCTIONS
  const createSurvey = async (surveyData) => {
    try {
      // Assuming you store your token in localStorage; adjust if stored elsewhere
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${backendUrl}/survey/create`,
        surveyData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send token as a Bearer token
          },
          withCredentials: true, // Important if the token is in cookies
        }
      );

      console.log("Survey created successfully, response:", response);
      return response;
    } catch (error) {
      console.error("Error in createSurvey:", error.response || error.message || error);
      throw error;
    }
  };

  const handlePublishSurvey = async (surveyId) => {
    console.log("Toggling publish status for survey with ID:", surveyId);

    // Find the survey to publish
    const surveyToToggle = surveys.find(survey => survey._id === surveyId);
    if (!surveyToToggle) {
      console.error("Survey not found in local state");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/survey/publish/${surveyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ published: !surveyToToggle.published }) // Toggle the published status
      });

      if (!response.ok) {
        throw new Error('Failed to toggle publish status for the survey');
      }

      // Update the surveys array to reflect the new published status
      setSurveys(prevSurveys =>
        prevSurveys.map(survey =>
          survey._id === surveyId ? { ...survey, published: !survey.published } : survey
        )
      );

      console.log("Survey publish status toggled successfully");
    } catch (error) {
      console.error("Error toggling publish status for survey:", error);
    }
  };

  const handleSaveSurvey = async () => {
    const surveyData = {
      title: selectedSurvey?.name || "New Survey", // Ensure this is 'title'
      questions: questions.filter(q => q.questionText && q.questionType) // Ensure valid questions
    };

    // Ensure at least one question is valid
    if (!surveyData.questions.length) {
      alert("At least one question must be provided with valid text and type.");
      return;
    }

    try {
      console.log("Attempting to save survey:", surveyData);
      const response = await createSurvey(surveyData);
      if (response && response.data && response.data.survey) {
        console.log("Survey response data:", response.data.survey);
        setSurveys(prevSurveys => [...prevSurveys, response.data.survey]);
        closeModal();
      } else {
        console.error("Unexpected response structure:", response);
      }
    } catch (error) {
      console.error("Failed to create survey:", error.message || error);
      alert("Failed to create survey.");
    }
  };

  const handleDeleteSurvey = async (survey) => {
    if (!survey) {
      console.log("No survey selected for deletion.");
      return;
    }

    console.log("Deleting survey with ID:", survey._id); // Debugging line

    try {
      const response = await axios.delete(
        `${backendUrl}/survey/delete/${survey._id}`,
        { withCredentials: true }
      );

      console.log("Delete response:", response.data); // Debugging line
      fetchSurveys(); // Refresh surveys list
      closeModal(); // Close modal after deleting
      setshowMessage("Survey deleted successfully!");
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Error deleting survey:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleUpdateSurvey = async () => {
    if (!selectedSurvey || !questions) {
        alert("Survey data is incomplete. Please ensure questions are properly loaded.");
        return;
    }

    // Prepare survey data to be updated
    const surveyData = {
        title: selectedSurvey.name || "",
        questions: questions.map(q => ({
            questionText: q.questionText,  // Capture the updated question text
            questionType: q.questionType,    // Capture the updated question type
            choices: q.choices || [],        // Include choices
            options: (q.options || []).map(option => ({
                text: option.text,           // Assuming option has a 'text' field
                _id: option._id,             // Include the ID for the option if it exists
            })) // Map options to include updated text and IDs
        })).filter(q => q.questionText && q.questionType) // Filter out invalid questions
    };

    console.log("Prepared survey data for update:", surveyData); // Log the prepared data

    // Check for at least one valid question
    if (!surveyData.questions.length) {
        alert("At least one question with valid text and type is required.");
        return;
    }

    try {
        const token = localStorage.getItem("token");

        console.log("Updating survey with ID:", selectedSurvey._id); // Log the survey ID being updated

        const response = await axios.put(
            `${backendUrl}/survey/update/${selectedSurvey._id}`,
            surveyData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            }
        );

        if (response && response.data && response.data.survey) {
            console.log("Updated survey response data:", response.data.survey);
            setSurveys(prevSurveys =>
                prevSurveys.map(survey =>
                    survey._id === selectedSurvey._id ? response.data.survey : survey
                )
            );
            closeModal();
            setshowMessage("Survey updated successfully!");
            setSuccessMessage(true);
            setTimeout(() => setSuccessMessage(false), 3000);
        } else {
            console.error("Unexpected response structure:", response);
        }
    } catch (error) {
        console.error("Failed to update survey:", error.message || error);
        alert("Failed to update survey.");
        if (error.response) {
            console.error("Error response data:", error.response.data); // Log the error response data
            setshowMessage(error.response.data.message);
            setErrorMessage(true);
            setTimeout(() => setErrorMessage(false), 3000);
        }
    }
};



// USE EFFECTS
  const fetchSurveys = async () => {
    try {
      const response = await fetch(`${backendUrl}/survey/view`);
      const data = await response.json();
      console.log('Fetched Surveys:', data); // Check the structure of data
      setSurveys(data);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    }
  };

  useEffect(() => {
    fetchSurveys(); // Call it here, but now it's also available for other functions
  }, []);

  useEffect(() => {
    if (isEditModalOpen && selectedSurvey) {
      setSelectedSurvey((prevSurvey) => {
        const lastQuestion = prevSurvey.questions[prevSurvey.questions.length - 1];

        // Check if the last question is empty; if not, add a new empty question
        if (lastQuestion && lastQuestion.questionText === "") {
          return prevSurvey; // No change if the last question is already empty
        }

        return {
          ...prevSurvey,
          questions: [
            ...prevSurvey.questions,
            { questionText: "", questionType: "", choices: [""] }, // New empty question
          ],
        };
      });
    }
  }, [isEditModalOpen]);


  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">

      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-64 sm:w-96">
            <h2 className="text-2xl mb-4">Delete Survey</h2>
            <p>Are you sure you want to delete this survey?</p>
            <div className="flex justify-end mt-4">
              <button
                className="btn btn-sm w-24 bg-red text-white mr-2"
                onClick={async () => {
                  await handleDeleteSurvey(selectedSurvey); // Call delete function
                  setIsDeleteModalOpen(false); // Close the modal after deletion
                }}
              >
                Delete
              </button>
              <button
                className="btn btn-sm w-24 bg-gray-500 text-white"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-medium text-gray-700">Survey Tool</h1>
      </div>

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search Company"
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
        <select className="ml-2 border border-black rounded px-3 py-1 text-sm">
          <option>Name (A-Z)</option>
          <option>Name (Z-A)</option>
        </select>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-lg">Drafts</div>
        <button
          className="btn btn-sm w-36 bg-green text-white"
          onClick={openAddModal}
        >
          +
        </button>
      </div>

      <hr className="mb-6 border-black" />
      {unansweredSurveys.length > 0 ? (
        unansweredSurveys.map((survey, index) => (
          <div
            key={index}
            className="mb-4 p-4 border border-black rounded-lg flex justify-between cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => openViewModal(survey)}
          >
            <div>
              <div className="text-md font-medium mb-1">{survey.name}</div>
              <div className="text-sm text-black-600">{survey.response || "No responses yet."}</div>
            </div>
            <div className="flex items-center">
              {/* Delete Button */}
              <div
                className="w-4 h-4 rounded-full bg-[#BE142E] flex justify-center items-center cursor-pointer mr-2 relative group"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteModal(survey); // Open the modal and pass the full survey object
                }}
              >
                <span className="hidden group-hover:block absolute bottom-8 bg-gray-700 text-white text-xs rounded px-2 py-1">
                  Delete
                </span>
              </div>
              {/* Edit Button */}
              <div
                className="w-4 h-4 rounded-full bg-[#3D3C3C] flex justify-center items-center cursor-pointer mr-2 relative group"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(survey);
                }}
              >
                <span className="hidden group-hover:block absolute bottom-8 bg-gray-700 text-white text-xs rounded px-2 py-1">
                  Edit
                </span>
              </div>
              {/* Publish Button */}
              <div
                className="w-4 h-4 rounded-full bg-blue flex justify-center items-center cursor-pointer mr-2 relative group"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePublishSurvey(survey._id); // Call the function to handle publishing
                }}
                role="button" // Make it clear it's a button
                tabIndex={0} // Make it focusable
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { // Allow activation via keyboard
                    e.stopPropagation();
                    handlePublishSurvey(survey._id);
                  }
                }}
              >
                <span className="hidden group-hover:block absolute bottom-8 bg-gray-700 text-white text-xs rounded px-2 py-1">
                  Publish
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="mb-4 text-center text-gray-500">No unanswered surveys available.</div>
      )}

      <div className="text-lg mb-4">Published Surveys</div>
      <hr className="mb-6 border-black" />

      {answeredSurveys.length > 0 ? (
        answeredSurveys.map((survey, index) => (
          <div
            key={index}
            className="mb-4 p-4 border border-black rounded-lg flex justify-between cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => openViewModal(survey)} // Update to open ViewModal
          >
            <div>
              <div className="text-md font-medium mb-1">{survey.name}</div>
              <div className="text-sm text-black-600">{survey.response || "No responses recorded."}</div>
            </div>
            <div className="flex items-center">
              {/* Delete Button */}
              <div
                className="w-4 h-4 rounded-full bg-[#BE142E] flex justify-center items-center cursor-pointer mr-2 relative group"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteModal(survey); // Open the modal and pass the full survey object
                }}
              >
                <span className="hidden group-hover:block absolute bottom-8 bg-gray-700 text-white text-xs rounded px-2 py-1">
                  Delete
                </span>
              </div>
              {/* Edit Button */}
              <div
                className="w-4 h-4 rounded-full bg-[#3D3C3C] flex justify-center items-center cursor-pointer mr-2 relative group"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(survey); // Update to open EditModal
                }}
              >
                <span className="hidden group-hover:block absolute bottom-8 bg-gray-700 text-white text-xs rounded px-2 py-1">
                  Edit
                </span>
              </div>
              {/* Unpublish Button */}
              <div
                className="w-4 h-4 rounded-full bg-orange flex justify-center items-center cursor-pointer mr-2 relative group"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Attempting to unpublish survey with ID:", survey._id); // Log ID
                  handlePublishSurvey(survey._id); // Call to handle publishing/unpublishing
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    handlePublishSurvey(survey._id);
                  }
                }}
              >
                <span className="hidden group-hover:block absolute bottom-8 bg-gray-700 text-white text-xs rounded px-2 py-1">
                  Unpublish
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="mb-4 text-center text-gray-500">No answered surveys available.</div>
      )}


      {/* VIEW MODAL */}
      {isViewModalOpen && selectedSurvey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-105">
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
            <div className="w-full rounded bg-hgray px-3 py-2 space-y-2 border border-fgray">
              <div className="text-xs font-light">Responses</div>
              <div className="text-xl font-normal">999</div>
            </div>

            <div className="w-full rounded bg-hgray px-3 py-2 space-y-2 mt-2 border border-fgray">
              <div className="text-xs font-light">Date Created</div>
              <div className="text-xl font-normal">August 20, 2024</div>
            </div>

            <div className="flex mt-4 space-x-3">
              <div>
                <button className="btn md:w-64 w-32 bg-blue text-white ">
                  Export to PDF
                </button>
              </div>
              <div>
                <button className="btn md:w-64 w-32 bg-green text-white">
                  Export to Excel
                </button>
              </div>
            </div>

            <div className="mt-6">Results Summary</div>

            {selectedSurvey.questions.map((question, index) => (
              <div
                key={index}
                className="w-full rounded px-4 py-2 border border-black my-2"
              >
                <div className="font-medium ">
                  {index + 1}
                  <span className="mr-2">.</span>
                  {question.questionText}
                </div>
                <div className="flex justify-between mt-2">
                  <div>{renderInputField(question)}</div>
                  <div className="text-center">{renderInputField(question)}</div>
                  <div className="text-center">hello worlds</div>
                </div>
              </div>
            ))}

            {/* BOTTOM BUTTONS */}
            <div className="flex justify-center mt-16 space-x-3">
              <div>
                <button className="btn md:w-64 w-44 bg-fgray text-white">
                  Cancel
                </button>
              </div>
              <div>
                <button className="btn md:w-64 w-44 bg-green text-white">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* EDIT MODAL */}
{isEditModalOpen && selectedSurvey && (
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
                {selectedSurvey ? `Edit Survey: ${selectedSurvey.name}` : "New Survey"}
            </div>

            <div className="mb-4">
                <label className="block text-sm mb-1">Survey Title</label>
                <input
                    type="text"
                    className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                    value={selectedSurvey.name}
                    onChange={(e) => {
                        const updatedSurvey = { ...selectedSurvey, name: e.target.value };
                        setSelectedSurvey(updatedSurvey);
                    }}
                />
            </div>

            {/* Map through existing questions */}
            {questions.map((question, questionIndex) => (
                <div key={questionIndex} className="mb-6">
                    <div className="flex items-center mb-2">
                        <label className="block text-sm flex-1">
                            Question {questionIndex + 1}
                        </label>
                        {/* Delete Question Button */}
                        <button
                            className="ml-2 w-4 h-4 rounded-full bg-[#BE142E] text-sm rounded text-white"
                            onClick={() => handleDeleteQuestion(questionIndex)}
                        >
                            
                        </button>
                    </div>
                    <input
                        type="text"
                        className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm mb-3"
                        value={question.questionText}
                        onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                    />

                    <div className="mb-4">
                        <select
                            className="select select-sm select-bordered w-full max-w-xs"
                            value={question.questionType}
                            onChange={(e) => handleQuestionTypeChange(questionIndex, e.target.value)}
                        >
                            <option disabled value="">
                                Question Type
                            </option>
                            <option value="radio">Multiple choices</option>
                            <option value="checkbox">Checkboxes</option>
                            <option value="textInput">Short answer</option>
                            <option value="textArea">Multi-line answer</option>
                        </select>
                    </div>

                    {/* Render Options using renderOptionInputs */}
                    {renderOptionInputs(question, questionIndex)}

                    {/* Add Option button for radio/checkbox types */}
                    {(question.questionType === "radio" || question.questionType === "checkbox") && (
                        <button
                            className="btn btn-sm bg-blue text-white mt-2"
                            onClick={() => handleAddOption(questionIndex)}
                        >
                            Add Option
                        </button>
                    )}

                    <hr className="my-4 border-black" />
                </div>
            ))}

            {/* Button to add a new question */}
            <div className="mb-6">
                <button
                    className="btn md:w-64 w-44 bg-green text-white"
                    onClick={() => {
                        setQuestions([...questions, { questionText: "", questionType: "", choices: [""] }]);
                    }}
                >
                    Add Question
                </button>
            </div>

            <div className="flex justify-center mt-16 space-x-3">
                <button className="btn md:w-64 w-44 bg-fgray text-white" onClick={closeModal}>
                    Cancel
                </button>
                <button className="btn md:w-64 w-44 bg-green text-white" onClick={handleUpdateSurvey}>
                    Save
                </button>
            </div>
        </div>
    </div>
)}



      {/* ADD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-1000">
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

            <div className="mb-4">
              <label className="block text-sm mb-1">Survey Title</label>
              <input
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                value={selectedSurvey?.name || ""}
                onChange={(e) => {
                  setSelectedSurvey((prevSurvey) => ({
                    ...prevSurvey,
                    name: e.target.value,
                  }));
                }}
              />
            </div>

            {questions.map((question, questionIndex) => (
              <div key={questionIndex} className="mb-6">
                <div className="flex items-center mb-2">
                  <label className="block text-sm  flex-1">
                    Question {questionIndex + 1}
                  </label>
                  {/* Delete Question Button */}
                  <button
                    className="ml-2 w-4 h-4 rounded-full bg-[#BE142E] text-sm rounded text-white"
                    onClick={() => handleDeleteQuestion(questionIndex)}
                  >

                  </button>
                </div>
                <input
                  type="text"
                  className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm mb-3"
                  value={question.questionText}
                  onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                />

                <div className="mb-4">
                  <select
                    className="select select-sm select-bordered w-full max-w-xs"
                    value={question.questionType}
                    onChange={(e) =>
                      handleQuestionTypeChange(questionIndex, e.target.value)
                    }
                  >
                    <option disabled value="">
                      Question Type
                    </option>
                    <option value="radio">Multiple choices</option>
                    <option value="checkbox">Checkboxes</option>
                    <option value="textInput">Short answer</option>
                    <option value="textArea">Multi-line answer</option>
                  </select>
                </div>
                {renderOptionInputs(question, questionIndex)}
                {(question.questionType === "radio" || question.questionType === "checkbox") && (
                  <button
                    className="btn btn-sm bg-blue text-white mt-2"
                    onClick={() => handleAddOption(questionIndex)}
                  >
                    Add Option
                  </button>
                )}
                <hr className="my-4 border-black" />
              </div>
            ))}

            {/* Button to add a new question */}
            <div className="mb-6">
              <button
                className="btn md:w-64 w-44 bg-green text-white"
                onClick={addQuestion}
              >
                Add Question
              </button>
            </div>

            <div className="flex justify-center mt-16 space-x-3">
              <button className="btn md:w-64 w-44 bg-fgray text-white" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn md:w-64 w-44 bg-green text-white" onClick={handleSaveSurvey}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-128">asdasdas</div>
    </div>
  );
}

export default AdminSurveyTool;
