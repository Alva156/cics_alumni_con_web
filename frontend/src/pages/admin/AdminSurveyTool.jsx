import React, { useState, useEffect, useRef } from "react";

function AdminSurveyTool() {
  const [surveys, setSurveys] = useState([
    {
      id: 1,
      name: "Survey Name 1",
      response: "999 responses",
      answered: false,
      questions: [
        {
          question: "Question 1",
          questionContent: "hello world",
          questionType: "radio",
          choices: ["choice 1", "choice 2", "choice 3"],
        },
        {
          question: "Question 2",
          questionContent: "hello world",
          questionType: "checkbox",
          choices: ["choice 1", "choice 2", "choice 3"],
        },
        {
          question: "Question 3",
          questionContent: "hello world",
          questionType: "textInput",
        },
        {
          question: "Question 4",
          questionContent: "hello world",
          questionType: "textArea",
        },
      ],
    },
    {
      id: 2,
      name: "Survey Name 2",
      response: "500 responses",
      answered: true,
      questions: [
        {
          question: "Question 1",
          questionContent: "another question content",
          questionType: "radio",
          choices: ["option 1", "option 2"],
        },
      ],
    },
  ]);

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

  const handleDeleteSurvey = (id) => {
    setSurveys((prevSurveys) =>
      prevSurveys.filter((survey) => survey.id !== id)
    );
  };

  const handlePublishSurvey = (id) => {
    setSurveys((prevSurveys) =>
      prevSurveys.map((survey) =>
        survey.id === id ? { ...survey, answered: !survey.answered } : survey
      )
    );
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
  const unansweredSurveys = surveys
    .filter((survey) => !survey.answered)
    .filter((survey) =>
      survey.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const answeredSurveys = surveys
    .filter((survey) => survey.answered)
    .filter((survey) =>
      survey.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
      <h1 className="text-xl mb-4">Survey Tool</h1>

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

      {unansweredSurveys.map((survey, index) => (
        <div
          key={index}
          className="mb-4 p-4 border border-black rounded-lg flex justify-between cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => openViewModal(survey)}
        >
          <div>
            <div className="text-md font-medium mb-1">{survey.name}</div>
            <div className="text-sm text-black-600">{survey.response}</div>
          </div>
          <div className="flex items-center">
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
            <div
              className="w-4 h-4 rounded-full bg-blue flex justify-center items-center cursor-pointer mr-2 relative group"
              onClick={(e) => {
                e.stopPropagation();
                handlePublishSurvey(survey.id);
              }}
            >
              <span className="hidden group-hover:block absolute bottom-8 bg-gray-700 text-white text-xs rounded px-2 py-1">
                Publish
              </span>
            </div>
          </div>
        </div>
      ))}

      <div className="text-lg mb-4">Published</div>

      <hr className="mb-6 border-black" />

      {answeredSurveys.map((survey) => (
        <div
          key={survey.id}
          className="mb-4 p-4 border border-black rounded-lg flex justify-between cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => openViewModal(survey)} // Update to open ViewModal
        >
          <div>
            <div className="text-md font-medium mb-1">{survey.name}</div>
            <div className="text-sm text-black-600">{survey.response}</div>
          </div>
          <div className="flex items-center">
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
            <div
              className="w-4 h-4 rounded-full bg-[#3D3C3C] flex justify-center items-center cursor-pointer mr-2 relative group"
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(survey);
              }} // Update to open EditModal
            >
              <span className="hidden group-hover:block absolute bottom-8 bg-gray-700 text-white text-xs rounded px-2 py-1">
                Edit
              </span>
            </div>
            <div
              className="w-4 h-4 rounded-full bg-orange flex justify-center items-center cursor-pointer mr-2 relative group"
              onClick={(e) => {
                e.stopPropagation();
                handlePublishSurvey(survey.id);
              }}
            >
              <span className="hidden group-hover:block absolute bottom-8 bg-gray-700 text-white text-xs rounded px-2 py-1">
                Unpublish
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* VIEW MODAL */}
      {isViewModalOpen && selectedSurvey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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
              <div className="">
                <button className="btn md:w-64 w-32 bg-blue text-white ">
                  Export to PDF
                </button>
              </div>
              <div className="">
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
                  <div className="">{renderInputField(question)}</div>
                  <div className="text-center">
                    {renderInputField(question)}
                  </div>
                  <div className="text-center">hello worlds</div>
                </div>
              </div>
            ))}

            {/* BOTTOM BUTTONS */}
            <div className="flex justify-center mt-16 space-x-3">
              <div className="">
                <button className="btn md:w-64 w-44 bg-fgray text-white">
                  Cancel
                </button>
              </div>
              <div className="">
                <button className="btn md:w-64 w-44 bg-green text-white">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedSurvey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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
    </div>
  );
}

export default AdminSurveyTool;
