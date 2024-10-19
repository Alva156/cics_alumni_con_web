import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import alumniconnectlogo2 from "../../assets/alumniconnectlogo2.png";
import cicslogo from "../../assets/cicslogo.png";

function AdminReports() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [selectedPrograms, setSelectedPrograms] = useState(["All Programs"]);
  const [selectedFields, setSelectedFields] = useState(["All Fields"]);
  const [openDropdown, setOpenDropdown] = useState("");
  const [alumni, setAlumni] = useState([]);

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

  const fieldToKeyMap = {
    Profession: "profession",
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
  const availablePrograms = [
    "Computer Science",
    "Information Systems",
    "Information Technology",
  ];

  // Fetch Alumni Data
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const response = await axios.get(`${backendUrl}/profile/alumni`, {
          withCredentials: true,
        });

        const alumniData = response.data.alumni || response.data;
        alumniData.forEach((alum) => {
          alum.yearStartedCollege = formatDate(alum.yearStartedCollege);
          alum.yearGraduatedCollege = formatDate(alum.yearGraduatedCollege);
          // Format other date fields as needed
        });

        setAlumni(alumniData);
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

  // Filtered data based on selected programs
  const filteredData = alumni.filter(
    (row) =>
      selectedPrograms.includes("All Programs") ||
      selectedPrograms.includes(row.collegeProgram)
  );

  const generatePDF = async () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a3",
    });

    // Convert images to base64
    const alumniconnectlogo2Base64 = await getBase64(alumniconnectlogo2);
    const cicsLogoBase64 = await getBase64(cicslogo);

    // Add CICS logo and AlumniConnect logo to the PDF
    doc.addImage(cicsLogoBase64, "PNG", 40, 30, 48, 48);
    doc.addImage(alumniconnectlogo2Base64, "PNG", 500, 30, 50, 50);

    // Title and headers
    doc.setFontSize(18);
    doc.setTextColor("#000000");
    doc.text("University of Santo Tomas", 100, 50);
    doc.setFontSize(14);
    doc.text("College of Information and Computing Sciences", 100, 70);
    doc.setFontSize(22);
    doc.text("CICS Alumni Report", 100, 100);

    let startY = 120; // Starting position for the table

    // Filtered data to be displayed in the table
    filteredData.forEach((row, index) => {
      // Add "Alumni X" text at the top of each alumni's section
      const alumniText = `Alumni ${index + 1}`;
      doc.setFontSize(14);
      doc.setTextColor(217, 83, 79); // Set text color to red
      doc.text(alumniText, 40, startY); // Place at top of each alumni section

      // Update the Y position to start after the alumni text
      startY += 20;

      const defaultFields = [
        ["First Name", row.firstName || "---------"],
        ["Last Name", row.lastName || "---------"],
        ["Birthday", formatDate(row.birthday) || "---------"],
        ["Program", row.collegeProgram || "---------"],
      ];

      // Add selected fields dynamically
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

      // Add table for current alumni
      autoTable(doc, {
        head: [["Field", "Value"]],
        body: [...defaultFields, ...dynamicFields],
        startY,
        styles: { fontSize: 10, textColor: "#333" },
        headStyles: { fillColor: "#d9534f", textColor: "#fff" }, // Red header
      });

      // Update the Y position for the next alumni
      startY = doc.autoTable.previous.finalY + 20; // Adds space after the table

      // Draw a red line separator after each alumni entry
      doc.setDrawColor(217, 83, 79); // Red color
      doc.setLineWidth(1.5); // Thickness of the line
      doc.line(40, startY, doc.internal.pageSize.width - 40, startY);

      // Update the Y position to start after the red separator
      startY += 10; // Adjust as needed for space after the separator
    });

    // Save the generated PDF
    doc.save("cicsalumniconnect_report.pdf");
  };

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-medium text-gray-700">Reports</h1>
      </div>

      <div className="text-sm mb-4">Filters:</div>
      <div className="sm:flex block sm:space-x-4">
        <div className="relative mb-6">
          <button
            onClick={() => toggleDropdown("programs")}
            className="border border-black focus:ring-4 focus:outline-none focus:ring-blue-300 font-light rounded-lg text-sm px-5 py-2.5 flex justify-between items-center sm:w-64 w-full relative bg-transparent"
          >
            <span>Program</span>
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
              ref={dropdownRef}
              className="z-10 absolute sm:w-64 w-full bg-white divide-y divide-gray-100 rounded-lg shadow mt-2"
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

        <div className="relative mb-6">
          <button
            onClick={() => toggleDropdown("fields")}
            className="border border-black focus:ring-4 focus:outline-none focus:ring-blue-300 font-light rounded-lg text-sm px-5 py-2.5 flex justify-between items-center sm:w-80 w-full relative bg-transparent"
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
              ref={dropdownRef}
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

      <div className="overflow-x-auto mt-6">
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

      <div className="flex justify-center mt-16 space-x-3">
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
            data={alumni.map((row) => ({
              FirstName: row.firstName,
              LastName: row.lastName,
              Birthday: formatDate(row.birthday),
              ...(selectedFields.includes("All Fields") ||
              selectedFields.length === 0
                ? availableFields.reduce((acc, field) => {
                    acc[field] = getNestedValue(row, fieldToKeyMap[field]);
                    return acc;
                  }, {})
                : selectedFields.reduce((acc, field) => {
                    acc[field] = getNestedValue(row, fieldToKeyMap[field]);
                    return acc;
                  }, {})),
            }))}
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
