import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { uniqueId } from "lodash"; // Make sure you import uniqueId

function AdminSurveyTool() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [questions, setQuestions] = useState([
    { questionText: "", questionType: "", choices: [""] },
  ]);

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

    if (value !== "" && questionIndex === newQuestions.length - 1) {
      setQuestions([
        ...newQuestions,
        { questionText: "", questionType: "", choices: [""] },
      ]);
    }
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

  // const handleDeleteSurvey = (id) => {
  //   setSurveys((prevSurveys) =>
  //     prevSurveys.filter((survey) => survey.id !== id)
  //   );
  // };

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

  // Filter surveys based on search term
  const unansweredSurveys = surveys.filter(survey => !survey.published);
const answeredSurveys = surveys.filter(survey => survey.published);

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

const handleDeleteSurvey = async () => {
  if (!selectedSurvey) {
    console.log("No survey selected for deletion.");
    return;
  }

  console.log("Deleting survey with ID:", selectedSurvey._id); // Debugging line

  try {
    const response = await axios.delete(
      `${backendUrl}/surveys/delete-survey/${selectedSurvey._id}`,
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
  if (!selectedSurvey) return;

  // Check if required fields are filled in
  if (!selectedSurvey.title || !selectedSurvey.questions || selectedSurvey.questions.length === 0) {
    setshowMessage("Please fill in all required fields.");
    setErrorMessage(true);
    setTimeout(() => setErrorMessage(false), 3000);
    return;
  }

  const surveyData = new FormData();
  surveyData.append("title", selectedSurvey.title);
  surveyData.append("questions", JSON.stringify(selectedSurvey.questions)); // Assuming questions is an array of objects

  const image = document.getElementById("survey-image").files[0]; // Adjust this ID based on your input
  if (image) {
    surveyData.append("image", image);
  }
  setLoading(true); // Start loading

  try {
    const response = await axios.put(
      `${backendUrl}/surveys/update-survey/${selectedSurvey._id}`,
      surveyData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );

    // Update the survey in the local state
    setSurveys((prevSurveys) =>
      prevSurveys.map((survey) =>
        survey._id === selectedSurvey._id
          ? response.data
          : survey
      )
    );

    closeModal();
    setshowMessage("Survey updated successfully!");
    setSuccessMessage(true);
    setTimeout(() => {
      setSuccessMessage(false);
    }, 3000);
  } catch (error) {
    console.error("Error updating survey:", error);
    if (error.response) {
      setshowMessage(error.response.data.msg);
      setErrorMessage(true);
      setTimeout(() => setErrorMessage(false), 3000);
    }
  } finally {
    setLoading(false); // Stop loading
  }
};



useEffect(() => {
  const fetchSurveys = async () => {
    try {
      const response = await fetch(`${backendUrl}/survey/view`); // Adjust the endpoint as necessary
      const data = await response.json();
      console.log('Fetched Surveys:', data);
      setSurveys(data); // Assuming you're using useState for surveys
    } catch (error) {
      console.error('Error fetching surveys:', error);
    }
  };
  fetchSurveys();
}, []);


  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
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
            handleDeleteSurvey(survey.id);
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
            handleDeleteSurvey(survey.id);
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
            {question.questionContent}
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
              {selectedSurvey
                ? `Edit Survey: ${selectedSurvey.name}`
                : "New Survey"}
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">Survey Title</label>
              <input
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                value={selectedSurvey.name}
                onChange={(e) => {
                  const updatedSurvey = {
                    ...selectedSurvey,
                    name: e.target.value,
                  };
                  setSelectedSurvey(updatedSurvey);
                }}
              />
            </div>

            {selectedSurvey.questions.map((question, questionIndex) => (
              <div key={questionIndex}>
                <div className="mb-4">
                  <label className="block text-sm mb-1">
                    Question {questionIndex + 1}
                  </label>
                  <input
                    type="text"
                    className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                    value={question.questionContent}
                    onChange={(e) => {
                      const updatedQuestions = [...selectedSurvey.questions];
                      updatedQuestions[questionIndex].questionContent =
                        e.target.value;
                      setSelectedSurvey({
                        ...selectedSurvey,
                        questions: updatedQuestions,
                      });
                    }}
                  />
                </div>

                <div className="mb-4">
                  <select
                    className="select select-sm select-bordered w-full max-w-xs"
                    value={question.questionType}
                    onChange={(e) => {
                      const updatedQuestions = [...selectedSurvey.questions];
                      const newType = e.target.value;
                      const updatedQuestion = {
                        ...updatedQuestions[questionIndex],
                        questionType: newType,
                      };

                      // Adjust options based on the new type
                      if (newType === "radio" || newType === "checkbox") {
                        updatedQuestion.choices = updatedQuestion.choices || [
                          "",
                        ];
                      } else {
                        updatedQuestion.choices = [];
                      }

                      updatedQuestions[questionIndex] = updatedQuestion;
                      setSelectedSurvey({
                        ...selectedSurvey,
                        questions: updatedQuestions,
                      });
                    }}
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
                {question.questionType === "radio" ||
                question.questionType === "checkbox" ? (
                  <button
                    className="btn btn-sm bg-blue text-white mt-2"
                    onClick={() => handleAddOption(questionIndex)}
                  >
                    Add Option
                  </button>
                ) : null}

                <hr className="my-4 border-black" />
              </div>
            ))}

            <div className="flex justify-center mt-16 space-x-3">
              <div className="">
                <button
                  className="btn md:w-64 w-44 bg-fgray text-white"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
              <div className="">
                <button
                  className="btn md:w-64 w-44 bg-green text-white"
                  onClick={() => {
                    // Logic to save the updated survey details
                    const updatedSurveys = surveys.map((survey) =>
                      survey.id === selectedSurvey.id ? selectedSurvey : survey
                    );
                    setSurveys(updatedSurveys);
                    closeModal();
                  }}
                >
                  Save
                </button>
              </div>
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
          <div className="mb-4">
            <label className="block text-sm mb-1">
              Question {questionIndex + 1}
            </label>
            <input
              type="text"
              className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
              value={question.questionText}
              onChange={(e) =>
                handleQuestionChange(questionIndex, e.target.value)
              }
            />
          </div>
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
          {question.questionType === "radio" ||
          question.questionType === "checkbox" ? (
            <button
              className="btn btn-sm bg-blue text-white mt-2"
              onClick={() => handleAddOption(questionIndex)}
            >
              Add Option
            </button>
          ) : null}
          <hr className="my-4 border-black" />
        </div>
      ))}
      <div className="flex justify-center mt-16 space-x-3">
        <div className="">
          <button
            className="btn md:w-64 w-44 bg-fgray text-white"
            onClick={closeModal}
          >
            Cancel
          </button>
        </div>
        <div className="">
          <button
            className="btn md:w-64 w-44 bg-green text-white"
            onClick={handleSaveSurvey}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
)}
<div className="h-128">asdasdas</div>
    </div>
  );
}

export default AdminSurveyTool;
