import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function AdminAlumni() {
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

  const openPreviewModal = (attachment) => {
    setPreviewAttachment(attachment);
    setIsPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setPreviewAttachment(null);
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

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-medium text-gray-700">Alumni</h1>
      </div>

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

      <div className="text-lg mb-4">All Alumni</div>
      <hr className="mb-6 border-black" />

      {sortedAlumni.length > 0 ? (
        sortedAlumni.map((alumni, index) => (
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
            {isPreviewModalOpen && previewAttachment && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
                style={{ zIndex: 9999 }}
              >
                <div
                  ref={modalRef}
                  className="bg-white p-4 sm:p-6 md:p-8 lg:p-12 rounded-lg w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl h-auto overflow-y-auto max-h-full relative"
                >
                  <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-center">
                    {previewAttachment.filename}
                  </h2>
                  <iframe
                    src={`${backendUrl}/profile/attachments/preview/${previewAttachment.filename}`}
                    className="mb-4 w-full h-64"
                    title="File Preview"
                    frameBorder="0"
                  ></iframe>

                  <div className="flex justify-end space-x-2 sm:space-x-4 mt-4">
                    <button
                      onClick={closePreviewModal}
                      className="px-3 py-2 bg-gray-300 rounded-md text-sm sm:text-base hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        window.location.href = `${backendUrl}/profile/attachments/download/${previewAttachment.filename}`;
                      }}
                      className="px-3 py-2 bg-blue text-white rounded-md text-sm sm:text-base hover:bg-blue-700 transition-colors"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div role="tablist" className="tabs tabs-lifted mb-6">
              <input
                type="radio"
                name="my_tabs_2"
                role="tab"
                className="tab"
                aria-label="Primary"
                defaultChecked
              />
              <div
                role="tabpanel"
                className="tab-content bg-base-100 border-base-300 rounded-box p-6"
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
                <p className="text-s mb-2 font-bold">
                  {`${selectedAlumni.firstName} ${selectedAlumni.lastName}`}
                </p>
                <p className="text-xs mb-1/2">Birthday</p>
                <p className="text-s mb-2 font-bold">
                  {formatDate(selectedAlumni.birthday)}
                </p>
                <p className="text-xs mb-1/2">Gender</p>
                <p className="text-s mb-2 font-bold">
                  {selectedAlumni.gender || "-"}
                </p>
                <p className="text-xs mb-1/2">Region</p>
                <p className="text-s mb-2 font-bold">
                  {selectedAlumni.region || "-"}
                </p>
                <p className="text-xs mb-1/2">Profession</p>
                <p className="text-s mb-2 font-bold">
                  {selectedAlumni.profession || "-"}
                </p>
                <p className="text-xs mb-1/2">College</p>
                <p className="text-s mb-2 font-bold">
                  {selectedAlumni.college || "-"}
                </p>
                <p className="text-xs mb-1/2">College Program</p>
                <p className="text-s mb-2 font-bold">
                  {selectedAlumni.collegeProgram || "-"}
                </p>
                <p className="text-xs mb-1/2">Specialization</p>
                <p className="text-s mb-2 font-bold">
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
                <p className="text-xs mb-1/2">Time to Land a Job (Months)</p>
                <p className="text-s mb-2 font-bold">
                  {selectedAlumni.timeToJob || "-"}
                </p>
              </div>

              <input
                type="radio"
                name="my_tabs_2"
                role="tab"
                className="tab"
                aria-label="Secondary"
              />
              <div
                role="tabpanel"
                className="tab-content bg-base-100 border-base-300 rounded-box p-6"
              >
                <h1 className="text-xl mb-4">Secondary Information</h1>
                <p className="text-xs mb-1/2">Employment Status</p>
                <p className="text-s mb-2 font-bold">
                  {selectedAlumni.employmentStatus || "-"}
                </p>
                <p className="text-xs mb-1/2">Work Industry</p>
                <p className="text-s mb-2 font-bold">
                  {selectedAlumni.workIndustry || "-"}
                </p>
                <p className="text-xs mb-1/2">
                  Is current profession in line with college degree
                </p>
                <p className="text-s mb-2 font-bold">
                  {selectedAlumni.professionAlignment || "-"}
                </p>
                <p className="text-xs mb-1/2">Marital Status</p>
                <p className="text-s mb-2 font-bold">
                  {selectedAlumni.maritalStatus || "-"}
                </p>
                <p className="text-xs mb-1/2">Salary range (PHP)</p>
                <p className="text-s mb-2 font-bold">
                  {selectedAlumni.salaryRange || "-"}
                </p>
                <p className="text-xs mb-1/2">
                  Place of employment (Local or International)
                </p>
                <p className="text-s mb-2 font-bold">
                  {selectedAlumni.placeOfEmployment || "-"}
                </p>
              </div>

              <input
                type="radio"
                name="my_tabs_2"
                role="tab"
                className="tab"
                aria-label="Contacts"
              />
              <div
                role="tabpanel"
                className="tab-content bg-base-100 border-base-300 rounded-box p-6"
              >
                <h1 className="text-xl mb-4">Contacts</h1>
                <p className="text-xs mb-1/2">Facebook</p>
                {selectedAlumni.contactInformation?.facebook ? (
                  <a
                    href={selectedAlumni.contactInformation.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-s mb-2 font-bold text-blue-600 hover:underline"
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
                    className="text-s mb-2 font-bold text-blue-600 hover:underline"
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
                    className="text-s mb-2 font-bold text-blue-600 hover:underline"
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
                    className="text-s mb-2 font-bold text-blue-600 hover:underline"
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
                      className="text-s mb-2 font-bold text-blue-600 hover:underline"
                    >
                      {selectedAlumni.contactInformation.mobileNumber}
                    </a>
                  ) : (
                    <p className="text-s mb-2 font-bold">-</p>
                  )}
                </p>
              </div>

              <input
                type="radio"
                name="my_tabs_2"
                role="tab"
                className="tab"
                aria-label="Attachments"
              />
              <div
                role="tabpanel"
                className="tab-content bg-base-100 border-base-300 rounded-box p-6"
              >
                <h1 className="text-xl mb-4">Attachments</h1>
                <div className="attachments-container">
                  {selectedAlumni.attachments &&
                  selectedAlumni.attachments.length > 0 ? (
                    selectedAlumni.attachments.map((attachment, index) => (
                      <div key={index}>{renderAttachment(attachment)}</div>
                    ))
                  ) : (
                    <p>No attachments available.</p>
                  )}
                </div>
              </div>

              <input
                type="radio"
                name="my_tabs_2"
                role="tab"
                className="tab"
                aria-label="Education"
              />
              <div
                role="tabpanel"
                className="tab-content bg-base-100 border-base-300 rounded-box p-6"
              >
                <h1 className="text-xl mb-4">Educational Background</h1>
                <p className="text-xs mb-1">Secondary Education</p>
                {selectedAlumni.secondaryEducation.map((edu, index) => (
                  <div key={index}>
                    <p className="text-s font-bold">{edu.schoolName}</p>
                    <p className="text-xs mb-2">
                      {edu.yearStarted} - {edu.yearEnded}
                    </p>
                  </div>
                ))}
                <p className="text-xs mb-1 mt-3">Tertiary Education</p>
                {selectedAlumni.tertiaryEducation.map((edu, index) => (
                  <div key={index}>
                    <p className="text-s font-bold">{edu.schoolName}</p>
                    <p className="text-xs mb-1 italic">{edu.program}</p>
                    <p className="text-xs mb-2">
                      {edu.yearStarted} - {edu.yearEnded}
                    </p>
                  </div>
                ))}
              </div>

              <input
                type="radio"
                name="my_tabs_2"
                role="tab"
                className="tab"
                aria-label="Career"
              />
              <div
                role="tabpanel"
                className="tab-content bg-base-100 border-base-300 rounded-box p-6"
              >
                <h1 className="text-xl mb-4">Career Background</h1>
                {selectedAlumni.careerBackground.map((career, index) => (
                  <div key={index}>
                    <p className="text-s font-bold">{career.companyName}</p>
                    <p className="text-xs mb-1 italic">{career.position}</p>
                    <p className="text-xs mb-2">
                      {career.yearStarted} - {career.yearEnded}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAlumni;
