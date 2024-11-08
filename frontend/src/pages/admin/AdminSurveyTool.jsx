import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import alumniconnectlogo2 from "../../assets/alumniconnectlogo2.png";
import cicslogo from "../../assets/cicslogo.png";
import { uniqueId } from "lodash"; // Make sure you import uniqueId
import { Pie } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function AdminSurveyTool() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState(null);
  const [showSuccessMessage, setSuccessMessage] = useState(false);
  const [showErrorMessage, setErrorMessage] = useState(false);
  const [showMessage, setshowMessage] = useState("");
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSurveyReportModalOpen, setIsSurveyReportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("Name (A-Z)");
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openGenderDropdown, setOpenGenderDropdown] = useState(false);
  const [openRegionDropdown, setOpenRegionDropdown] = useState(false);
  const [openCollegeDropdown, setOpenCollegeDropdown] = useState(false);
  const [openProgramDropdown, setOpenProgramDropdown] = useState(false);
  const [openBatchYearDropdown, setOpenBatchYearDropdown] = useState(false);
  const [selectedGender, setSelectedGender] = useState("All"); // Default "All"
  const [selectedRegion, setSelectedRegion] = useState("All"); // Default "All"
  const [selectedCollege, setSelectedCollege] = useState("All"); // Default "All"
  const [selectedProgram, setSelectedProgram] = useState("All"); // Default "All"
  const [selectedBatchYears, setSelectedBatchYears] = useState([]); // Empty array means "All batch years"
  const [loading, setLoading] = useState(false);
  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-8 border-red border-solid border-opacity-75"></div>
    </div>
  );
  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return "";
    }
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };
  const getBatchYears = () => {
    if (!selectedSurvey?.responses) {
      return []; // Return an empty array if responses are not available
    }

    const years = selectedSurvey.responses
      .map((response) => response.userId?.yearGraduatedCollege)
      .filter((year) => year !== null && year !== undefined && year !== ""); // Filter out null, undefined, and empty strings

    return [...new Set(years)]; // Removes duplicates and returns unique years
  };
  const filterResponses = () => {
    return selectedSurvey.responses.filter((response) => {
      // Filter by Gender (skip if "All")
      if (
        selectedGender !== "All" &&
        response.userId?.gender !== selectedGender
      ) {
        return false;
      }

      // Filter by Region (skip if "All")
      if (
        selectedRegion !== "All" &&
        response.userId?.region !== selectedRegion
      ) {
        return false;
      }

      // Filter by College (skip if "All")
      if (
        selectedCollege !== "All" &&
        response.userId?.college !== selectedCollege
      ) {
        return false;
      }

      // Filter by College Program (skip if "All")
      if (
        selectedProgram !== "All" &&
        response.userId?.collegeProgram !== selectedProgram
      ) {
        return false;
      }

      // Filter by Batch Year (skip if no years selected, i.e., "All" batch years)
      if (
        selectedBatchYears.length > 0 &&
        !selectedBatchYears.includes(response.userId?.yearGraduatedCollege)
      ) {
        return false;
      }

      return true; // Include this response if it matches all criteria
    });
  };

  const filteredAlumniCount = selectedSurvey?.responses
    ? filterResponses().length
    : 0;

  const filteredResponses = selectedSurvey?.responses ? filterResponses() : [];

  // Function to count filtered alumni based on their employment status
  const countByStatus = (status) => {
    return filteredResponses.filter(
      (response) =>
        response.userId?.employmentStatus &&
        response.userId.employmentStatus.trim().toLowerCase() ===
          status.toLowerCase()
    ).length;
  };

  const batchYears = getBatchYears();
  const collegeDropdownRef = useRef(null);
  const programDropdownRef = useRef(null);
  const batchYearDropdownRef = useRef(null);
  const genderDropdownRef = useRef(null);
  const regionDropdownRef = useRef(null);
  const dropdownRef = useRef(null);
  const [questions, setQuestions] = useState([
    { questionText: "", questionType: "", choices: [""] },
  ]);
  const generateRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Create an array of random colors for each choice
  const generateColorsForChoices = (choices) => {
    return choices.map(() => generateRandomColor());
  };
  const getCountByField = (responses, field) => {
    return responses.reduce((count, response) => {
      const value = response.userId?.[field];
      if (value) {
        count[value] = (count[value] || 0) + 1;
      }
      return count;
    }, {});
  };

  const renderBarChartData = (data, label) => ({
    labels: Object.keys(data),
    datasets: [
      {
        label: label, // General label for the dataset
        data: Object.values(data), // Data values for each category
        backgroundColor: generateColorsForChoices(Object.keys(data)),
      },
    ],
  });

  const renderPieChartData = (data, label) => ({
    labels: Object.keys(data),
    datasets: [
      {
        label: label,
        data: Object.values(data),
        backgroundColor: generateColorsForChoices(Object.keys(data)),
      },
    ],
  });

  const renderChartsContainer = (survey) => (
    <div>
      {/* Bar Chart for Academic Unit */}
      <div className="chart-container w-full rounded px-3 py-2 space-y-2 border border-fgray mt-2">
        <h3 className="text-lg font-semibold mb-2">
          Number of Alumni per College
        </h3>
        <div className="chart-container w-full">
          <Bar
            data={renderBarChartData(
              getCountByField(survey.responses, "college"),
              "Academic Units"
            )}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              aspectRatio: 2,
              plugins: {
                legend: {
                  display: true,
                  position: "bottom",
                  labels: {
                    generateLabels: (chart) => {
                      const data = chart.data;
                      return data.labels.map((label, i) => {
                        const count = data.datasets[0].data[i] || 0;
                        return {
                          text: `${label} - ${count}`, // Display label with the count
                          fillStyle: data.datasets[0].backgroundColor[i],
                          hidden: false,
                          index: i,
                        };
                      });
                    },
                    font: {
                      size: (context) => {
                        const width = context.chart.width;
                        return width > 800 ? 14 : width > 500 ? 12 : 8;
                      },
                    },
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    display: false,
                  },
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
              onResize: (chart) => {
                const width = chart.width;
                const fontSize = width > 800 ? 14 : width > 500 ? 12 : 8;
                chart.options.plugins.legend.labels.font.size = fontSize;
                chart.update();
              },
            }}
          />
        </div>
      </div>

      {/* Bar Chart for Program */}
      <div className="chart-container w-full rounded px-3 py-2 space-y-2 border border-fgray mt-2">
        <h3 className="text-lg font-semibold mb-2">
          Number of Alumni per College Program
        </h3>
        <div className="chart-container w-full">
          <Bar
            data={renderBarChartData(
              getCountByField(survey.responses, "collegeProgram"),
              "Programs"
            )}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              aspectRatio: 2,
              plugins: {
                legend: {
                  display: true,
                  position: "bottom",
                  labels: {
                    generateLabels: (chart) => {
                      const data = chart.data;
                      return data.labels.map((label, i) => {
                        const count = data.datasets[0].data[i] || 0;
                        return {
                          text: `${label} - ${count}`, // Display label with the count
                          fillStyle: data.datasets[0].backgroundColor[i],
                          hidden: false,
                          index: i,
                        };
                      });
                    },
                    font: {
                      size: (context) => {
                        const width = context.chart.width;
                        return width > 800 ? 14 : width > 500 ? 12 : 8;
                      },
                    },
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    display: false,
                  },
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
              onResize: (chart) => {
                const width = chart.width;
                const fontSize = width > 800 ? 14 : width > 500 ? 12 : 8;
                chart.options.plugins.legend.labels.font.size = fontSize;
                chart.update();
              },
            }}
          />
        </div>
      </div>

      {/* Bar Chart for Batch */}
      <div className="chart-container w-full rounded px-3 py-2 space-y-2 border border-fgray mt-2">
        <h3 className="text-lg font-semibold mb-2">
          Number of Alumni per Batch
        </h3>
        <div className="chart-container w-full">
          <Bar
            data={renderBarChartData(
              getCountByField(survey.responses, "yearGraduatedCollege"),
              "Batches"
            )}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              aspectRatio: 2,
              plugins: {
                legend: {
                  display: true,
                  position: "bottom",
                  labels: {
                    generateLabels: (chart) => {
                      const data = chart.data;
                      return data.labels.map((label, i) => {
                        const count = data.datasets[0].data[i] || 0;
                        return {
                          text: `${label} - ${count}`, // Display label with the count
                          fillStyle: data.datasets[0].backgroundColor[i],
                          hidden: false,
                          index: i,
                        };
                      });
                    },
                    font: {
                      size: (context) => {
                        const width = context.chart.width;
                        return width > 800 ? 14 : width > 500 ? 12 : 8;
                      },
                    },
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    display: false,
                  },
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
              onResize: (chart) => {
                const width = chart.width;
                const fontSize = width > 800 ? 14 : width > 500 ? 12 : 8;
                chart.options.plugins.legend.labels.font.size = fontSize;
                chart.update();
              },
            }}
          />
        </div>
      </div>

      {/* Pie Chart for Region */}
      <div className="chart-container w-full rounded px-3 py-2 space-y-2 border border-fgray mt-2">
        <h3 className="text-lg font-semibold mb-2">
          Number of Alumni per Region
        </h3>
        <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 mx-auto chart-container">
          <Pie
            data={renderPieChartData(
              getCountByField(survey.responses, "region"),
              "Region"
            )}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: "bottom",
                  labels: {
                    generateLabels: (chart) => {
                      const data = chart.data;
                      return data.labels.map((label, i) => {
                        const count = data.datasets[0].data[i] || 0;
                        return {
                          text: `${label} - ${count}`, // Show label with the count
                          fillStyle: data.datasets[0].backgroundColor[i],
                          hidden: false, // Ensure that the label is never hidden, even if the count is zero
                          index: i,
                        };
                      });
                    },
                  },
                },
                tooltip: {
                  callbacks: {
                    label: (tooltipItem) => {
                      const count = tooltipItem.raw || 0; // Get the raw value (count)
                      return `${count} Alumni`; // Display only the count with "Alumni"
                    },
                  },
                },
              },
            }}
            width={300}
            height={300}
          />
        </div>
      </div>

      {/* Pie Chart for Gender */}
      <div className="chart-container w-full rounded px-3 py-2 space-y-2 border border-fgray mt-2">
        <h3 className="text-lg font-semibold mb-2">
          Number of Alumni per Gender
        </h3>
        <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 mx-auto chart-container">
          <Pie
            data={renderPieChartData(
              getCountByField(survey.responses, "gender"),
              "Gender"
            )}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: "bottom",
                  labels: {
                    generateLabels: (chart) => {
                      const data = chart.data;
                      return data.labels.map((label, i) => {
                        const count = data.datasets[0].data[i] || 0;
                        return {
                          text: `${label} - ${count}`, // Show label with the count
                          fillStyle: data.datasets[0].backgroundColor[i],
                          hidden: false, // Ensure that the label is never hidden, even if the count is zero
                          index: i,
                        };
                      });
                    },
                  },
                },
                tooltip: {
                  callbacks: {
                    label: (tooltipItem) => {
                      const count = tooltipItem.raw || 0; // Get the raw value (count)
                      return `${count} Alumni`; // Display only the count with "Alumni"
                    },
                  },
                },
              },
            }}
            width={300}
            height={300}
          />
        </div>
      </div>
    </div>
  );
  const renderPieChartsContainer = (survey) => (
    <div>
      {survey.questions.map((question, questionIndex) => {
        // Check the question type and render accordingly
        if (
          question.questionType === "radio" ||
          question.questionType === "checkbox"
        ) {
          const answerCounts = {};

          // Calculate answer frequencies for multiple-choice questions
          survey.responses.forEach((response) => {
            const answer = response.answers.find(
              (a) => a.questionId === question._id
            );
            if (answer) {
              const answerValue = answer.answer;
              if (Array.isArray(answerValue)) {
                answerValue.forEach((val) => {
                  answerCounts[val] = (answerCounts[val] || 0) + 1;
                });
              } else {
                answerCounts[answerValue] =
                  (answerCounts[answerValue] || 0) + 1;
              }
            }
          });

          const pieData = {
            labels: question.choices,
            datasets: [
              {
                data: question.choices.map(
                  (choice) => answerCounts[choice] || 0
                ),
                backgroundColor: generateColorsForChoices(question.choices),
              },
            ],
          };

          const pieOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: "bottom",
                labels: {
                  generateLabels: (chart) => {
                    const data = chart.data;
                    return data.labels.map((label, i) => {
                      const count = data.datasets[0].data[i] || 0;
                      return {
                        text: `${label} - ${count}`,
                        fillStyle: data.datasets[0].backgroundColor[i],
                        hidden: false, // Ensure that the label is never hidden, even if the count is zero
                        index: i,
                      };
                    });
                  },
                },
              },
              tooltip: {
                callbacks: {
                  label: (tooltipItem) => {
                    const count = tooltipItem.raw || 0; // Get the raw value (count)
                    return `${count} Alumni`; // Display only the count with "Alumni"
                  },
                },
              },
            },
          };

          return (
            <div
              className="chart-container w-full rounded px-3 py-2 space-y-2 border border-fgray mt-2 "
              key={questionIndex}
            >
              <h3 className="text-lg font-semibold mb-2">
                {question.questionText}
              </h3>
              {Object.keys(answerCounts).length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  <p>No responses</p>
                </div>
              ) : (
                <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 mx-auto chart-container ">
                  <Pie
                    data={pieData}
                    options={pieOptions}
                    width={300} // Width in pixels
                    height={300}
                  />
                </div>
              )}
            </div>
          );
        } else if (
          question.questionType === "textInput" ||
          question.questionType === "textArea"
        ) {
          // For text-based responses
          const textResponses = survey.responses
            .map((response) => {
              const answer = response.answers.find(
                (a) => a.questionId === question._id
              );
              return answer ? answer.answer : null;
            })
            .filter(Boolean); // Filter out null responses

          return (
            <div
              className="chart-container w-full rounded px-3 py-2 space-y-2 border border-fgray mt-2"
              key={questionIndex}
            >
              <h3 className="text-lg font-semibold mb-2">
                {question.questionText}
              </h3>
              <div className="text-sm text-gray-600 ">
                {textResponses.length > 0 ? (
                  <p className="mb-2">
                    {textResponses.length} Alumni Responses
                  </p>
                ) : (
                  <p>No responses yet.</p>
                )}
                <ul className="list-disc pl-5 space-y-1">
                  {textResponses.map((response, responseIndex) => (
                    <li
                      key={responseIndex}
                      className="text-gray-800 break-words max-w-full overflow-hidden"
                    >
                      -- {response}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );

  // MODALS LOGIC
  const modalRef = useRef(null);

  const toggleGenderDropdown = () => {
    setOpenGenderDropdown((prev) => !prev);
  };

  const toggleRegionDropdown = () => {
    setOpenRegionDropdown((prev) => !prev);
  };

  const toggleCollegeDropdown = () =>
    setOpenCollegeDropdown(!openCollegeDropdown);
  const toggleProgramDropdown = () =>
    setOpenProgramDropdown(!openProgramDropdown);
  const toggleBatchYearDropdown = () =>
    setOpenBatchYearDropdown(!openBatchYearDropdown);

  const handleCollegeSelect = (college) => {
    setSelectedCollege(
      (prev) => (prev === college ? null : college) // Toggle selection
    );
  };

  const handleBatchYearSelect = (year) => {
    setSelectedBatchYears((prev) => {
      if (prev.includes(year)) {
        // If the year is already selected, remove it
        return prev.filter((y) => y !== year);
      } else {
        // Otherwise, add it to the selected years
        return [...prev, year];
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        genderDropdownRef.current &&
        !genderDropdownRef.current.contains(event.target)
      ) {
        setOpenGenderDropdown(false);
      }
      if (
        regionDropdownRef.current &&
        !regionDropdownRef.current.contains(event.target)
      ) {
        setOpenRegionDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const regions = [
    "Region I",
    "Region II",
    "Region III",
    "Region IV-A",
    "Region IV-B",
    "Region V",
    "Region VI",
    "Region VII",
    "Region VIII",
    "Region IX",
    "Region X",
    "Region XI",
    "Region XII",
    "Region XIII",
    "NCR",
    "ARMM",
    "BARMM",
    "CAR",
  ];

  const collegePrograms = {
    "UST-AMV College of Accountancy": [
      "Accountancy",
      "Accounting Information System",
      "Management Accounting",
    ],
    "College of Architecture": ["Architecture"],
    "Faculty of Arts and Letters": [
      "Asian Studies",
      "Behavioral Science",
      "Communication",
      "Creative Writing",
      "Economics",
      "English Language Studies",
      "History",
      "Journalism",
      "Legal Management",
      "Literature",
      "Philosophy",
      "Political Science",
      "Sociology",
    ],
    "Faculty of Civil Law": ["Juris Doctor"],
    "College of Commerce and Business Administration": [
      "Business Administration, major in Business Economics",
      "Business Administration, major in Financial Management",
      "Business Administration, major in Human Resource Management",
      "Business Administration, major in Marketing Management",
      "Entrepreneurship",
    ],
    "College of Education": [
      "Secondary Education Major in English",
      "Secondary Education Major in Filipino",
      "Secondary Education Major in Mathematics",
      "Secondary Education Major in Religious and Values Education",
      "Secondary Education Major in Science",
      "Secondary Education Major in Social Studies",
      "Early Childhood Education",
      "Elementary Education",
      "Special Needs Education, major in Early Childhood Education",
      "Food Technology",
      "Nutrition and Dietetics",
      "Bachelor of Library and Information Science",
    ],
    "Faculty of Engineering": [
      "Chemical Engineering",
      "Civil Engineering",
      "Electrical Engineering",
      "Electronics Engineering",
      "Industrial Engineering",
      "Mechanical Engineering",
    ],
    "College of Fine Arts and Design": [
      "Fine Arts, major in Advertising Arts",
      "Fine Arts, major in Industrial Design",
      "Interior Design",
      "Fine Arts, major in Painting",
    ],
    "College of Information and Computing Sciences": [
      "Computer Science",
      "Information Systems",
      "Information Technology",
    ],
    "Faculty of Medicine and Surgery": [
      "Basic Human Studies",
      "Doctor of Medicine",
      "Master in Clinical Audiology",
      "Master in Pain Management",
    ],
    "Conservatory of Music": [
      "Performance, major in Bassoon",
      "Performance, major in Choral Conducting",
      "Performance, major in Clarinet",
      "Composition",
      "Performance, major in Double Bass",
      "Performance, major in Flute",
      "Performance, major in French Horn",
      "Performance, major in Guitar",
      "Jazz",
      "Musicology",
      "Music Education",
      "Music Theatre",
      "Music Technology",
      "Performance, major in Oboe",
      "Performance, major in Orchestral Conducting",
      "Performance, major in Percussion",
      "Performance, major in Piano",
      "Performance, major in Saxophone",
      "Performance, major in Trombone",
      "Performance, major in Trumpet",
      "Performance, major in Tuba",
      "Performance, major in Viola",
      "Performance, major in Violin",
      "Performance, major in Violoncello",
      "Performance, major in Voice",
    ],
    "College of Nursing": ["Nursing"],
    "Faculty of Pharmacy": [
      "Biochemistry",
      "Medical Technology",
      "Pharmacy",
      "Pharmacy, major in Clinical Pharmacy",
      "Doctor of Pharmacy",
    ],
    "Institute of Physical Education and Athletics": [
      "Fitness and Sports Management",
    ],
    "College of Rehabilitation Sciences": [
      "Occupational Therapy",
      "Physical Therapy",
      "Speech-Language Pathology",
      "Sports Science",
    ],
    "College of Science": [
      "Applied Mathematics, major in Actuarial Science",
      "Applied Physics, major in Instrumentation",
      "Biology, major in Environmental Biology",
      "Biology, major in Medical Biology",
      "Bachelor of Science major in Molecular Biology and Biotechnology",
      "Chemistry",
      "Data Science and Analytics",
      "Microbiology",
      "Psychology",
    ],
    "College of Tourism and Hospitality Management": [
      "Hospitality Management, major in Culinary Entrepreneurship",
      "Hospitality Management, major in Hospitality Leadership",
      "Tourism Management, major in Recreation and Leisure Management",
      "Tourism Management, major in Travel Operation and Service Management",
    ],
    "Faculty of Canon Law": [
      "Doctor of Canon Law",
      "Licentiate in Canon Law",
      "Bachelor of Canon Law",
    ],
    "Faculty of Philosophy": [
      "Doctor of Philosophy",
      "Licentiate in Philosophy",
      "Bachelor of Philosophy (Classical)",
    ],
    "Faculty of Sacred Theology": [
      "Doctor of Sacred Theology",
      "Licentiate in Sacred Theology",
      "Bachelor of Sacred Theology",
    ],
  };

  const openSurveyReportModal = (survey) => {
    setSelectedSurvey(survey);
    setIsSurveyReportModalOpen(true);
  };

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

  const closeSurveyReportModal = () => {
    setIsSurveyReportModalOpen(false);
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
          ></button>
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
    const updatedQuestions = questions.filter(
      (_, index) => index !== questionIndex
    );
    setQuestions(updatedQuestions);
  };

  const unansweredSurveys = surveys.filter((survey) => !survey.published);
  const answeredSurveys = surveys.filter((survey) => survey.published);

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
      setshowMessage("Survey created successfully!");
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);

      console.log("Survey created successfully, response:", response);
      return response;
    } catch (error) {
      console.error(
        "Error in createSurvey:",
        error.response || error.message || error
      );
      throw error;
    }
  };

  const handleTogglePublishStatus = (surveyId) => {
    const surveyToToggle = surveys.find((survey) => survey._id === surveyId);

    if (surveyToToggle) {
      // Show the modal when unpublishing (currently published) or republishing (currently unpublished)
      if (
        surveyToToggle.published ||
        (!surveyToToggle.published && surveyToToggle.hasBeenPublished)
      ) {
        setSelectedSurveyId(surveyId);
        setIsPublishModalOpen(true); // Open the modal for unpublishing or republishing
      } else {
        // Proceed directly if publishing for the first time (never been published before)
        handlePublishSurvey(surveyId);
      }
    }
  };

  const handlePublishSurvey = async (surveyId) => {
    setLoading(false);
    console.log("Toggling publish status for survey with ID:", surveyId);

    const surveyToToggle = surveys.find((survey) => survey._id === surveyId);
    if (!surveyToToggle) {
      console.error("Survey not found in local state");
      return;
    }
    // Only set loading to true if we are publishing the survey (i.e., survey is currently unpublished)
    if (!surveyToToggle.published) {
      setLoading(true); // Show loading when publishing
    }
    try {
      const response = await fetch(`${backendUrl}/survey/publish/${surveyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ published: !surveyToToggle.published }), // Toggle the published status
      });

      if (surveyToToggle.published) {
        setshowMessage("Survey unpublished!"); // Message when unpublishing
      } else {
        setshowMessage("Survey published!"); // Message when publishing
      }

      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);

      if (!response.ok) {
        throw new Error("Failed to toggle publish status for the survey");
      }

      console.log("Survey publish status toggled successfully");

      // Refresh surveys to reflect changes
      await fetchSurveys();
    } catch (error) {
      console.error("Error toggling publish status for survey:", error);
    } finally {
      // Set loading to false after the operation (publish or unpublish) is complete
      setLoading(false);
    }
  };

  const handleConfirmPublish = () => {
    if (selectedSurveyId) {
      handlePublishSurvey(selectedSurveyId); // Publish or unpublish
    }
    setIsPublishModalOpen(false); // Close the modal after confirming
  };

  const handleSaveSurvey = async () => {
    const surveyData = {
      title: selectedSurvey?.name || "New Survey", // Ensure this is 'title'
      questions: questions.filter((q) => q.questionText && q.questionType), // Ensure valid questions
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
        setSurveys((prevSurveys) => [...prevSurveys, response.data.survey]);
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
      alert(
        "Survey data is incomplete. Please ensure questions are properly loaded."
      );
      return;
    }

    // Prepare survey data to be updated
    const surveyData = {
      title: selectedSurvey.name || "",
      questions: questions
        .map((q) => ({
          questionText: q.questionText, // Capture the updated question text
          questionType: q.questionType, // Capture the updated question type
          choices: q.choices || [], // Include choices
          options: (q.options || []).map((option) => ({
            text: option.text, // Assuming option has a 'text' field
            _id: option._id, // Include the ID for the option if it exists
          })), // Map options to include updated text and IDs
        }))
        .filter((q) => q.questionText && q.questionType), // Filter out invalid questions
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
        setSurveys((prevSurveys) =>
          prevSurveys.map((survey) =>
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
      const response = await axios.get(`${backendUrl}/survey/view`);
      const data = response.data;
      console.log("Fetched Surveys:", data); // Check the structure of data
      setSurveys(data);
    } catch (error) {
      console.error("Error fetching surveys:", error);
    }
  };

  useEffect(() => {
    fetchSurveys(); // Call it here, but now it's also available for other functions
  }, []);

  useEffect(() => {
    if (isEditModalOpen && selectedSurvey) {
      setSelectedSurvey((prevSurvey) => {
        const lastQuestion =
          prevSurvey.questions[prevSurvey.questions.length - 1];

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
  const dashboardRef = useRef(null);
  const exportToPDF = () => {
    if (dashboardRef.current) {
      window.print(); // Triggers the print dialog
    }
  };
  const getBase64 = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
  const generatePDF = async () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a3",
    });

    // Convert images to base64
    const alumniconnectlogo2Base64 = await getBase64(alumniconnectlogo2);
    const cicsLogoBase64 = await getBase64(cicslogo);

    // Add CICS logo (left side)
    doc.addImage(cicsLogoBase64, "PNG", 40, 30, 48, 48); // Left-side logo
    doc.setFontSize(10);
    doc.setTextColor("#000000");
    doc.text("University of Santo Tomas", 100, 52); // Align beside the logo
    doc.setFontSize(8);
    doc.text("College of Information and Computing Sciences", 100, 62); // Align beside the logo

    // Add AlumniConnect logo (right side)
    doc.addImage(
      alumniconnectlogo2Base64,
      "PNG",
      doc.internal.pageSize.width - 90,
      30,
      50,
      50
    ); // Right-side logo

    // Add "Alumni Connect" text beside AlumniConnect logo
    const textY = 60;
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#2d2b2b");
    const alumniTextWidth = doc.getTextWidth("Alumni");
    const alumniTextX = doc.internal.pageSize.width - 250; // Position text beside logo
    doc.text("Alumni", alumniTextX, textY);
    doc.setTextColor("#be142e");
    const connectTextX = alumniTextX + alumniTextWidth + 5; // Slight gap after "Alumni"
    doc.text("Connect", connectTextX, textY);

    doc.setFontSize(20);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#000000");
    doc.text(
      "CICS Alumni Connect Survey Report",
      doc.internal.pageSize.width / 2,
      100,
      {
        align: "center",
      }
    );

    // Calculate summary counts
    const filteredResponses = filterResponses();
    const summaryCounts = {
      totalAlumni: filteredResponses.length,
      batches: {},
      colleges: {},
      programs: {},
      genders: {},
      regions: {},
    };

    filteredResponses.forEach((response) => {
      const { yearGraduatedCollege, college, collegeProgram, gender, region } =
        response.userId || {};

      if (yearGraduatedCollege) {
        summaryCounts.batches[yearGraduatedCollege] =
          (summaryCounts.batches[yearGraduatedCollege] || 0) + 1;
      }
      if (college) {
        summaryCounts.colleges[college] =
          (summaryCounts.colleges[college] || 0) + 1;
      }
      if (collegeProgram) {
        summaryCounts.programs[collegeProgram] =
          (summaryCounts.programs[collegeProgram] || 0) + 1;
      }
      if (gender) {
        summaryCounts.genders[gender] =
          (summaryCounts.genders[gender] || 0) + 1;
      }
      if (region) {
        summaryCounts.regions[region] =
          (summaryCounts.regions[region] || 0) + 1;
      }
    });

    // Display Alumni Summary table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor("#be142e");
    doc.text("Alumni Summary", 40, 160); // Section title with red color

    // Prepare the summary data for the table
    const summaryData = [
      ["Total Alumni", "", summaryCounts.totalAlumni],
      ...Object.entries(summaryCounts.batches).map(([year, count]) => [
        "Batch",
        year,
        count,
      ]),
      ...Object.entries(summaryCounts.colleges).map(([college, count]) => [
        "College",
        college,
        count,
      ]),
      ...Object.entries(summaryCounts.programs).map(([program, count]) => [
        "Program",
        program,
        count,
      ]),
      ...Object.entries(summaryCounts.genders).map(([gender, count]) => [
        "Gender",
        gender,
        count,
      ]),
      ...Object.entries(summaryCounts.regions).map(([region, count]) => [
        "Region",
        region,
        count,
      ]),
    ];

    // Render the summary data table
    autoTable(doc, {
      head: [["Category", "Item", "Count"]],
      body: summaryData,
      startY: 180, // Adjust as needed based on previous sections
      styles: { fontSize: 10, textColor: "#333" },
      headStyles: { fillColor: "#be142e", textColor: "#fff" },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 200 },
        2: { cellWidth: 100 },
      },
      margin: { top: 5, bottom: 10, left: 40, right: 40 },
    });

    // Start adding individual responses as tables
    let startY = doc.autoTable.previous.finalY + 20;

    filteredResponses.forEach((response, index) => {
      // Default fields for each respondent
      const defaultFields = [
        ["First Name", response.userId?.firstName || "---------"],
        ["Last Name", response.userId?.lastName || "---------"],
        ["Birthday", formatDate(response.userId?.birthday) || "---------"],
        ["College", response.userId?.college || "---------"],
        ["College Program", response.userId?.collegeProgram || "---------"],
        [
          "Year Graduated",
          response.userId?.yearGraduatedCollege || "---------",
        ],
        ["Gender", response.userId?.gender || "---------"],
        ["Region", response.userId?.region || "---------"],
        ["Employment Status", response.userId?.employmentStatus || "---------"],
      ];

      // Dynamic fields for each question in the survey, with numbering
      const questionFields =
        selectedSurvey?.questions.map((question, qIndex) => {
          const userAnswer = response.answers.find(
            (ans) => ans.questionId.toString() === question._id.toString()
          );
          return [
            `Question ${qIndex + 1} (${question.questionText})`,
            userAnswer
              ? Array.isArray(userAnswer.answer)
                ? userAnswer.answer.join(", ") // For checkbox type questions
                : userAnswer.answer // For other question types
              : "---------",
          ];
        }) || [];

      // Combine default fields and question answers into one table
      autoTable(doc, {
        head: [[`Alumni ${index + 1}`, "Field", "Value"]],
        body: [
          ...defaultFields.map((field) => ["", field[0], field[1]]),
          ...questionFields.map((field) => ["", field[0], field[1]]),
        ],
        startY,
        styles: { fontSize: 10, textColor: "#333" },
        headStyles: { fillColor: "#be142e", textColor: "#fff" },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 200 },
          2: { cellWidth: 200 },
        },
        margin: { top: 5, bottom: 10, left: 40, right: 40 },
      });

      startY = doc.autoTable.previous.finalY + 20; // Adds space after each response
    });

    // Add page numbers at the bottom of each page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 20,
        {
          align: "center",
        }
      );
    }

    // Save the generated PDF
    doc.save("cicsalumniconnect_survey_report.pdf");
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
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12 ">
      {loading && <LoadingSpinner />} {/* Show loading spinner */}
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
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
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
      <div className="flex items-center mb-4 no-print">
        <h1 className="text-2xl font-medium text-gray-700">Survey Tool</h1>
      </div>
      <div className="mb-4 relative no-print">
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
      {/* Sort Dropdown */}
      <div className="mb-6 no-print">
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
      <div className="flex justify-between items-center mb-4 no-print">
        <div className="text-lg">Drafts</div>
        <button
          className="btn btn-sm w-36 bg-green text-white"
          onClick={openAddModal}
        >
          +
        </button>
      </div>
      <hr className="mb-6 border-black no-print" />
      {filteredAndSortedSurveys.length > 0 ? (
        filteredAndSortedSurveys.map((survey, index) => (
          <div
            key={index}
            className="mb-4 p-4 border border-black rounded-lg flex justify-between cursor-pointer hover:bg-gray-200 transition-colors no-print"
            onClick={() => openViewModal(survey)}
          >
            <div className="no-print">
              <div className="text-md font-medium mb-1">{survey.name}</div>
              <div className="text-sm text-black-600">
                {survey.responseCount
                  ? `${survey.responseCount} responses`
                  : "No responses recorded."}
              </div>
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
                  const surveyToToggle = surveys.find(
                    (s) => s._id === survey._id
                  ); // Find the survey
                  if (surveyToToggle && !surveyToToggle.published) {
                    setSelectedSurveyId(survey._id); // Set the ID for confirmation
                    setIsPublishModalOpen(true); // Open the confirmation modal
                  } else {
                    handlePublishSurvey(survey._id); // Call the function to handle publishing
                  }
                }}
                role="button" // Make it clear it's a button
                tabIndex={0} // Make it focusable
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    // Allow activation via keyboard
                    e.stopPropagation();
                    const surveyToToggle = surveys.find(
                      (s) => s._id === survey._id
                    ); // Find the survey
                    if (surveyToToggle && !surveyToToggle.published) {
                      setSelectedSurveyId(survey._id); // Set the ID for confirmation
                      setIsPublishModalOpen(true); // Open the confirmation modal
                    } else {
                      handlePublishSurvey(survey._id); // Call the function to handle publishing
                    }
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
        <div className="mb-4 text-center text-gray-500 no-print">
          No unanswered surveys available.
        </div>
      )}
      <div className="text-lg mb-4 no-print">Published Surveys</div>
      <hr className="mb-6 border-black no-print " />
      {filteredAndSortedAnsweredSurveys.length > 0 ? (
        filteredAndSortedAnsweredSurveys.map((survey, index) => (
          <div
            key={index}
            className="mb-4 p-4 border border-black rounded-lg flex justify-between cursor-pointer hover:bg-gray-200 transition-colors no-print"
            onClick={() => openViewModal(survey)} // Update to open ViewModal
          >
            <div className="no-print">
              <div className="text-md font-medium mb-1">{survey.name}</div>
              <div className="text-sm text-black-600">
                {survey.responseCount
                  ? `${survey.responseCount} responses`
                  : "No responses recorded."}
              </div>
            </div>
            <div className="flex items-center">
              {/* Unpublish Button */}
              <div
                className="w-4 h-4 rounded-full bg-orange flex justify-center items-center cursor-pointer mr-2 relative group"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(
                    "Attempting to unpublish survey with ID:",
                    survey._id
                  ); // Log ID
                  handleTogglePublishStatus(survey._id); // Call to handle unpublishing and show modal if needed
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    handleTogglePublishStatus(survey._id); // Call to handle unpublishing via keyboard
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
        <div className="mb-4 text-center text-gray-500 no-print">
          No answered surveys available.
        </div>
      )}
      {/* VIEW MODAL */}
      {isViewModalOpen && selectedSurvey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 print-modal ">
          <div
            ref={(modalRef, dashboardRef)}
            className="bg-white p-6 md:p-8 lg:p-12 rounded-lg max-w-full md:max-w-3xl lg:max-w-4xl w-full h-auto overflow-y-auto max-h-full relative print-content"
          >
            <button
              className="absolute top-4 right-4 text-black text-2xl no-print"
              onClick={closeModal}
            >
              &times;
            </button>
            <div className="text-2xl font-medium mb-2">
              {selectedSurvey.name}
            </div>

            <div>
              <div className="text-md font-medium">Survey Dashboard</div>
              <div className="w-full rounded bg-hgray px-3 py-2 space-y-2 border border-fgray">
                <div className="text-xs font-light">Responses</div>
                <div className="text-xl font-normal">
                  {selectedSurvey?.responseCount || 0}
                </div>
              </div>
              <div className="w-full rounded bg-hgray px-3 py-2 space-y-2 mt-2 border border-fgray">
                <div className="text-xs font-light">Date Created</div>
                <div className="text-xl font-normal">
                  {selectedSurvey?.createdAt
                    ? new Date(selectedSurvey.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "Date not available"}
                </div>
              </div>
              <div className="w-full mt-4 rounded px-3 py-2 space-y-2 border border-fgray no-print">
                <div className="text-md font-medium">Survey Reports</div>
                <div className="text-sm font-light">
                  View individual responses by clicking the button below.
                </div>
                <div className="flex mt-4 space-x-3">
                  <div>
                    <button
                      className="btn md:w-64 w-32 bg-green text-white"
                      onClick={() => openSurveyReportModal(selectedSurvey)}
                    >
                      View Reports
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex mt-6 space-x-3">
                <div>
                  <button
                    onClick={exportToPDF}
                    className="btn md:w-64 w-32 bg-blue text-white no-print "
                  >
                    Export Dashboard to PDF
                  </button>
                </div>
              </div>
              <div className="mb-8">
                {renderChartsContainer(selectedSurvey)}
              </div>
              <div className="chart-container">
                <div className="text-lg font-light">Questions Summary</div>
                <div>{renderPieChartsContainer(selectedSurvey)}</div>
              </div>
            </div>
          </div>

          {/* SURVEY REPORT MODAL */}
          {isSurveyReportModalOpen && selectedSurvey && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div
                ref={modalRef}
                className="bg-white p-6 md:p-8 lg:p-12 rounded-lg max-w-full md:max-w-8xl lg:max-w-10xl w-full h-auto overflow-y-auto max-h-full relative" // Increased max width
              >
                <button
                  className="absolute top-4 right-4 text-black text-2xl"
                  onClick={closeSurveyReportModal}
                >
                  &times;
                </button>
                <div className="text-2xl font-medium mb-4">
                  {selectedSurvey.name} Individual Survey Report
                </div>
                <div className="text-md mb-2 font-normal mt-2">Filters:</div>

                {/* Filter Dropdown */}
                <div className="sm:flex block sm:space-x-4">
                  {/* Gender Dropdown */}
                  <div className="relative mb-6" ref={genderDropdownRef}>
                    <button
                      onClick={toggleGenderDropdown}
                      className="btn-sm border border-black focus:ring-4 focus:outline-none focus:ring-blue-300 font-light rounded-lg text-sm px-5 py-2.5 flex justify-between items-center sm:w-64 w-full relative bg-transparent"
                    >
                      <span>Gender</span>
                      <svg
                        className={`w-2.5 h-2.5 ms-3 absolute right-4 transition-transform duration-300 ease-in-out ${
                          openGenderDropdown ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m1 1 4 4 4-4"
                        />
                      </svg>
                    </button>

                    {openGenderDropdown && (
                      <div className="z-10 absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                        <ul className="p-3 text-sm text-gray-700">
                          {["All", "Male", "Female"].map((gender, idx) => (
                            <li key={idx} className="flex items-center">
                              <input
                                type="checkbox"
                                value={gender}
                                checked={selectedGender === gender}
                                onChange={() => setSelectedGender(gender)} // Update the selected gender
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                              />
                              <label className="ms-2 font-medium">
                                {gender}
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Region Dropdown */}
                  <div className="relative mb-6" ref={regionDropdownRef}>
                    <button
                      onClick={toggleRegionDropdown}
                      className="btn-sm border border-black focus:ring-4 focus:outline-none focus:ring-blue-300 font-light rounded-lg text-sm px-5 py-2.5 flex justify-between items-center sm:w-64 w-full relative bg-transparent"
                    >
                      <span>Region</span>
                      <svg
                        className={`w-2.5 h-2.5 ms-3 absolute right-4 transition-transform duration-300 ease-in-out ${
                          openRegionDropdown ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m1 1 4 4 4-4"
                        />
                      </svg>
                    </button>

                    {openRegionDropdown && (
                      <div className="z-10 absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <ul className="p-3 text-sm text-gray-700">
                          {["All", ...regions].map((region, idx) => (
                            <li key={idx} className="flex items-center">
                              <input
                                type="checkbox"
                                value={region}
                                checked={selectedRegion === region} // Check if this region is selected
                                onChange={() => setSelectedRegion(region)} // Update the selected region
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                              />
                              <label className="ms-2 font-medium">
                                {region}
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* College Dropdown */}
                  <div className="relative mb-6" ref={collegeDropdownRef}>
                    <button
                      onClick={() => {
                        toggleCollegeDropdown(); // Toggle only the college dropdown
                        setOpenProgramDropdown(false); // Close the program dropdown whenever the college dropdown is toggled
                      }}
                      className="btn-sm border border-black focus:ring-4 focus:outline-none focus:ring-blue-300 font-light rounded-lg text-sm px-5 py-2.5 flex justify-between items-center sm:w-64 w-full relative bg-transparent"
                    >
                      <span>Select College</span>
                      <svg
                        className={`w-2.5 h-2.5 ms-3 absolute right-4 transition-transform duration-300 ease-in-out ${
                          openCollegeDropdown ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m1 1 4 4 4-4"
                        />
                      </svg>
                    </button>

                    {openCollegeDropdown && (
                      <div className="z-10 absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <ul className="p-3 text-sm text-gray-700">
                          <li className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedCollege === "All"} // Check if "All" is selected
                              onChange={() => {
                                const allSelected = selectedCollege === "All";
                                setSelectedCollege(allSelected ? "" : "All"); // Toggle "All" selection
                              }}
                              className="mr-2"
                            />
                            <span>All Colleges</span>{" "}
                            {/* Display the "All Colleges" option */}
                          </li>
                          {Object.keys(collegePrograms).map((college, idx) => (
                            <li key={idx} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedCollege === college} // Check if this college is selected
                                onChange={() => {
                                  if (selectedCollege === "All") {
                                    setSelectedCollege(college); // Select individual college if "All" was selected
                                  } else {
                                    handleCollegeSelect(college);
                                  }
                                }}
                                className="mr-2"
                              />
                              <span>{college}</span>{" "}
                              {/* Display the college name */}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* College Programs Dropdown */}
                  <div className="relative mb-6" ref={programDropdownRef}>
                    <button
                      onClick={toggleProgramDropdown}
                      className="btn-sm border border-black focus:ring-4 focus:outline-none focus:ring-blue-300 font-light rounded-lg text-sm px-5 py-2.5 flex justify-between items-center sm:w-64 w-full relative bg-transparent"
                      disabled={!selectedCollege} // Disable if no college is selected
                    >
                      <span>Select Program</span>
                      <svg
                        className={`w-2.5 h-2.5 ms-3 absolute right-4 transition-transform duration-300 ease-in-out ${
                          openProgramDropdown ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m1 1 4 4 4-4"
                        />
                      </svg>
                    </button>

                    {openProgramDropdown && selectedCollege && (
                      <div className="z-10 absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <ul className="p-3 text-sm text-gray-700">
                          <li className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedProgram === "All"} // Check if "All" is selected
                              onChange={() => {
                                const allSelected = selectedProgram === "All";
                                setSelectedProgram(allSelected ? "" : "All"); // Toggle "All" selection
                              }}
                              className="mr-2"
                            />
                            <span>All Programs</span>{" "}
                            {/* Display the "All Programs" option */}
                          </li>
                          {(selectedCollege === "All" // Show all programs if "All Colleges" is selected
                            ? Object.values(collegePrograms).flat()
                            : collegePrograms[selectedCollege]
                          ).map((program, idx) => (
                            <li key={idx} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedProgram === program} // Check if this program is selected
                                onChange={() => setSelectedProgram(program)} // Use onChange for checkboxes
                                className="mr-2" // Add margin for spacing
                              />
                              <span>{program}</span>{" "}
                              {/* Display the program name */}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Batch Year Dropdown */}
                  <div className="relative mb-6" ref={batchYearDropdownRef}>
                    <button
                      onClick={toggleBatchYearDropdown}
                      className="btn-sm border border-black focus:ring-4 focus:outline-none focus:ring-blue-300 font-light rounded-lg text-sm px-5 py-2.5 flex justify-between items-center sm:w-64 w-full relative bg-transparent"
                    >
                      <span>
                        {selectedBatchYears.length > 0
                          ? selectedBatchYears.length === batchYears.length
                            ? "All Batch Years"
                            : selectedBatchYears.join(", ")
                          : "Select Batch Year"}
                      </span>
                      <svg
                        className={`w-2.5 h-2.5 ms-3 absolute right-4 transition-transform duration-300 ease-in-out ${
                          openBatchYearDropdown ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m1 1 4 4 4-4"
                        />
                      </svg>
                    </button>

                    {openBatchYearDropdown && (
                      <div className="z-10 absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <ul className="p-3 text-sm text-gray-700">
                          <li className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedBatchYears.length === 0} // All Batch Years checked only if none selected
                              onChange={() => {
                                if (selectedBatchYears.length === 0) {
                                  setSelectedBatchYears(batchYears); // Select all batch years if none selected
                                } else {
                                  setSelectedBatchYears([]); // Deselect all if any batch year is selected
                                }
                              }}
                              className="mr-2"
                            />
                            <span>All Batch Years</span>{" "}
                            {/* Display the "All Batch Years" option */}
                          </li>
                          {batchYears.map((year, idx) => (
                            <li key={idx} className="flex items-center">
                              <input
                                type="checkbox"
                                value={year}
                                checked={selectedBatchYears.includes(year)} // Directly check if the year is selected
                                onChange={() => {
                                  if (selectedBatchYears.includes(year)) {
                                    setSelectedBatchYears(
                                      selectedBatchYears.filter(
                                        (y) => y !== year
                                      )
                                    ); // Deselect the year if it was selected
                                  } else {
                                    setSelectedBatchYears([
                                      ...selectedBatchYears,
                                      year,
                                    ]); // Select the year if it was not selected
                                  }
                                }}
                                className="mr-2"
                              />
                              <span>{year}</span> {/* Display the batch year */}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:flex block sm:space-x-4 items-center">
                  <div className="text-xl font-bold mr-8">
                    Number of Alumni: {filteredAlumniCount}
                  </div>
                  <div className="text-sm">
                    Employed: {countByStatus("Employed")}
                  </div>
                  <div className="text-sm">
                    Self-Employed: {countByStatus("Self-Employed")}
                  </div>
                  <div className="text-sm">
                    Underemployed: {countByStatus("Underemployed")}
                  </div>
                  <div className="text-sm">
                    Freelancing: {countByStatus("Freelancing")}
                  </div>
                  <div className="text-sm">
                    Unemployed: {countByStatus("Unemployed")}
                  </div>
                </div>

                {/* Full-Width Table Section with Padding */}
                <div className="overflow-x-auto mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50 max-h-96 min-h-96 overflow-y-auto">
                  <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                      <tr className="text-xs font-normal text-center">
                        <td className="px-4 py-2 border"></td>
                        <td className="px-4 py-2 border">First Name</td>
                        <td className="px-4 py-2 border">Last Name</td>
                        <td className="px-4 py-2 border">Birthday</td>
                        <td className="px-4 py-2 border">College</td>
                        <td className="px-4 py-2 border">College Program</td>
                        <td className="px-4 py-2 border">Batch</td>
                        <td className="px-4 py-2 border">Gender</td>
                        <td className="px-4 py-2 border">Region</td>
                        <td className="px-4 py-2 border">Employment Status</td>

                        {/* Dynamically rendering question columns */}
                        {selectedSurvey?.questions?.map((question) => (
                          <td key={question._id} className="px-4 py-2 border">
                            {question.questionText}
                          </td>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {filterResponses().length === 0 ? (
                        <tr>
                          <td
                            colSpan={selectedSurvey?.questions.length + 8}
                            className="text-center px-4 py-2 border"
                          >
                            No Respondents
                          </td>
                        </tr>
                      ) : (
                        filterResponses().map((response, index) => (
                          <tr key={response._id} className="text-center">
                            <td className="px-4 py-2 border">{index + 1}</td>
                            <td className="px-4 py-2 border">
                              {response.userId?.firstName || ""}
                            </td>
                            <td className="px-4 py-2 border">
                              {response.userId?.lastName || ""}
                            </td>
                            <td className="px-4 py-2 border">
                              {formatDate(response.userId?.birthday) || ""}
                            </td>
                            <td className="px-4 py-2 border">
                              {response.userId?.college || ""}
                            </td>
                            <td className="px-4 py-2 border">
                              {response.userId?.collegeProgram || ""}
                            </td>
                            <td className="px-4 py-2 border">
                              {response.userId?.yearGraduatedCollege || ""}
                            </td>
                            <td className="px-4 py-2 border">
                              {response.userId?.gender || ""}
                            </td>
                            <td className="px-4 py-2 border">
                              {response.userId?.region || ""}
                            </td>
                            <td className="px-4 py-2 border">
                              {response.userId?.employmentStatus || ""}
                            </td>

                            {/* Display answers for each question */}
                            {selectedSurvey?.questions?.map((question) => {
                              const userAnswer = response.answers.find(
                                (ans) =>
                                  ans.questionId.toString() ===
                                  question._id.toString()
                              );

                              return (
                                <td
                                  key={question._id}
                                  className="px-4 py-2 border"
                                >
                                  {userAnswer
                                    ? Array.isArray(userAnswer.answer)
                                      ? userAnswer.answer.join(", ") // For checkbox type questions
                                      : userAnswer.answer // For other question types
                                    : ""}
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Export Buttons */}
                <div className="flex mt-4 justify-center space-x-3">
                  <button
                    onClick={generatePDF}
                    className="btn md:w-64 w-32 bg-blue text-white rounded-lg py-2 px-4"
                  >
                    Export to PDF
                  </button>
                  <CSVLink
                    data={filterResponses().map((response) => {
                      const defaultFields = {
                        FirstName: response.userId?.firstName || "---------",
                        LastName: response.userId?.lastName || "---------",
                        Birthday:
                          formatDate(response.userId?.birthday) || "---------",
                        College: response.userId?.college || "---------",
                        CollegeProgram:
                          response.userId?.collegeProgram || "---------",
                        Batch:
                          response.userId?.yearGraduatedCollege || "---------",
                        Gender: response.userId?.gender || "---------",
                        Region: response.userId?.region || "---------",
                        EmploymentStatus:
                          response.userId?.employmentStatus || "---------",
                      };

                      const dynamicFields =
                        selectedSurvey?.questions.reduce((acc, question) => {
                          const answer = response.answers.find(
                            (ans) =>
                              ans.questionId.toString() ===
                              question._id.toString()
                          );
                          acc[question.questionText] = answer
                            ? Array.isArray(answer.answer)
                              ? answer.answer.join(", ")
                              : answer.answer
                            : "---------";
                          return acc;
                        }, {}) || {};

                      return {
                        ...defaultFields,
                        ...dynamicFields,
                      };
                    })}
                    filename="cicsalumniconnect_surveyreport.csv"
                    className="btn md:w-64 w-32 bg-green text-white rounded-lg py-2 px-4"
                  >
                    Export to Excel
                  </CSVLink>
                </div>
              </div>
            </div>
          )}
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
                  ></button>
                </div>
                <input
                  type="text"
                  className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm mb-3"
                  value={question.questionText}
                  onChange={(e) =>
                    handleQuestionChange(questionIndex, e.target.value)
                  }
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

                {/* Render Options using renderOptionInputs */}
                {renderOptionInputs(question, questionIndex)}

                {/* Add Option button for radio/checkbox types */}
                {(question.questionType === "radio" ||
                  question.questionType === "checkbox") && (
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
                className="btn btn-sm w-29 md:btn-md md:w-52 lg:w-60 bg-green text-white px-4 py-2 md:px-6 md:py-3"
                onClick={() => {
                  setQuestions([
                    ...questions,
                    { questionText: "", questionType: "", choices: [""] },
                  ]);
                }}
              >
                Add Question
              </button>
            </div>

            <div className="flex justify-center mt-16 space-x-3">
              <button
                className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-[#3D3C3C] text-white px-4 py-2 md:px-6 md:py-3"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-green text-white px-4 py-2 md:px-6 md:py-3"
                onClick={handleUpdateSurvey}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ADD MODAL */}
      {isAddModalOpen && (
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
                  ></button>
                </div>
                <input
                  type="text"
                  className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm mb-3"
                  value={question.questionText}
                  onChange={(e) =>
                    handleQuestionChange(questionIndex, e.target.value)
                  }
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
                {(question.questionType === "radio" ||
                  question.questionType === "checkbox") && (
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
                className="btn btn-sm w-29 md:btn-md md:w-52 lg:w-60 bg-green text-white px-4 py-2 md:px-6 md:py-3"
                onClick={addQuestion}
              >
                Add Question
              </button>
            </div>

            <div className="flex justify-center gap-2 mt-4">
              <button
                className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-[#3D3C3C] text-white px-4 py-2 md:px-6 md:py-3"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-green text-white px-4 py-2 md:px-6 md:py-3"
                onClick={handleSaveSurvey}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Publish/Unpublish Confirmation Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-64 sm:w-96">
            <h2 className="text-2xl mb-4">
              {surveys.find((survey) => survey._id === selectedSurveyId)
                ?.published
                ? "Confirm Unpublish Action"
                : "Confirm Publish Action"}
            </h2>
            <p>
              {surveys.find((survey) => survey._id === selectedSurveyId)
                ?.published
                ? "Unpublishing will make the survey inaccessible to users and could reset responses when republished. Are you sure you want to continue?"
                : "Publishing will let the survey accessible to all users."}
            </p>
            <div className="flex justify-end mt-4">
              <button
                className="btn btn-sm w-24 bg-red text-white mr-2"
                onClick={handleConfirmPublish}
              >
                Confirm
              </button>
              <button
                className="btn btn-sm w-24 bg-gray-500 text-white"
                onClick={() => setIsPublishModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSurveyTool;
