import React, { useState, useEffect, useRef } from "react";
import ReactPaginate from "react-paginate";
import axios from "axios";
import { Worker, Viewer } from "@react-pdf-viewer/core"; // Import Viewer
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.js";
import "../../App.css";
import blankprofilepic from "../../assets/blankprofilepic.jpg";

function Alumni() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [alumni, setAlumni] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false); // New modal state
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [previewFileUrl, setPreviewFileUrl] = useState(null);
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

      <div className="flex flex-col md:flex-row mb-6 gap-4 md:gap-6 flex-wrap">
  {/* Sort by */}
  <div className="flex flex-col md:flex-row md:items-center mb-2">
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

  {/* Filter by */}
  <div className="flex flex-col md:flex-row md:items-center mb-2">
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

  {/* Program */}
  <div className="flex flex-col md:flex-row md:items-center mb-2">
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

  {/* Batch */}
  <div className="flex flex-col md:flex-row md:items-center mb-2">
    <select
      className="ml-2 border border-black rounded px-3 py-1 text-sm w-full md:w-52"
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


      <div className="text-lg mb-4">All Alumni</div>
      <hr className="mb-6 border-black" />

      {/* Use grid layout with two columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {paginatedAlumni.length > 0 ? (
          paginatedAlumni.map((alumni, index) => (
            <div
              key={index}
              className="mb-4 p-4 border border-black rounded-lg cursor-pointer hover:bg-gray-200 transition-colors flex items-center"
              onClick={() => openModal(alumni)}
            >
              <img
                src={
                  alumni.profileImage && alumni.profileImage.trim()
                    ? `${backendUrl}${alumni.profileImage}`
                    : blankprofilepic
                }
                alt="Alumni"
                className="w-16 h-16 border border-gray-300 object-cover mr-4"
              />
              <div>
                <div className="text-md font-medium mb-1">
                  {`${alumni.firstName} ${alumni.lastName}`}
                </div>
                <div className="text-sm text-black-600">
                  {alumni.profession}
                </div>
              </div>
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
                <div className="mb-4">
                  <img
                    src={
                      selectedAlumni.profileImage &&
                      selectedAlumni.profileImage.trim() !== ""
                        ? `${backendUrl}${selectedAlumni.profileImage}`
                        : blankprofilepic
                    }
                    alt="Alumni"
                    className="w-32 h-32"
                  />
                </div>
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
                    PHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA )
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

export default Alumni;
