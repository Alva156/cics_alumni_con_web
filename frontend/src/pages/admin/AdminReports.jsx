import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
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
    try {
      // Convert images to Base64 format
      const alumniconnectlogo2Base64 = await getBase64(alumniconnectlogo2);
      const cicsLogoBase64 = await getBase64(cicslogo);

      const content = [
        // Header section with images and title
        {
          columns: [
            {
              image: cicsLogoBase64, // CICS logo in base64
              width: 48,
              margin: [10, 0, 0, 0],
            },
            {
              stack: [
                {
                  text: "University of Santo Tomas",
                  style: "headerUniversity",
                },
                {
                  text: "College of Information and Computing Sciences",
                  style: "headerCollege",
                },
              ],
              margin: [10, 24, 0, 0],
            },

            {
              text: "CICS Alumni Report",
              bold: true,
              style: "header",
              alignment: "left",
              margin: [0, 24, 0, 0],
            },

            {
              columns: [
                {
                  text: [
                    { text: "Alumni", color: "#2d2b2b", bold: true },
                    { text: " Connect", color: "#be142e", bold: true },
                  ],
                  style: "headerTitle",
                  margin: [0, 23, 10, 0],
                },
                {
                  image: alumniconnectlogo2Base64,
                  width: 50,
                  margin: [0, 5, 0, 0],
                },
              ],
              columnGap: 5,
            },
          ],
          columnGap: 10,
        },
        { text: "\n", margin: [0, 10] },

        ...filteredData.map((row, index) => {
          // Default fields to display
          const defaultFields = [
            { label: "First Name", value: row.firstName || "---------" },
            { label: "Last Name", value: row.lastName || "---------" },
            {
              label: "Birthday",
              value: formatDate(row.birthday) || "---------",
            },
            { label: "Program", value: row.collegeProgram || "---------" },
          ];

          const dynamicFields =
            selectedFields.length === 0 || selectedFields.includes("All Fields")
              ? availableFields.map((field) => ({
                  label: ` ${field}`,
                  value:
                    getNestedValue(row, fieldToKeyMap[field]) || "---------",
                }))
              : selectedFields.map((field) => ({
                  label: ` ${field}`,
                  value:
                    getNestedValue(row, fieldToKeyMap[field]) || "---------",
                }));

          const allFields = [...defaultFields, ...dynamicFields];

          const tableBody = [
            [
              {
                text: `Alumni Record ${index + 1}`,
                colSpan: 2,
                style: "recordTitle",
                margin: [0, 0, 0, 10],
                alignment: "center",
              },
              {},
            ],
            ...allFields.map((field) => [
              { text: field.label, style: "fieldLabel" },
              { text: field.value, style: "fieldValue" },
            ]),
          ];

          return {
            margin: [0, 15, 0, 15],
            table: {
              widths: ["auto", "*"],
              body: tableBody,
            },
            layout: {
              hLineWidth: function (i, node) {
                return i === 1 ? 1 : 0;
              },
              vLineWidth: function (i, node) {
                return 0;
              },
              hLineColor: function (i, node) {
                return "#ddd";
              },
            },
          };
        }),
      ];

      const docDefinition = {
        content,
        styles: {
          headerUniversity: {
            fontSize: 8,
            bold: true,
            italics: true,
            color: "#000000",
          },
          headerCollege: {
            fontSize: 7,
            bold: true,
            italics: true,
            color: "#000000",
          },
          headerTitle: {
            fontSize: 18,
            bold: true,
            color: "#333333",
            alignment: "right",
            margin: [0, 20, 0, 0],
          },
          header: {
            fontSize: 18,
          },
          recordTitle: {
            fontSize: 14,
            bold: true,
            color: "#fff",
            fillColor: "#d9534f", // Red background for separation
            alignment: "center",
          },
          fieldLabel: {
            fontSize: 10,
            bold: true,
            color: "#d9534f", // Red color for labels
          },
          fieldValue: {
            fontSize: 10,
            color: "#333", // Dark color for values
          },
        },
        pageSize: "A3",
        pageOrientation: "portrait", // Horizontal layout
        defaultStyle: {
          fontSize: 12,
          color: "#333",
        },
        pageMargins: [40, 40, 40, 40], // Page margins
      };

      // Generate and download the PDF
      pdfMake.createPdf(docDefinition).download("cicsalumniconnect_report.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
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
