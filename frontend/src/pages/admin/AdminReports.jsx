import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import alumniconnectlogo2 from "../../assets/alumniconnectlogo2.png";
import cicslogo from "../../assets/cicslogo.png";

function AdminReports() {
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
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [selectedPrograms, setSelectedPrograms] = useState(["All Programs"]);
  const [selectedFields, setSelectedFields] = useState(["All Fields"]);
  const [selectedColleges, setSelectedColleges] = useState(["All Colleges"]);
  const [selectedBatches, setSelectedBatches] = useState(["All Batches"]);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [openDropdown, setOpenDropdown] = useState("");
  const [alumni, setAlumni] = useState([]);
  const availableColleges = Object.keys(collegePrograms);
  const [availablePrograms, setAvailablePrograms] = useState([]);

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

  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return "";
    }
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const handleCollegeSelection = (e) => {
    const selectedCollege = e.target.value;
    const isChecked = e.target.checked;

    if (selectedCollege === "All Colleges") {
      if (isChecked) {
        // Select all colleges but don't visually check them
        setSelectedColleges(["All Colleges"]);
      } else {
        // Deselect all colleges
        setSelectedColleges([]);
      }
    } else {
      // Handle individual college selection
      const updatedSelectedColleges = isChecked
        ? [...selectedColleges, selectedCollege]
        : selectedColleges.filter((college) => college !== selectedCollege);

      // Remove "All Colleges" if any specific college is unchecked
      if (updatedSelectedColleges.includes("All Colleges")) {
        setSelectedColleges(
          updatedSelectedColleges.filter(
            (college) => college !== "All Colleges"
          )
        );
      } else {
        setSelectedColleges(updatedSelectedColleges);
      }
    }
  };

  const handleProgramSelection = (event) => {
    const selectedProgram = event.target.value;
    setSelectedPrograms((prevSelectedPrograms) => {
      if (selectedProgram === "All Programs") {
        return ["All Programs"];
      }
      if (prevSelectedPrograms.includes("All Programs")) {
        return [selectedProgram];
      }
      if (prevSelectedPrograms.includes(selectedProgram)) {
        return prevSelectedPrograms.filter(
          (program) => program !== selectedProgram
        );
      } else {
        return [...prevSelectedPrograms, selectedProgram];
      }
    });
  };

  // Dynamically update the available programs
  useEffect(() => {
    if (
      selectedColleges.includes("All Colleges") ||
      selectedColleges.length === 0
    ) {
      // If "All Colleges" is selected or no college is selected, show all programs
      const allPrograms = availableColleges.flatMap(
        (college) => collegePrograms[college]
      );
      setAvailablePrograms(allPrograms);
    } else {
      // Show programs related to selected colleges
      const filteredPrograms = selectedColleges.flatMap(
        (college) => collegePrograms[college]
      );
      setAvailablePrograms(filteredPrograms);
    }
  }, [selectedColleges]);

  const fieldToKeyMap = {
    Gender: "gender",
    Region: "region",
    Profession: "profession",
    College: "college",
    "College Program": "collegeProgram",
    Specialization: "specialization",
    "Year Started on College Program": "yearStartedCollege",
    "Year Graduated on College Program": "yearGraduatedCollege",
    "Time it took to land a job after graduation (months)": "timeToJob",
    "Employment Status": "employmentStatus",
    "Work Industry": "workIndustry",
    "Is current profession in line with college degree": "professionAlignment",
    "Marital Status": "maritalStatus",
    "Salary Range": "salaryRange",
    "Place of Employment": "placeOfEmployment",
    LinkedIn: "contactInformation.linkedIn",
    Facebook: "contactInformation.facebook",
    Instagram: "contactInformation.instagram",
    "Email Address": "contactInformation.email",
    "Mobile Number": "contactInformation.mobileNumber",
    Other: "contactInformation.other",
  };

  const availableFields = Object.keys(fieldToKeyMap);

  // Fetch Alumni Data

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const response = await axios.get(`${backendUrl}/profile/alumni`, {
          withCredentials: true,
        });

        const alumniData = response.data.alumni || response.data;

        setAlumni(alumniData);

        // Extract unique graduation years for the batch dropdown,
        // filtering out null or undefined values
        const uniqueBatches = [
          ...new Set(
            alumniData
              .map((alum) => alum.yearGraduatedCollege?.split("-")[0]) // Extract only the year
              .filter((year) => year !== undefined) // Exclude undefined values
          ),
        ];
        setAvailableBatches(uniqueBatches);
      } catch (error) {
        console.error("Error fetching alumni:", error);
      }
    };

    fetchAlumni();
  }, [backendUrl]);

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (type) => {
    setOpenDropdown((prev) => (prev === type ? "" : type));
  };

  // Handle Batch Selection
  const handleBatchSelection = (event) => {
    const selectedBatch = event.target.value;
    setSelectedBatches((prevSelectedBatches) => {
      if (selectedBatch === "All Batches") {
        return ["All Batches"];
      }
      if (prevSelectedBatches.includes("All Batches")) {
        return [selectedBatch];
      }
      if (prevSelectedBatches.includes(selectedBatch)) {
        return prevSelectedBatches.filter((batch) => batch !== selectedBatch);
      } else {
        return [...prevSelectedBatches, selectedBatch];
      }
    });
  };

  const handleFieldSelection = (event) => {
    const selectedField = event.target.value;
    setSelectedFields((prevSelectedFields) => {
      if (selectedField === "All Fields") {
        return ["All Fields"];
      }
      if (prevSelectedFields.includes("All Fields")) {
        return [selectedField];
      }
      if (prevSelectedFields.includes(selectedField)) {
        return prevSelectedFields.filter((field) => field !== selectedField);
      } else {
        return [...prevSelectedFields, selectedField];
      }
    });
  };

  // Get nested values for fields like contact information
  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  const [filteredData, setFilteredData] = useState([]);
  const filteredAlumniCount = filteredData ? filteredData.length : 0;
  useEffect(() => {
    const filtered = alumni.filter((row) => {
      const programMatches =
        selectedPrograms.includes("All Programs") ||
        selectedPrograms.includes(row.collegeProgram);
      const collegeMatches =
        selectedColleges.includes("All Colleges") ||
        selectedColleges.includes(row.college);
      const batchMatches =
        selectedBatches.includes("All Batches") ||
        selectedBatches.includes(row.yearGraduatedCollege?.split("-")[0]);
      return programMatches && collegeMatches && batchMatches;
    });
    setFilteredData(filtered);
  }, [alumni, selectedPrograms, selectedColleges, selectedBatches]);

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
      "CICS Alumni Connect Report",
      doc.internal.pageSize.width / 2,
      100,
      {
        align: "center",
      }
    );

    // Calculate counts
    const alumniCountByBatch = {};
    const alumniCountByCollege = {};
    const alumniCountByProgram = {};

    filteredData.forEach((row) => {
      const batchYear = row.yearGraduatedCollege?.split("-")[0];
      const college = row.college;
      const program = row.collegeProgram;

      if (batchYear) {
        alumniCountByBatch[batchYear] =
          (alumniCountByBatch[batchYear] || 0) + 1;
      }
      if (college) {
        alumniCountByCollege[college] =
          (alumniCountByCollege[college] || 0) + 1;
      }
      if (program) {
        alumniCountByProgram[program] =
          (alumniCountByProgram[program] || 0) + 1;
      }
    });

    // Apply table style to Alumni Summary with three columns
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor("#be142e");
    doc.text("Alumni Summary", 40, 160); // Section title with red color

    // Prepare the summary data, repeating the category for each entry
    const summaryData = [];

    // Add total alumni count to the summary
    summaryData.push(["Total Alumni", "", filteredData.length]);

    Object.entries(alumniCountByBatch).forEach(([year, count]) => {
      summaryData.push(["Batch", year, count]);
    });

    Object.entries(alumniCountByCollege).forEach(([college, count]) => {
      summaryData.push(["College", college, count]);
    });

    Object.entries(alumniCountByProgram).forEach(([program, count]) => {
      summaryData.push(["Program", program, count]);
    });

    // Add table with 3 columns: Category, Field, and Count (with repeating categories)
    autoTable(doc, {
      startY: 170,
      head: [["Category", "Field", "Count"]], // Table headers
      body: summaryData,
      styles: { fontSize: 10, textColor: "#333" },
      headStyles: { fillColor: "#be142e", textColor: "#fff" }, // Red header
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 200 },
        2: { cellWidth: 80 },
      },
      margin: { top: 5, bottom: 10, left: 40, right: 40 },
    });

    // Adjusting the Y-coordinate for the next element
    let startY = doc.autoTable.previous.finalY + 20;

    // Filtered data to be displayed in the table
    filteredData.forEach((row, index) => {
      const defaultFields = [
        ["First Name", row.firstName || "---------"],
        ["Last Name", row.lastName || "---------"],
        ["Birthday", formatDate(row.birthday) || "---------"],
        ["Program", row.collegeProgram || "---------"],
      ];

      const dynamicFields =
        selectedFields.length === 0 || selectedFields.includes("All Fields")
          ? availableFields.map((field) => [
              field,
              getNestedValue(row, fieldToKeyMap[field]) || "---------",
            ])
          : selectedFields.map((field) => [
              field,
              getNestedValue(row, fieldToKeyMap[field]) || "---------",
            ]);

      autoTable(doc, {
        head: [[`Alumni ${index + 1}`, "Field", "Value"]],
        body: [
          ...defaultFields.map((field) => ["", field[0], field[1]]),
          ...dynamicFields.map((field) => ["", field[0], field[1]]),
        ],
        startY,
        styles: { fontSize: 10, textColor: "#333" },
        headStyles: { fillColor: "#be142e", textColor: "#fff" },
      });

      startY = doc.autoTable.previous.finalY + 20; // Adds space after the table
    });

    // Add page numbers at the bottom of each page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 15,
        {
          align: "center",
        }
      );
    }

    // Save the generated PDF
    doc.save("cicsalumniconnect_report.pdf");
  };

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
      <div className="flex items-center mb-2">
        <h1 className="text-2xl font-medium text-gray-700">Reports</h1>
      </div>

      <div className="text-sm mb-1">Filters:</div>
      <div className="sm:flex block sm:space-x-4">
        {/* College Dropdown */}
        <div className="relative sm:mb-1 mb-2" ref={dropdownRef}>
          <button
            onClick={() => toggleDropdown("colleges")}
            className="btn-sm border border-black focus:ring-4 focus:outline-none focus:ring-blue-300 font-light rounded-lg text-sm px-5 py-2.5 flex justify-between items-center sm:w-64 w-full relative bg-transparent"
          >
            <span>College</span>
            <svg
              className={`w-2.5 h-2.5 ms-3 absolute right-4 transition-transform duration-300 ease-in-out ${
                openDropdown === "colleges" ? "rotate-180" : ""
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
          {openDropdown === "colleges" && (
            <div
              
              className="z-10 absolute h-64 overflow-y-scroll sm:w-64 w-full bg-white divide-y divide-gray-100 rounded-lg shadow mt-2"
            >
              <ul className="p-3 space-y-3 text-sm text-gray-700">
                {["All Colleges", ...availableColleges].map((college, idx) => (
                  <li key={idx} className="flex items-center">
                    <input
                      type="checkbox"
                      value={college}
                      checked={selectedColleges.includes(college)}
                      onChange={handleCollegeSelection}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                    />
                    <label className="ms-2 sm:text-xs font-medium">
                      {college}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* College Program Dropdown */}
        <div className="relative sm:mb-1 mb-2" ref={dropdownRef}>
          <button
            onClick={() => toggleDropdown("programs")}
            className="btn-sm border border-black focus:ring-4 focus:outline-none focus:ring-blue-300 font-light rounded-lg text-sm px-5 py-2.5 flex justify-between items-center sm:w-64 w-full relative bg-transparent"
          >
            <span>College Program</span>
            <svg
              className={`w-2.5 h-2.5 ms-3 absolute right-4 transition-transform duration-300 ease-in-out ${
                openDropdown === "programs" ? "rotate-180" : ""
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
          {openDropdown === "programs" && (
            <div
              
              className="z-10 absolute h-64 overflow-y-scroll sm:w-64 w-full bg-white divide-y divide-gray-100 rounded-lg shadow mt-2"
            >
              <ul className="p-3 space-y-3 text-sm text-gray-700">
                {["All Programs", ...availablePrograms].map((program, idx) => (
                  <li key={idx} className="flex items-center">
                    <input
                      type="checkbox"
                      value={program}
                      checked={selectedPrograms.includes(program)}
                      onChange={handleProgramSelection}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                    />
                    <label className="ms-2 sm:text-xs font-medium">
                      {program}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Batch Dropdown */}
        <div className="relative sm:mb-1 mb-2" ref={dropdownRef}>
          <button
            onClick={() => toggleDropdown("batches")}
            className="btn-sm border border-black focus:ring-4 focus:outline-none focus:ring-blue-300 font-light rounded-lg text-sm px-5 py-2.5 flex justify-between items-center sm:w-64 w-full relative bg-transparent"
          >
            <span>Batch (Year Graduated)</span>
            <svg
              className={`w-2.5 h-2.5 ms-3 absolute right-4 transition-transform duration-300 ease-in-out ${
                openDropdown === "batches" ? "rotate-180" : ""
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
          {openDropdown === "batches" && (
            <div
  
              className="z-10 absolute h-64 overflow-y-scroll sm:w-64 w-full bg-white divide-y divide-gray-100 rounded-lg shadow mt-2"
            >
              <ul className="p-3 space-y-3 text-sm text-gray-700">
                {["All Batches", ...availableBatches].map((batch, idx) => (
                  <li key={idx} className="flex items-center">
                    <input
                      type="checkbox"
                      value={batch}
                      checked={selectedBatches.includes(batch)}
                      onChange={handleBatchSelection}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                    />
                    <label className="ms-2 sm:text-xs font-medium">
                      {batch} {/* Display only the year */}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="relative sm:mb-1 mb-2" ref={dropdownRef}>
          <button
            onClick={() => toggleDropdown("fields")}
            className="btn-sm border border-black focus:ring-4 focus:outline-none focus:ring-blue-300 font-light rounded-lg text-sm px-5 py-2.5 flex justify-between items-center sm:w-80 w-full relative bg-transparent"
          >
            <span>Fields</span>
            <svg
              className={`w-2.5 h-2.5 ms-3 absolute right-4 transition-transform duration-300 ease-in-out ${
                openDropdown === "fields" ? "rotate-180" : ""
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
          {openDropdown === "fields" && (
            <div
              className="z-10 h-64 overflow-y-scroll absolute sm:w-80 w-full bg-white divide-y divide-gray-100 rounded-lg shadow mt-2"
            >
              <ul className="p-3 space-y-3 text-sm text-gray-700">
                {["All Fields", ...availableFields].map((field, idx) => (
                  <li key={idx} className="flex items-center">
                    <input
                      type="checkbox"
                      value={field}
                      checked={selectedFields.includes(field)}
                      onChange={handleFieldSelection}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                    />
                    <label className="ms-2 sm:text-xs font-medium">
                      {field}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="text-sm mt-4">
        Number of Alumni: {filteredAlumniCount}
      </div>

      <div className="overflow-x-auto mt-2 overflow-y-auto max-h-96">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="text-xs font-normal text-center">
              <td className="px-4 py-2 border"></td>
              <td className="px-4 py-2 border">First Name</td>
              <td className="px-4 py-2 border">Last Name</td>
              <td className="px-4 py-2 border">Birthday</td>
              {selectedFields.length === 0 ||
              selectedFields.includes("All Fields")
                ? availableFields.map((field) => (
                    <td key={field} className="px-4 py-2 border">
                      {field}
                    </td>
                  ))
                : selectedFields.map((field) => (
                    <td key={field} className="px-4 py-2 border">
                      {field}
                    </td>
                  ))}
            </tr>
          </thead>
          <tbody className="text-xs">
            {filteredData.length > 0 ? (
              filteredData.map((row, rowIndex) => (
                <tr key={rowIndex} className="text-center">
                  <td className="px-4 py-2 border">{rowIndex + 1}</td>
                  <td className="px-4 py-2 border">{row.firstName}</td>
                  <td className="px-4 py-2 border">{row.lastName}</td>
                  <td className="px-4 py-2 border">
                    {formatDate(row.birthday)}
                  </td>
                  {(selectedFields.length === 0 ||
                  selectedFields.includes("All Fields")
                    ? availableFields
                    : selectedFields
                  ).map((field) => (
                    <td key={field} className="px-4 py-2 border">
                      {getNestedValue(row, fieldToKeyMap[field])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4 + availableFields.length}
                  className="px-4 py-2 text-center"
                >
                  No alumni data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-3 space-x-3">
        <div className="">
          <button
            onClick={generatePDF}
            className="btn md:w-64 w-52 bg-blue text-white"
          >
            Export to PDF
          </button>
        </div>
        <div className="">
          <CSVLink
            data={filteredData.map((row) => {
              // Default fields that will always be included
              const defaultFields = {
                FirstName: row.firstName || "---------",
                LastName: row.lastName || "---------",
                Birthday: formatDate(row.birthday) || "---------",
              };

              // Dynamically add selected fields or all available fields if no specific fields are selected
              const dynamicFields =
                selectedFields.includes("All Fields") ||
                selectedFields.length === 0
                  ? availableFields.reduce((acc, field) => {
                      acc[field] =
                        getNestedValue(row, fieldToKeyMap[field]) ||
                        "---------";
                      return acc;
                    }, {})
                  : selectedFields.reduce((acc, field) => {
                      acc[field] =
                        getNestedValue(row, fieldToKeyMap[field]) ||
                        "---------";
                      return acc;
                    }, {});

              // Combine default fields with dynamic fields
              return {
                ...defaultFields,
                ...dynamicFields,
              };
            })}
            filename="cicsalumniconnect_report.csv"
            className="btn md:w-64 w-52 bg-green text-white"
          >
            Export to Excel
          </CSVLink>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;
