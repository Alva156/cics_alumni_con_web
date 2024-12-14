import React, { useState, useEffect, useRef } from "react";
import ReactPaginate from "react-paginate";
import axios from "axios";
import csvpic from "../../assets/formatcsv.png";
import { Worker, Viewer } from "@react-pdf-viewer/core"; // Import Viewer
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.js";
import "../../App.css";

function AdminAlumni() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [alumni, setAlumni] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isCSVModal, setIsCSVModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [csvFiles, setCsvFiles] = useState([]);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [previewFileUrl, setPreviewFileUrl] = useState(null);
  const [validationMessage, setValidationMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const fileInputRef = useRef(null);
  const [isCSVViewModal, setIsCSVViewModalOpen] = useState(false);
  const [csvFileContent, setCsvFileContent] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = 15;

  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return "";
    }
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const uniqueYears = [
    ...new Set(
      alumni.map((alum) => alum.yearGraduatedCollege).filter((year) => year)
    ),
  ].sort((a, b) => a - b);
  const [activeTab, setActiveTab] = useState("primary");
  const modalRef = useRef(null);
  const [selectedAlumni, setSelectedAlumni] = useState({
    secondaryEducation: [],
    tertiaryEducation: [],
    careerBackground: [],
  });
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        const response = await axios.get(`${backendUrl}/profile/attachments`, {
          withCredentials: true,
        });
        // Assuming attachments is an array of objects with a filename property
        setAttachments(response.data.attachments || []);
      } catch (error) {
        console.error("Error fetching attachments:", error);
      }
    };

    fetchAttachments();
  }, [backendUrl]);

  // Fetch alumni
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const response = await axios.get(`${backendUrl}/profile/alumni`, {
          withCredentials: true,
        });
        setAlumni(response.data.alumni);
      } catch (error) {
        console.error("Error fetching alumni:", error);
      }
    };
    fetchAlumni();
  }, [backendUrl]);

  // Handle hover effects using useEffect

  const openPreviewModal = async (attachment) => {
    setPreviewAttachment(attachment);

    try {
      const response = await axios.get(
        `${backendUrl}/profile/attachments/preview/${attachment.filename}`,
        { withCredentials: true, responseType: "blob" } // Set responseType to 'blob' to handle binary data
      );

      // Create a temporary URL for the blob data
      const fileUrl = URL.createObjectURL(response.data);
      setPreviewFileUrl(fileUrl); // Store the file URL in the state
      setIsPreviewModalOpen(true);
    } catch (error) {
      console.error("Error fetching the file:", error);
    }
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setPreviewAttachment(null);
    setPreviewFileUrl(null); // Clear the file URL when the modal closes
  };

  const downloadAttachment = async (filename) => {
    try {
      const response = await axios.get(
        `${backendUrl}/profile/attachments/download/${filename}`,
        {
          responseType: "blob", // This ensures the response is processed as a binary Blob
          withCredentials: true, // Include credentials if needed
        }
      );

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename); // Filename to save as
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); // Clean up
    } catch (error) {
      console.error("Error downloading the attachment:", error);
    }
  };

  const renderAttachment = (attachment) => {
    if (typeof attachment !== "object" || !attachment.filename) {
      return <p key="invalid">Invalid attachment data</p>;
    }

    const { filename } = attachment;

    return (
      <div key={filename} className="mb-4">
        <button
          onClick={() => openPreviewModal(attachment)}
          className="text-black hover:underline"
        >
          {filename}
        </button>
      </div>
    );
  };
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const response = await axios.get(`${backendUrl}/profile/alumni`, {
          withCredentials: true,
        });
        setAlumni(response.data.alumni);
      } catch (error) {
        console.error("Error fetching alumni:", error);
      }
    };
    fetchAlumni();
  }, []);

  // Handle hover effects using useEffect
  useEffect(() => {
    // Select all elements with the class 'tab'
    const tabs = document.querySelectorAll(".tab");

    // Function that handles mouse enter event on tab
    const handleMouseEnter = (tab) => {
      // Change aria-label for different tab items based on the original label
      if (tab.getAttribute("aria-label") === "⚙︎") {
        tab.setAttribute("aria-label", "Settings");
      } else if (tab.getAttribute("aria-label") === "➤") {
        tab.setAttribute("aria-label", "Primary");
      } else if (tab.getAttribute("aria-label") === "✦") {
        tab.setAttribute("aria-label", "Secondary");
      } else if (tab.getAttribute("aria-label") === "☎︎") {
        tab.setAttribute("aria-label", "Contacts");
      } else if (tab.getAttribute("aria-label") === "✙") {
        tab.setAttribute("aria-label", "Attachments");
      } else if (tab.getAttribute("aria-label") === "✎") {
        tab.setAttribute("aria-label", "Education");
      } else if (tab.getAttribute("aria-label") === "★") {
        tab.setAttribute("aria-label", "Career");
      }
    };

    // Function that handles mouse leave event on tab
    const handleMouseLeave = (tab) => {
      // Reset aria-label back to original values when mouse leaves the tab
      if (tab.getAttribute("aria-label") === "Settings") {
        tab.setAttribute("aria-label", "⚙︎");
      } else if (tab.getAttribute("aria-label") === "Primary") {
        tab.setAttribute("aria-label", "➤");
      } else if (tab.getAttribute("aria-label") === "Secondary") {
        tab.setAttribute("aria-label", "✦");
      } else if (tab.getAttribute("aria-label") === "Contacts") {
        tab.setAttribute("aria-label", "☎︎");
      } else if (tab.getAttribute("aria-label") === "Attachments") {
        tab.setAttribute("aria-label", "✙");
      } else if (tab.getAttribute("aria-label") === "Education") {
        tab.setAttribute("aria-label", "✎");
      } else if (tab.getAttribute("aria-label") === "Career") {
        tab.setAttribute("aria-label", "★");
      }
    };

    // Attach mouseenter and mouseleave event listeners to each tab
    tabs.forEach((tab) => {
      tab.addEventListener("mouseenter", () => handleMouseEnter(tab)); // Add mouseenter listener to change aria-label
      tab.addEventListener("mouseleave", () => handleMouseLeave(tab)); // Add mouseleave listener to reset aria-label
    });

    // Cleanup event listeners when component unmounts or modal is closed
    return () => {
      tabs.forEach((tab) => {
        // Remove the event listeners when component unmounts or modal state changes
        tab.removeEventListener("mouseenter", () => handleMouseEnter(tab));
        tab.removeEventListener("mouseleave", () => handleMouseLeave(tab));
      });
    };
  }, [isModalOpen]); // Re-run the effect when modal state changes

  const openModal = (alumni) => {
    setIsPreviewModalOpen(false);
    setSelectedAlumni(alumni);
    setIsModalOpen(true);
    setActiveTab("primary");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAlumni(null);
  };
  const openCSVModal = () => {
    setIsCSVModalOpen(true);
  };
  const closeCSVModal = () => {
    setIsCSVModalOpen(false);
  };
  const closeDeleteCSV = () => {
    setIsDeleteModalOpen(false);
  };
  const closeViewContentCSV = () => {
    setIsCSVViewModalOpen(false);
  };
  const csvCSVViewModalRef = useRef(null);
  useEffect(() => {
    const handleClickOutsideViewCSV = (event) => {
      if (
        csvCSVViewModalRef.current &&
        !csvCSVViewModalRef.current.contains(event.target)
      ) {
        closeViewContentCSV();
      }
    };

    if (isCSVViewModal) {
      document.addEventListener("mousedown", handleClickOutsideViewCSV);
      return () =>
        document.removeEventListener("mousedown", handleClickOutsideViewCSV);
    }
  }, [isCSVViewModal]);

  const csvDeleteModalRef = useRef(null);

  useEffect(() => {
    const handleClickOutsideDelete = (event) => {
      if (
        csvDeleteModalRef.current &&
        !csvDeleteModalRef.current.contains(event.target)
      ) {
        closeDeleteCSV();
      }
    };

    if (isDeleteModalOpen) {
      document.addEventListener("mousedown", handleClickOutsideDelete);
      return () =>
        document.removeEventListener("mousedown", handleClickOutsideDelete);
    }
  }, [isDeleteModalOpen]);

  const csvModalRef = useRef(null);

  useEffect(() => {
    const handleClickOutsideCSV = (event) => {
      if (
        csvModalRef.current &&
        !csvModalRef.current.contains(event.target) &&
        !isDeleteModalOpen && // Prevent closing CSV modal if Delete modal is open
        !isCSVViewModal // Prevent closing CSV modal if Delete modal is open
      ) {
        closeCSVModal();
      }
    };

    if (isCSVModal) {
      document.addEventListener("mousedown", handleClickOutsideCSV);
      return () =>
        document.removeEventListener("mousedown", handleClickOutsideCSV);
    }
  }, [isCSVModal, isDeleteModalOpen, isCSVViewModal]);

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

  const previewModalRef = useRef(null);
  useEffect(() => {
    const handleClickOutsidePreview = (event) => {
      if (
        previewModalRef.current &&
        !previewModalRef.current.contains(event.target)
      ) {
        closePreviewModal();
      }
    };

    if (isPreviewModalOpen) {
      document.addEventListener("mousedown", handleClickOutsidePreview);
      return () =>
        document.removeEventListener("mousedown", handleClickOutsidePreview);
    }
  }, [isPreviewModalOpen]);

  const filteredAlumni = alumni
    .filter((alumni) =>
      `${alumni.firstName} ${alumni.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter(
      (alumni) =>
        (selectedProgram ? alumni.collegeProgram === selectedProgram : true) &&
        (selectedCollege ? alumni.college === selectedCollege : true) &&
        (selectedBatch ? alumni.yearGraduatedCollege === selectedBatch : true)
    );

  const sortedAlumni = [...filteredAlumni].sort((a, b) => {
    const nameA = `${a.firstName} ${a.lastName}`;
    const nameB = `${b.firstName} ${b.lastName}`;
    return sortOrder === "asc"
      ? nameA.localeCompare(nameB)
      : nameB.localeCompare(nameA);
  });

  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  // Paginate the alumni list
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAlumni = sortedAlumni.slice(startIndex, endIndex);

  const fetchCsvFiles = async () => {
    try {
      const response = await axios.get(`${backendUrl}/users/fetchcsv`, {
        withCredentials: true,
      });
      setCsvFiles(response.data || []);
    } catch (error) {
      console.error("Error fetching CSV files:", error);
      setErrorMessage("Error fetching CSV files.");
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 5000);
    }
  };

  const handleCSVFileChange = (event) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setSelectedFile(file);
    }
  };

  // Handle the upload of a CSV file
  const handleCSVUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Please upload a CSV File.");
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 5000);
      return;
    }

    const formData = new FormData();
    formData.append("csvFile", selectedFile); // Attach the file here

    try {
      const response = await axios.post(
        `${backendUrl}/users/uploadcsv`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setCsvFiles(response.data);
      setValidationMessage("CSV file uploaded successfully!");
      setShowValidationMessage(true);
      setTimeout(() => {
        setShowValidationMessage(false);
      }, 5000);

      // Reset the selectedFile state after upload
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading CSV file:", error);
      setErrorMessage(
        error.response?.data?.msg || "Error occurred while uploading."
      );
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false); // Hide the error message after 5 seconds
      }, 5000);
    }
  };

  // Handle deleting a CSV file
  const handleDeleteCsvFile = async () => {
    if (!selectedFileId) {
      console.error("No file selected for deletion");
      return;
    }
    try {
      await axios.delete(`${backendUrl}/users/deletecsv/${selectedFileId}`, {
        withCredentials: true,
      });

      // Fetch and update the list of CSV files after deletion
      fetchCsvFiles();
      setIsDeleteModalOpen(false);
      setValidationMessage("CSV file deleted successfully!");
      setShowValidationMessage(true);
      setTimeout(() => {
        setShowValidationMessage(false);
      }, 5000);

      // Reset the selectedFileId after deletion
      setSelectedFileId(null);
    } catch (error) {
      console.error("Error deleting CSV file:", error);
      setErrorMessage("Error occurred while deleting.");
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 5000);
    }
  };
  const handleViewCsvContent = async (fileId) => {
    try {
      const response = await axios.get(
        `${backendUrl}/users/viewcsv/${fileId}`,
        {
          withCredentials: true,
        }
      );
      setCsvFileContent(response.data); // Set the content of the CSV file
      setIsCSVViewModalOpen(true); // Open the modal
    } catch (error) {
      console.error("Error fetching CSV content:", error);
      setErrorMessage("Error fetching CSV content.");
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 5000);
    }
  };

  useEffect(() => {
    fetchCsvFiles();
  }, []);
  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
      <h1 className="text-2xl font-medium text-gray-700 mb-6">Alumni</h1>

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search Alumni"
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

      <div className="flex flex-col md:flex-row mb-6 space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex flex-col md:flex-row md:items-center">
          <span className="text-sm">Sort by:</span>
          <select
            className="ml-2 border border-black rounded px-3 py-1 text-sm w-full md:w-auto"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Name (A-Z)</option>
            <option value="desc">Name (Z-A)</option>
          </select>
        </div>

        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex flex-col md:flex-row md:items-center">
            <span className="text-sm">Filter by:</span>

            <select
              className="ml-2 border border-black rounded px-3 py-1 text-sm w-full md:w-44"
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
            >
              <option value="">All Colleges</option>
              <option value="UST-AMV College of Accountancy">
                UST-AMV College of Accountancy
              </option>
              <option value="College of Architecture">
                College of Architecture
              </option>
              <option value="Faculty of Arts and Letters">
                Faculty of Arts and Letters
              </option>
              <option value="Faculty of Civil Law">Faculty of Civil Law</option>
              <option value="College of Commerce and Business Administration">
                College of Commerce and Business Administration
              </option>
              <option value="College of Education">College of Education</option>
              <option value="Faculty of Engineering">
                Faculty of Engineering
              </option>
              <option value="College of Fine Arts and Design">
                College of Fine Arts and Design
              </option>
              <option value="College of Information and Computing Sciences">
                College of Information and Computing Sciences
              </option>
              <option value="Faculty of Medicine and Surgery">
                Faculty of Medicine and Surgery
              </option>
              <option value="Conservatory of Music">
                Conservatory of Music
              </option>
              <option value="College of Nursing">College of Nursing</option>
              <option value="Faculty of Pharmacy">Faculty of Pharmacy</option>
              <option value="Institute of Physical Education and Athletics">
                Institute of Physical Education and Athletics
              </option>
              <option value="College of Rehabilitation Sciences">
                College of Rehabilitation Sciences
              </option>
              <option value="College of Science">College of Science</option>
              <option value="College of Tourism and Hospitality Management">
                College of Tourism and Hospitality Management
              </option>
              <option value="Faculty of Canon Law">Faculty of Canon Law</option>
              <option value="Faculty of Philosophy">
                Faculty of Philosophy
              </option>
              <option value="Faculty of Sacred Theology">
                Faculty of Sacred Theology
              </option>
            </select>
          </div>

          <div className="flex flex-col md:flex-row md:items-center">
            <select
              className="ml-2 border border-black rounded px-3 py-1 text-sm w-full md:w-52"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
            >
              <option value="">All Programs</option>
              <option value="Accountancy">Accountancy</option>
              <option value="Accounting Information System">
                Accounting Information System
              </option>
              <option value="Management Accounting">
                Management Accounting
              </option>
              <option value="Architecture">Architecture</option>
              <option value="Asian Studies">Asian Studies</option>
              <option value="Behavioral Science">Behavioral Science</option>
              <option value="Communication">Communication</option>
              <option value="Creative Writing">Creative Writing</option>
              <option value="Economics">Economics</option>
              <option value="English Language Studies">
                English Language Studies
              </option>
              <option value="History">History</option>
              <option value="Journalism">Journalism</option>
              <option value="Legal Management">Legal Management</option>
              <option value="Literature">Literature</option>
              <option value="Philosophy">Philosophy</option>
              <option value="Political Science">Political Science</option>
              <option value="Sociology">Sociology</option>
              <option value="Business Administration, major in Business Economics">
                Business Administration, major in Business Economics
              </option>
              <option value="Business Administration, major in Financial Management">
                Business Administration, major in Financial Management
              </option>
              <option value="Business Administration, major in Human Resource Management">
                Business Administration, major in Human Resource Management
              </option>
              <option value="Business Administration, major in Marketing Management">
                Business Administration, major in Marketing Management
              </option>
              <option value="Entrepreneurship">Entrepreneurship</option>
              <option value="Secondary Education Major in English">
                Secondary Education Major in English
              </option>
              <option value="Secondary Education Major in Filipino">
                Secondary Education Major in Filipino
              </option>
              <option value="Secondary Education Major in Mathematics">
                Secondary Education Major in Mathematics
              </option>
              <option value="Secondary Education Major in Religious and Values Education">
                Secondary Education Major in Religious and Values Education
              </option>
              <option value="Secondary Education Major in Science">
                Secondary Education Major in Science
              </option>
              <option value="Secondary Education Major in Social Studies">
                Secondary Education Major in Social Studies
              </option>
              <option value="Early Childhood Education">
                Early Childhood Education
              </option>
              <option value="Elementary Education">Elementary Education</option>
              <option value="Special Needs Education, major in Early Childhood Education">
                Special Needs Education, major in Early Childhood Education
              </option>
              <option value="Food Technology">Food Technology</option>
              <option value="Nutrition and Dietetics">
                Nutrition and Dietetics
              </option>
              <option value="Bachelor of Library and Information Science">
                Bachelor of Library and Information Science
              </option>
              <option value="Chemical Engineering">Chemical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Electrical Engineering">
                Electrical Engineering
              </option>
              <option value="Electronics Engineering">
                Electronics Engineering
              </option>
              <option value="Industrial Engineering">
                Industrial Engineering
              </option>
              <option value="Mechanical Engineering">
                Mechanical Engineering
              </option>
              <option value="Fine Arts, major in Advertising Arts">
                Fine Arts, major in Advertising Arts
              </option>
              <option value="Fine Arts, major in Industrial Design">
                Fine Arts, major in Industrial Design
              </option>
              <option value="Interior Design">Interior Design</option>
              <option value="Fine Arts, major in Painting">
                Fine Arts, major in Painting
              </option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Systems">Information Systems</option>
              <option value="Information Technology">
                Information Technology
              </option>
              <option value="Basic Human Studies">Basic Human Studies</option>
              <option value="Doctor of Medicine">Doctor of Medicine</option>
              <option value="Master in Clinical Audiology">
                Master in Clinical Audiology
              </option>
              <option value="Master in Pain Management">
                Master in Pain Management
              </option>
              <option value="Performance, major in Bassoon">
                Performance, major in Bassoon
              </option>
              <option value="Performance, major in Choral Conducting">
                Performance, major in Choral Conducting
              </option>
              <option value="Performance, major in Clarinet">
                Performance, major in Clarinet
              </option>
              <option value="Composition">Composition</option>
              <option value="Performance, major in Double Bass">
                Performance, major in Double Bass
              </option>
              <option value="Performance, major in Flute">
                Performance, major in Flute
              </option>
              <option value="Performance, major in French Horn">
                Performance, major in French Horn
              </option>
              <option value="Performance, major in Guitar">
                Performance, major in Guitar
              </option>
              <option value="Jazz">Jazz</option>
              <option value="Musicology">Musicology</option>
              <option value="Music Education">Music Education</option>
              <option value="Music Theatre">Music Theatre</option>
              <option value="Music Technology">Music Technology</option>
              <option value="Performance, major in Oboe">
                Performance, major in Oboe
              </option>
              <option value="Performance, major in Orchestral Conducting">
                Performance, major in Orchestral Conducting
              </option>
              <option value="Performance, major in Percussion">
                Performance, major in Percussion
              </option>
              <option value="Performance, major in Piano">
                Performance, major in Piano
              </option>
              <option value="Performance, major in Saxophone">
                Performance, major in Saxophone
              </option>
              <option value="Performance, major in Trombone">
                Performance, major in Trombone
              </option>
              <option value="Performance, major in Trumpet">
                Performance, major in Trumpet
              </option>
              <option value="Performance, major in Tuba">
                Performance, major in Tuba
              </option>
              <option value="Performance, major in Viola">
                Performance, major in Viola
              </option>
              <option value="Performance, major in Violin">
                Performance, major in Violin
              </option>
              <option value="Performance, major in Violoncello">
                Performance, major in Violoncello
              </option>
              <option value="Performance, major in Voice">
                Performance, major in Voice
              </option>
              <option value="Nursing">Nursing</option>
              <option value="Biochemistry">Biochemistry</option>
              <option value="Medical Technology">Medical Technology</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Pharmacy, major in Clinical Pharmacy">
                Pharmacy, major in Clinical Pharmacy
              </option>
              <option value="Doctor of Pharmacy">Doctor of Pharmacy</option>
              <option value="Fitness and Sports Management">
                Fitness and Sports Management
              </option>
              <option value="Occupational Therapy">Occupational Therapy</option>
              <option value="Physical Therapy">Physical Therapy</option>
              <option value="Speech-Language Pathology">
                Speech-Language Pathology
              </option>
              <option value="Sports Science">Sports Science</option>
              <option value="Applied Mathematics, major in Actuarial Science">
                Applied Mathematics, major in Actuarial Science
              </option>
              <option value="Applied Physics, major in Instrumentation">
                Applied Physics, major in Instrumentation
              </option>
              <option value="Biology, major in Environmental Biology">
                Biology, major in Environmental Biology
              </option>
              <option value="Biology, major in Medical Biology">
                Biology, major in Medical Biology
              </option>
              <option value="Bachelor of Science major in Molecular Biology and Biotechnology">
                Bachelor of Science major in Molecular Biology and Biotechnology
              </option>
              <option value="Chemistry">Chemistry</option>
              <option value="Data Science and Analytics">
                Data Science and Analytics
              </option>
              <option value="Microbiology">Microbiology</option>
              <option value="Psychology">Psychology</option>
              <option value="Hospitality Management, major in Culinary Entrepreneurship">
                Hospitality Management, major in Culinary Entrepreneurship
              </option>
              <option value="Hospitality Management, major in Hospitality Leadership">
                Hospitality Management, major in Hospitality Leadership
              </option>
              <option value="Tourism Management, major in Recreation and Leisure Management">
                Tourism Management, major in Recreation and Leisure Management
              </option>
              <option value="Tourism Management, major in Travel Operation and Service Management">
                Tourism Management, major in Travel Operation and Service
                Management
              </option>
              <option value="Doctor of Canon Law">Doctor of Canon Law</option>
              <option value="Licentiate in Canon Law">
                Licentiate in Canon Law
              </option>
              <option value="Bachelor of Canon Law">
                Bachelor of Canon Law
              </option>
              <option value="Doctor of Philosophy">Doctor of Philosophy</option>
              <option value="Licentiate in Philosophy">
                Licentiate in Philosophy
              </option>
              <option value="Bachelor of Philosophy (Classical)">
                Bachelor of Philosophy (Classical)
              </option>
              <option value="Doctor of Sacred Theology">
                Doctor of Sacred Theology
              </option>
              <option value="Licentiate in Sacred Theology">
                Licentiate in Sacred Theology
              </option>
              <option value="Bachelor of Sacred Theology">
                Bachelor of Sacred Theology
              </option>
            </select>
          </div>
          <div className="flex flex-col md:flex-row md:items-center">
            <select
              className="ml-2 border border-black rounded px-3 py-1 text-sm w-full md:w-44"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
            >
              <option value="">All Batches</option>
              {uniqueYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-lg">All Alumni</div>
        <div>
          <button
            type="button"
            className="btn btn-sm w-30 md:btn-md md:w-52 lg:w-60 bg-blue text-white px-4 py-2 md:px-6 md:py-3"
            onClick={openCSVModal}
            aria-label="Save"
          >
            CSV Files for Registration
          </button>
        </div>
      </div>

      <hr className="mb-6 border-black" />

      {/* Use grid layout to display two columns per row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {paginatedAlumni.length > 0 ? (
          paginatedAlumni.map((alumni, index) => (
            <div
              key={index}
              className="mb-4 p-4 border border-black rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => openModal(alumni)}
            >
              <div className="text-md font-medium mb-1">
                {`${alumni.firstName} ${alumni.lastName}`}
              </div>
              <div className="text-sm text-black-600">{alumni.profession}</div>
            </div>
          ))
        ) : (
          <p>No alumni found.</p>
        )}
      </div>

      {/* Pagination Controls */}
      <ReactPaginate
        previousLabel={<button className="w-full h-full">Previous</button>}
        nextLabel={<button className="w-full h-full">Next</button>}
        breakLabel={<button className="w-full h-full">...</button>}
        pageCount={Math.ceil(sortedAlumni.length / itemsPerPage)} // Total pages
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageChange}
        containerClassName={"flex justify-center items-center space-x-2 mt-6"}
        pageClassName={
          "w-10 h-10 flex items-center justify-center border border-black rounded bg-white cursor-pointer hover:bg-gray-200 transition"
        }
        pageLinkClassName={"w-full h-full flex items-center justify-center"}
        previousClassName={
          "w-24 h-10 flex items-center justify-center border border-black rounded bg-white cursor-pointer hover:bg-gray-200 transition"
        }
        previousLinkClassName={"w-full h-full flex items-center justify-center"}
        nextClassName={
          "w-24 h-10 flex items-center justify-center border border-black rounded bg-white cursor-pointer hover:bg-gray-200 transition"
        }
        nextLinkClassName={"w-full h-full flex items-center justify-center"}
        breakClassName={
          "w-10 h-10 flex items-center justify-center border border-black bg-white cursor-default"
        }
        breakLinkClassName={"w-full h-full flex items-center justify-center"}
        activeClassName={"bg-black text-red font-medium"}
        disabledClassName={"opacity-50 cursor-not-allowed"}
      />

      {/* CSV Upload Modal */}
      {isCSVModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          {showErrorMessage && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red text-white p-4 rounded-lg shadow-lg z-50">
              <p>{errorMessage}</p>
            </div>
          )}

          {showValidationMessage && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green text-white p-4 rounded-lg shadow-lg z-50">
              <p>{validationMessage}</p>
            </div>
          )}
          {isCSVViewModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div
                ref={csvCSVViewModalRef}
                className="relative bg-white p-6 md:p-8 lg:p-12 rounded-lg w-full max-w-md md:max-w-3xl lg:max-w-4xl xl:max-w-5xl h-auto overflow-y-auto max-h-[90vh] mx-4"
              >
                <button
                  onClick={closeViewContentCSV} // Close the modal
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-sm md:text-base lg:text-lg"
                >
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>

                {/* Display the CSV content */}
                <div className="mb-4">
                  <div className="block mb-2 text-sm font-medium">
                    CSV File Content
                  </div>
                  <div className="block mb-2 text-sm font-light">
                    Below is the content of the CSV file you selected:
                  </div>

                  {/* Display CSV content as a table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                      <thead>
                        <tr>
                          {/* Display table headers based on the CSV content */}
                          {csvFileContent &&
                            csvFileContent.length > 0 &&
                            Object.keys(csvFileContent[0]).map(
                              (header, index) => (
                                <th key={index} className="px-4 py-2 text-left">
                                  {header}
                                </th>
                              )
                            )}
                        </tr>
                      </thead>
                      <tbody>
                        {csvFileContent && csvFileContent.length > 0 ? (
                          csvFileContent.map((row, index) => (
                            <tr key={index}>
                              {Object.values(row).map((value, idx) => (
                                <td key={idx} className="px-4 py-2">
                                  {value}
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="100%"
                              className="px-4 py-2 text-center"
                            >
                              No data available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          {isDeleteModalOpen && selectedFileId && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div
                ref={csvDeleteModalRef}
                className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-64 sm:w-96"
              >
                <h2 className="text-2xl mb-4">Delete CSV file</h2>
                <p>Are you sure you want to delete this CSV file?</p>
                <div className="flex justify-end mt-4">
                  <button
                    className="btn btn-sm w-24 bg-red text-white mr-2"
                    onClick={handleDeleteCsvFile}
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
          <div
            ref={csvModalRef}
            className="relative bg-white p-6 md:p-8 lg:p-12 rounded-lg w-full max-w-md md:max-w-3xl lg:max-w-4xl xl:max-w-5xl h-auto overflow-y-auto max-h-[90vh] mx-4"
          >
            <button
              onClick={closeCSVModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-sm md:text-base lg:text-lg"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>

            {/* Modal Content */}
            <div className="mb-4">
              <div className="block mb-2 text-sm font-medium">
                CSV Files for Registration
              </div>
              <div className="block mb-2 text-sm font-light">
                You can upload a CSV file containing alumni credentials,
                including student number, first name, last name, and birthday,
                for account registration.
                <span className="font-bold">
                  Ensure the CSV file format matches the example shown in the
                  image below before uploading.
                </span>
              </div>
              <div className="flex justify-center items-center mb-8 mt-4">
                <img
                  src={csvpic}
                  alt="CSV format example"
                  className="w-full max-w-md rounded-md shadow"
                />
              </div>
            </div>

            {/* File input */}
            <input
              type="file"
              name="csvFile"
              accept=".csv"
              className="file-input file-input-sm file-input-bordered text-xs w-full h-10 mb-4"
              onChange={handleCSVFileChange}
              ref={fileInputRef}
            />
            <div className="flex justify-center">
              <button
                className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-green text-white px-4 py-2 md:px-6 md:py-3 mb-6"
                onClick={handleCSVUpload}
                aria-label="Save"
              >
                Save
              </button>
            </div>

            {/* Display uploaded CSV Files */}
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Uploaded CSV Files</div>
              <div className="max-h-30 overflow-y-auto">
                <ul className="list-disc pl-5">
                  {csvFiles.length > 0 ? (
                    csvFiles.map((file) => (
                      <li
                        key={file._id}
                        className="flex items-center justify-between text-sm text-gray-700 mb-2"
                      >
                        {file.fileName}
                        <div className="flex items-center space-x-2">
                          {/* Wrapper div with flex */}
                          <button
                            onClick={() => {
                              handleViewCsvContent(file._id);
                            }}
                            className="w-5 h-5 rounded-full bg-blue flex justify-center items-center cursor-pointer fas fa-eye text-white"
                            style={{
                              fontSize: "11px",
                              textAlign: "center",
                              paddingTop: "3px",
                            }}
                            title="View"
                          ></button>
                          <div
                            onClick={() => {
                              setSelectedFileId(file._id);
                              setIsDeleteModalOpen(true);
                            }}
                            className="fas fa-trash text-white w-5 h-5 rounded-full bg-[#BE142E] flex justify-center mr-2 items-center cursor-pointer"
                            title="Delete"
                            style={{
                              fontSize: "12px",
                              textAlign: "center",
                              paddingTop: "4px",
                            }}
                          />
                        </div>
                      </li>
                    ))
                  ) : (
                    <li>No CSV files uploaded.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal */}
      {isModalOpen && selectedAlumni && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
        >
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
            {/* Preview Modal */}
            {isPreviewModalOpen && previewAttachment && previewFileUrl && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
                style={{ zIndex: 9999 }}
              >
                <div
                  ref={previewModalRef}
                  className="bg-white p-4 sm:p-6 md:p-8 lg:p-12 rounded-lg w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl h-auto overflow-y-auto max-h-full relative"
                >
                  <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-center">
                    {previewAttachment.filename}
                  </h2>

                  {/* Conditional rendering of Viewer or Image */}
                  {previewAttachment.filename.endsWith(".pdf") ? (
                    <Worker workerUrl={pdfWorker}>
                      <div className="w-full h-[40vh] overflow-auto mb-4 flex items-center justify-center">
                        <Viewer
                          fileUrl={previewFileUrl} // Use the URL fetched via axios
                          renderTextLayer={false}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    </Worker>
                  ) : (
                    <img
                      src={previewFileUrl}
                      alt={previewAttachment.filename}
                      className="mb-4 w-full h-64 object-cover rounded"
                    />
                  )}

                  <div className="flex justify-end space-x-2 sm:space-x-4 mt-4">
                    <button
                      onClick={closePreviewModal}
                      className="px-3 py-2 bg-gray-300 rounded-md text-sm sm:text-base hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() =>
                        downloadAttachment(previewAttachment.filename)
                      }
                      className="px-3 py-2 bg-blue text-white rounded-md text-sm sm:text-base hover:bg-blue-700 transition-colors"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div role="tablist" className="tabs tabs-lifted tabs-sm sm:tabs-lg">
              <input
                type="radio"
                name="my_tabs_2"
                role="tab"
                className="tab"
                aria-label="➤"
                defaultChecked
                title="Primary Information"
              />
              <div
                role="tabpanel"
                className="tab-content bg-base-100 border-base-300 rounded-box p-6 min-w-60"
              >
                <h1 className="text-xl mb-4">Primary Information</h1>
                {selectedAlumni.profileImage && (
                  <div className="mb-4">
                    <img
                      src={`${backendUrl}${selectedAlumni.profileImage}`}
                      alt="Alumni"
                      className="w-32 h-32"
                    />
                  </div>
                )}
                <p className="text-xs mb-1/2">Name</p>
                <p className="text-s mb-2 font-bold break-words">
                  {`${selectedAlumni.firstName} ${selectedAlumni.lastName}`}
                </p>
                <p className="text-xs mb-1/2">Birthday</p>
                <p className="text-s mb-2 font-bold break-words">
                  {formatDate(selectedAlumni.birthday)}
                </p>
                <p className="text-xs mb-1/2">Gender</p>
                <p className="text-s mb-2 font-bold break-words">
                  {selectedAlumni.gender || "-"}
                </p>
                <p className="text-xs mb-1/2">Region</p>
                <p className="text-s mb-2 font-bold break-words">
                  {selectedAlumni.region || "-"}
                </p>
                <p className="text-xs mb-1/2">Profession</p>
                <p className="text-s mb-2 font-bold break-words">
                  {selectedAlumni.profession || "-"}
                </p>
                <p className="text-xs mb-1/2">College</p>
                <p className="text-s mb-2 font-bold break-words">
                  {selectedAlumni.college || "-"}
                </p>
                <p className="text-xs mb-1/2">College Program</p>
                <p className="text-s mb-2 font-bold break-words">
                  {selectedAlumni.collegeProgram || "-"}
                </p>
                <p className="text-xs mb-1/2">Specialization</p>
                <p className="text-s mb-2 font-bold break-words">
                  {selectedAlumni.specialization || "-"}
                </p>
                <p className="text-xs mb-1/2">
                  Year Started on College Program
                </p>
                <p className="text-s mb-2 font-bold">
                  {selectedAlumni.yearStartedCollege || "-"}
                </p>
                <p className="text-xs mb-1/2">
                  Year Graduated on College Program
                </p>
                <p className="text-s mb-2 font-bold">
                  {selectedAlumni.yearGraduatedCollege || "-"}
                </p>
                <p className="text-xs mb-1/2">Time to Land a Job</p>
                <p className="text-s mb-2 font-bold">
                  {selectedAlumni.timeToJob || "-"}
                </p>
                <label className="pt-4 text-sm text-white opacity-0">
                  Mobile Number{" "}
                  <span className="text-xs font-light italic">
                    {" "}
                    ( include country code before your number, e.g.,{" "}
                    <span className="font-medium">63</span> 9125559207 for
                    PHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAAAAAAAAAAAA
                    )
                  </span>
                </label>
              </div>
              <input
                type="radio"
                name="my_tabs_2"
                role="tab"
                className="tab"
                aria-label="✦"
                title="Secondary Information"
              />
              <div
                role="tabpanel"
                className="tab-content bg-base-100 border-base-300 rounded-box p-6 min-w-60"
              >
                <h1 className="text-xl mb-4">Secondary Information</h1>
                <p className="text-xs mb-1/2">Employment Status</p>
                <p className="text-s mb-2 font-bold break-words">
                  {selectedAlumni.employmentStatus || "-"}
                </p>
                <p className="text-xs mb-1/2">Work Industry</p>
                <p className="text-s mb-2 font-bold break-words">
                  {selectedAlumni.workIndustry || "-"}
                </p>
                <p className="text-xs mb-1/2">
                  Is current profession in line with college degree
                </p>
                <p className="text-s mb-2 font-bold break-words">
                  {selectedAlumni.professionAlignment || "-"}
                </p>
                <p className="text-xs mb-1/2">Marital Status</p>
                <p className="text-s mb-2 font-bold break-words">
                  {selectedAlumni.maritalStatus || "-"}
                </p>
                <p className="text-xs mb-1/2">Salary range (PHP)</p>
                <p className="text-s mb-2 font-bold break-words">
                  {selectedAlumni.salaryRange || "-"}
                </p>
                <p className="text-xs mb-1/2">
                  Place of employment (Local or International)
                </p>
                <p className="text-s mb-2 font-bold break-words">
                  {selectedAlumni.placeOfEmployment || "-"}
                </p>
                <label className="pt-4 text-sm text-white opacity-0">
                  Mobile Number{" "}
                  <span className="text-xs font-light italic">
                    {" "}
                    ( include country code before your number, e.g.,{" "}
                    <span className="font-medium">63</span> 9125559207 for
                    PHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA )
                  </span>
                </label>
              </div>
              <input
                type="radio"
                name="my_tabs_2"
                role="tab"
                className="tab"
                aria-label="☎︎"
                title="Contact Information"
              />
              <div
                role="tabpanel"
                className="tab-content bg-base-100 border-base-300 rounded-box p-6 min-w-60"
              >
                <h1 className="text-xl mb-4">Contacts</h1>
                <p className="text-xs mb-1/2">Facebook</p>
                {selectedAlumni.contactInformation?.facebook ? (
                  <a
                    href={selectedAlumni.contactInformation.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-s mb-2 font-bold text-blue-600 hover:underline break-words max-w-full"
                  >
                    {selectedAlumni.contactInformation.facebook}
                  </a>
                ) : (
                  <p className="text-s mb-2 font-bold">-</p>
                )}
                <p className="text-xs mt-2 mb-1/2">LinkedIn</p>
                {selectedAlumni.contactInformation?.linkedIn ? (
                  <a
                    href={selectedAlumni.contactInformation.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-s mb-2 font-bold text-blue-600 hover:underline break-words max-w-full"
                  >
                    {selectedAlumni.contactInformation.linkedIn}
                  </a>
                ) : (
                  <p className="text-s mb-2 font-bold">-</p>
                )}
                <p className="text-xs mt-2 mb-1/2">Instagram</p>
                {selectedAlumni.contactInformation?.instagram ? (
                  <a
                    href={selectedAlumni.contactInformation.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-s mb-2 font-bold text-blue-600 hover:underline break-words max-w-full"
                  >
                    {selectedAlumni.contactInformation.instagram}
                  </a>
                ) : (
                  <p className="text-s mb-2 font-bold">-</p>
                )}
                <p className="text-xs mt-2 mb-1/2">Alternative Email Address</p>
                {selectedAlumni.contactInformation?.email ? (
                  <a
                    href={`mailto:${selectedAlumni.contactInformation.email}`}
                    className="text-s mb-2 font-bold text-blue-600 hover:underline break-words max-w-full"
                  >
                    {selectedAlumni.contactInformation.email}
                  </a>
                ) : (
                  <p className="text-s mb-2 font-bold">-</p>
                )}
                <p className="text-xs mt-2 mb-1/2">Mobile Number</p>
                <p className="text-s mb-2 font-bold">
                  {selectedAlumni.contactInformation?.mobileNumber ? (
                    <a
                      href={`tel:${selectedAlumni.contactInformation.mobileNumber}`}
                      className="text-s mb-2 font-bold text-blue-600 hover:underline break-words max-w-full"
                    >
                      {selectedAlumni.contactInformation.mobileNumber}
                    </a>
                  ) : (
                    <p className="text-s mb-2 font-bold">-</p>
                  )}
                </p>
                <label className="pt-4 text-sm text-white opacity-0">
                  Mobile Number{" "}
                  <span className="text-xs font-light italic">
                    {" "}
                    ( include country code before your number, e.g.,{" "}
                    <span className="font-medium">63</span> 9125559207 for
                    PHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA )
                  </span>
                </label>
              </div>
              <input
                type="radio"
                name="my_tabs_2"
                role="tab"
                className="tab"
                aria-label="✙"
                title="Attachments"
              />
              <div
                role="tabpanel"
                className="tab-content bg-base-100 border-base-300 rounded-box p-6 min-w-60"
              >
                <h1 className="text-xl mb-4">Attachments</h1>
                <div className="attachments-container break-words">
                  {selectedAlumni.attachments &&
                  selectedAlumni.attachments.length > 0 ? (
                    selectedAlumni.attachments.map((attachment, index) => (
                      <div className="break-words" key={index}>
                        {renderAttachment(attachment)}
                      </div>
                    ))
                  ) : (
                    <p>No attachments available.</p>
                  )}
                </div>
                <label className="pt-4 text-sm break-words text-white opacity-0">
                  Mobile Number{" "}
                  <span className="text-xs font-light italic">
                    {" "}
                    ( include country code before your number, e.g.,{" "}
                    <span className="font-medium">63</span> 9125559207 for
                    PHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA )
                  </span>
                </label>
              </div>

              <input
                type="radio"
                name="my_tabs_2"
                role="tab"
                className="tab"
                aria-label="✎"
                title="Educational Background"
              />
              <div
                role="tabpanel"
                className="tab-content bg-base-100 border-base-300 rounded-box p-6 min-w-60"
              >
                <h1 className="text-xl mb-4">Educational Background</h1>
                <p className="text-xs mb-1">Secondary Education</p>

                {selectedAlumni.secondaryEducation.map((edu, index) => (
                  <div key={index}>
                    <p className="text-s font-bold break-words">
                      {edu.schoolName}
                    </p>
                    <p className="text-xs mb-2">
                      {edu.yearStarted} - {edu.yearEnded}
                    </p>
                  </div>
                ))}
                <p className="text-xs mb-1 mt-3">Tertiary Education</p>
                {selectedAlumni.tertiaryEducation.map((edu, index) => (
                  <div key={index}>
                    <p className="text-s font-bold break-words">
                      {edu.schoolName}
                    </p>
                    <p className="text-xs mb-1 italic break-words">
                      {edu.program}
                    </p>
                    <p className="text-xs mb-2">
                      {edu.yearStarted} - {edu.yearEnded}
                    </p>
                  </div>
                ))}
                <label className="pt-4 text-sm text-white ">
                  Mobile Number{" "}
                  <span className="text-xs font-light italic">
                    {" "}
                    ( include country code before your number, e.g.,{" "}
                    <span className="font-medium">63</span> 9125559207 for
                    PHasdasdasdasdasdasdsasdasdasdasdasds )
                  </span>
                </label>
              </div>
              <input
                type="radio"
                name="my_tabs_2"
                role="tab"
                className="tab"
                aria-label="★"
                title="Career"
              />
              <div
                role="tabpanel"
                className="tab-content bg-base-100 border-base-300 rounded-box p-6 min-w-60"
              >
                <h1 className="text-xl mb-4">Career Background</h1>
                {selectedAlumni.careerBackground.map((career, index) => (
                  <div key={index}>
                    <p className="text-s font-bold break-words">
                      {career.companyName}
                    </p>
                    <p className="text-xs mb-1 italic break-words">
                      {career.position}
                    </p>
                    <p className="text-xs mb-1">
                      {career.yearStarted} - {career.yearEnded}
                    </p>
                    {career.remarks && (
                      <p className="text-xs mb-1">Remarks: {career.remarks}</p>
                    )}
                  </div>
                ))}
                <label className="pt-4 text-sm text-white opacity-0">
                  Mobile Number{" "}
                  <span className="text-xs font-light italic">
                    {" "}
                    ( include country code before your number, e.g.,{" "}
                    <span className="font-medium">63</span> 9125559207 for
                    PHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA )
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAlumni;
