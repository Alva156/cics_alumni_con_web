import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function Alumni() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [alumni, setAlumni] = useState([]);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [activeTab, setActiveTab] = useState("primary");
  const modalRef = useRef(null);

  const formatDate = (dateString) => {
    if (!dateString) return " ";
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
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

  const filteredAlumni = alumni
    .filter((alumni) =>
      `${alumni.firstName} ${alumni.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter((alumni) =>
      selectedProgram ? alumni.collegeProgram === selectedProgram : true
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
      <h1 className="text-xl mb-4">Alumni</h1>

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

      <div className="flex md:flex-row">
        <div className="mb-6">
          <span className="text-sm">Sort by:</span>
          <select
            className="ml-2 border border-black rounded px-3 py-1 text-sm mr-10"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Name (A-Z)</option>
            <option value="desc">Name (Z-A)</option>
          </select>
        </div>
        <div className="mb-6">
          <span className="text-sm">Filter:</span>
          <select
            className="ml-2 border border-black rounded px-3 py-1 text-sm"
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
          >
            <option value="">All Programs</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Systems">Information Systems</option>
            <option value="Information Technology">
              Information Technology
            </option>
          </select>
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

            {/* Profile Image */}
            {selectedAlumni.profileImage && (
              <img
                src={selectedAlumni.profileImage}
                alt="Alumni"
                className="w-32 h-32 mb-4 rounded-full mx-auto"
              />
            )}

            {/* Tab Navigation */}
            <div className="mb-4 flex space-x-4">
              <button
                className={`py-2 px-4 ${
                  activeTab === "primary" ? "bg-gray-200" : ""
                }`}
                onClick={() => setActiveTab("primary")}
              >
                Primary Information
              </button>
              <button
                className={`py-2 px-4 ${
                  activeTab === "secondary" ? "bg-gray-200" : ""
                }`}
                onClick={() => setActiveTab("secondary")}
              >
                Secondary Information
              </button>
              <button
                className={`py-2 px-4 ${
                  activeTab === "contact" ? "bg-gray-200" : ""
                }`}
                onClick={() => setActiveTab("contact")}
              >
                Contact Information
              </button>
              <button
                className={`py-2 px-4 ${
                  activeTab === "attachments" ? "bg-gray-200" : ""
                }`}
                onClick={() => setActiveTab("attachments")}
              >
                Attachments
              </button>
              <button
                className={`py-2 px-4 ${
                  activeTab === "education" ? "bg-gray-200" : ""
                }`}
                onClick={() => setActiveTab("education")}
              >
                Educational Background
              </button>
              <button
                className={`py-2 px-4 ${
                  activeTab === "career" ? "bg-gray-200" : ""
                }`}
                onClick={() => setActiveTab("career")}
              >
                Career Background
              </button>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === "primary" && (
                <>
                  <p className="text-xs mb-1/2">Name</p>
                  <p className="text-s mb-2 font-bold">{`${selectedAlumni.firstName} ${selectedAlumni.lastName}`}</p>
                  <p className="text-xs mb-1/2">Profession</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.profession}
                  </p>
                  <p className="text-xs mb-1/2">College Program</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.collegeProgram}
                  </p>
                  <p className="text-xs mb-1/2">Specialization</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.specialization}
                  </p>
                  <p className="text-xs mb-1/2">
                    Year Started on College Program
                  </p>
                  <p className="text-s mb-2 font-bold">
                    {formatDate(selectedAlumni.yearStartedCollege)}
                  </p>
                  <p className="text-xs mb-1/2">
                    Year Graduated on College Program
                  </p>
                  <p className="text-s mb-2 font-bold">
                    {formatDate(selectedAlumni.yearGraduatedCollege)}
                  </p>
                  <p className="text-xs mb-1/2">Time to Land a Job (Months)</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.timeToJob}
                  </p>
                </>
              )}
              {activeTab === "secondary" && (
                <>
                  <p className="text-xs mb-1/2">Employment Status</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.employmentStatus}
                  </p>
                  <p className="text-xs mb-1/2">Work Industry</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.workIndustry}
                  </p>
                  <p className="text-xs mb-1/2">
                    Is current profession in line with college degree
                  </p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.professionAlignment}
                  </p>
                  <p className="text-xs mb-1/2">Marital Status</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.maritalStatus}
                  </p>
                  <p className="text-xs mb-1/2">Salary range (PHP)</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.salaryRange}
                  </p>
                  <p className="text-xs mb-1/2">
                    Place of employment (Local or International)
                  </p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.placeOfEmployment}
                  </p>
                </>
              )}
              {activeTab === "contact" && (
                <>
                  <p className="text-xs mb-1/2">LinkedIn</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.contactInformation?.linkedin}
                  </p>
                  <p className="text-xs mb-1/2">Facebook</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.contactInformation?.facebook}
                  </p>
                  <p className="text-xs mb-1/2">Instagram</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.contactInformation?.instagram}
                  </p>
                  <p className="text-xs mb-1/2">Email</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.contactInformation?.email}
                  </p>
                  <p className="text-xs mb-1/2">Mobile Number</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.contactInformation?.mobileNumber}
                  </p>
                </>
              )}
              {activeTab === "attachments" && (
                <>
                  <h1 className="text-xl mb-4 mt-6">Attachments</h1>
                  {selectedAlumni.attachments &&
                  selectedAlumni.attachments.length > 0 ? (
                    selectedAlumni.attachments.map((attachment, index) => (
                      <div key={index} className="mb-2">
                        <a
                          href={attachment.url}
                          className="text-blue-600 underline"
                        >
                          {attachment.name}
                        </a>
                      </div>
                    ))
                  ) : (
                    <p>No attachments available.</p>
                  )}
                </>
              )}
              {activeTab === "education" && (
                <>
                  <h1 className="text-xl mb-4 mt-6">Educational Background</h1>
                  <p className="text-xs mb-1">Secondary Education</p>
                  <p className="text-s font-bold">
                    {selectedAlumni.secondaryeducation}
                  </p>
                  <p className="text-xs mb-2">
                    {selectedAlumni.secondaryeducationyear}
                  </p>
                  <p className="text-xs mb-1 mt-3">Tertiary Education</p>
                  <p className="text-s font-bold">
                    {selectedAlumni.tertiaryeducation}
                  </p>
                  <p className="text-xs mb-1 italic">
                    {selectedAlumni.tertiaryeducationdegree}
                  </p>
                  <p className="text-xs mb-2">
                    {selectedAlumni.tertiaryeducationyear}
                  </p>
                </>
              )}
              {activeTab === "career" && (
                <>
                  <h1 className="text-xl mb-4 mt-6">Career Background</h1>
                  <p className="text-s font-bold">{selectedAlumni.career}</p>
                  <p className="text-xs mb-1 italic">
                    {selectedAlumni.careerposition}
                  </p>
                  <p className="text-xs mb-2">{selectedAlumni.careeryear}</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Alumni;
