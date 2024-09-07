import React, { useState, useEffect, useRef } from "react";

function Job() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const modalRef = useRef(null);

  const jobs = [
    {
      name: "Job/Internship Title",
      field: "Field",
      image: "",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      contact: "Contact Details",
    },
    {
      name: "Job/Internship Title",
      field: "Field",
      image: "",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      contact: "Contact Details",
    },
    {
      name: "Job/Internship Title",
      field: "Field",
      image: "",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      contact: "Contact Details",
    },
  ];

  const openModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
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

  const filteredJob = jobs.filter((job) =>
    job.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
      <h1 className="text-xl mb-4">Job and Internship Referrals</h1>

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search Job or Internship"
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
          <option>Title (A-Z)</option>
          <option>Title (Z-A)</option>
        </select>
      </div>

      <div className="text-lg mb-4">All Jobs/Internships</div>

      <hr className="mb-6 border-black" />

      {filteredJob.map((job, index) => (
        <div
          key={index}
          className="mb-4 p-4 border border-black rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => openModal(job)}
        >
          <div className="text-md font-medium mb-1">{job.name}</div>
          <div className="text-sm text-black-600">{job.field}</div>
        </div>
      ))}

      {/* Modal */}
      {isModalOpen && selectedJob && (
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
            <div className="text-2xl font-medium mb-2">{selectedJob.name}</div>
            <div className="text-md mb-2">{selectedJob.field}</div>
            <img
              src={selectedJob.image}
              alt={selectedJob.name}
              className="mb-4 w-full h-48 md:h-64 lg:h-80 object-cover rounded"
            />
            <div className="text-sm mb-4">{selectedJob.description}</div>
            <div className="text-sm font-medium mb-2">
              {selectedJob.contact}
            </div>
            <a
              href={`mailto:job@gmail.com`}
              className="block text-sm text-blue-600 underline"
            >
              job@gmail.com
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default Job;
