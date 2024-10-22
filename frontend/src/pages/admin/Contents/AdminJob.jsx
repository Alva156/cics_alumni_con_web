import React, { useState, useEffect, useRef } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";

function AdminJobs() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [selectedJobs, setSelectedJobs] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState([]);
  const [sortCriteria, setSortCriteria] = useState("Name (A-Z)");
  const modalRef = useRef(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showSuccessMessage, setSuccessMessage] = useState(false);
  const [showErrorMessage, setErrorMessage] = useState(false);
  const [showMessage, setshowMessage] = useState("");

  // Fetch all jobs from the server
  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${backendUrl}/jobs/view`, {
        withCredentials: true,
      });
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openViewModal = (jobs) => {
    setSelectedJobs(jobs);
    setIsViewModalOpen(true);
  };

  const openEditModal = (jobs) => {
    setSelectedJobs(jobs);
    setIsEditModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedJobs(null);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setSelectedJobs(null);
  };

  const handleDeleteJobs = async () => {
    if (!selectedJobs) {
      console.log("No jobs selected for deletion.");
      return;
    }

    console.log("Deleting jobs with ID:", selectedJobs._id); // Debugging line

    try {
      const response = await axios.delete(
        `${backendUrl}/jobs/delete-jobs/${selectedJobs._id}`,
        { withCredentials: true }
      );

      console.log("Delete response:", response.data); // Debugging line
      fetchJobs(); // Refresh jobs list
      closeModal(); // Close modal after deleting
      setshowMessage("Jobs deleted successfully!");
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Error deleting jobs:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleUpdateJobs = async () => {
    if (!selectedJobs) return;
    if (
      !selectedJobs.name ||
      !selectedJobs.address ||
      !selectedJobs.description ||
      !selectedJobs.contact
    ) {
      setshowMessage("Please fill in all required fields.");
      setErrorMessage(true);
      setTimeout(() => setErrorMessage(false), 3000);
      return;
    }

    try {
      const response = await axios.put(
        `${backendUrl}/jobs/update-jobs/${selectedJobs._id}`,
        {
          name: selectedJobs.name,
          address: selectedJobs.address,
          image: selectedJobs.image,
          description: selectedJobs.description,
          contact: selectedJobs.contact,
        },
        { withCredentials: true }
      );

      setJobs((prevJobs) =>
        prevJobs.map((jobs) =>
          jobs._id === selectedJobs._id ? response.data : jobs
        )
      );

      closeModal();
      setshowMessage("Jobs updated successfully!");
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating jobs:", error);
    }
  };

  const handleCreateJobs = async () => {
    const jobsData = {
      name: document.getElementById("jobs-name").value,
      address: document.getElementById("jobs-address").value,
      image: "", // Handle image upload separately
      description: document.getElementById("jobs-description").value,
      contact: document.getElementById("jobs-contact").value,
    };
    if (
      !jobsData.name ||
      !jobsData.address ||
      !jobsData.description ||
      !jobsData.contact
    ) {
      setshowMessage("Please fill in all required fields.");
      setErrorMessage(true); // Ensure to set this to true
      setTimeout(() => setErrorMessage(false), 3000);
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/jobs/create-jobs`,
        jobsData,
        {
          withCredentials: true,
        }
      );

      setJobs([...jobs, response.data]); // Update jobs list
      setSelectedJobs(null); // Clear selected jobs
      setIsAddModalOpen(false); // Close the modal
      setshowMessage("Jobs created successfully!");
      setSuccessMessage(true);
      // Optionally reset input fields if necessary
      document.getElementById("jobs-name").value = "";
      document.getElementById("jobs-address").value = "";
      document.getElementById("jobs-description").value = "";
      document.getElementById("jobs-contact").value = "";
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Error creating jobs:", error);
    }
  };

  const filteredJobs = jobs.filter((jobs) =>
    jobs.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort jobs based on selected criteria
  const sortedJobs = filteredJobs.sort((a, b) => {
    if (sortCriteria === "Name (A-Z)") {
      return a.name.localeCompare(b.name);
    } else if (sortCriteria === "Name (Z-A)") {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green text-white p-4 rounded-lg shadow-lg z-50">
          <p>{showMessage}</p>
        </div>
      )}

      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-medium text-gray-700">
          Job/Internship Referrals
        </h1>
      </div>

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search Jobs"
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
        <select
          className="ml-2 border border-black rounded px-3 py-1 text-sm"
          value={sortCriteria}
          onChange={(e) => setSortCriteria(e.target.value)} // Update sort criteria state
        >
          <option>Name (A-Z)</option>
          <option>Name (Z-A)</option>
        </select>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-lg">My Listed Jobs</div>
        <button
          className="btn btn-sm w-36 bg-green text-white relative"
          onClick={openAddModal}
        >
          +
        </button>
      </div>

      <hr className="mb-6 border-black" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((jobs) => (
          <div
            key={jobs._id}
            className="relative mb-4 p-4 border border-black rounded-lg flex flex-col hover:bg-gray-200 transition-colors cursor-pointer"
            onClick={() => openViewModal(jobs)}
          >
            <img
              src={`${backendUrl}${jobs.image}`}
              alt={jobs.name}
              className="w-full h-48 object-cover rounded-t-lg mb-4"
            />
            <div className="absolute top-2 right-2 flex space-x-2">
              <div
                className="w-4 h-4 rounded-full bg-[#BE142E] flex justify-center items-center cursor-pointer relative group"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedJobs(jobs);
                  setIsDeleteModalOpen(true);
                }}
              >
                <span className="hidden group-hover:block absolute bottom-8 bg-gray-700 text-white text-xs rounded px-2 py-1">
                  Delete
                </span>
              </div>
              <div
                className="w-4 h-4 rounded-full bg-[#3D3C3C] flex justify-center items-center cursor-pointer relative group"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(jobs);
                }}
              >
                <span className="hidden group-hover:block absolute bottom-8 bg-gray-700 text-white text-xs rounded px-2 py-1">
                  Edit
                </span>
              </div>
            </div>
            <div>
              <div className="text-md font-medium mb-1">{jobs.name}</div>
              <div className="text-sm text-black-600">{jobs.address}</div>
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedJobs && (
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
            <div className="text-2xl font-medium mb-2">{selectedJobs.name}</div>
            <div className="text-md mb-2">{selectedJobs.address}</div>
            <img
              src={selectedJobs.image}
              alt={selectedJobs.name}
              className="mb-4 w-full h-48 md:h-64 lg:h-80 object-cover rounded"
            />
            <div className="text-sm mb-4">{selectedJobs.description}</div>
            <div className="text-sm font-medium mb-2">Contact Details</div>
            <a
              href={`mailto:${selectedJobs.contact}`}
              className="block text-sm text-blue-600 underline"
            >
              {selectedJobs.contact}
            </a>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedJobs && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
        >
          <div
            ref={modalRef}
            className="bg-white p-6 md:p-8 lg:p-12 rounded-lg max-w-full md:max-w-3xl lg:max-w-4xl w-full h-auto overflow-y-auto max-h-full relative"
          >
            {showErrorMessage && (
              <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red text-white p-4 rounded-lg shadow-lg z-[70]">
                <p>{showMessage}</p>
              </div>
            )}
            <button
              className="absolute top-4 right-4 text-black text-2xl"
              onClick={closeModal}
            >
              &times;
            </button>
            <div className="text-xl mb-3">Edit Jobs</div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Jobs Name</label>
              <input
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Jobs Name"
                value={selectedJobs.name}
                onChange={(e) =>
                  setSelectedJobs({
                    ...selectedJobs,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Address</label>
              <input
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                value={selectedJobs.address}
                onChange={(e) =>
                  setSelectedJobs({
                    ...selectedJobs,
                    address: e.target.value,
                  })
                }
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">Jobs Image</label>
              <input
                type="file"
                accept="image/*"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">Description</label>
              <textarea
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                value={selectedJobs.description}
                onChange={(e) =>
                  setSelectedJobs({
                    ...selectedJobs,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Contact</label>
              <input
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                value={selectedJobs.contact}
                onChange={(e) =>
                  setSelectedJobs({
                    ...selectedJobs,
                    contact: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-4 mb-4">
              <button
                className="btn bg-zinc-800 text-white w-full md:w-64 py-2 rounded-lg"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateJobs}
                className="btn bg-green text-white w-full md:w-64 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-64 sm:w-96">
            <h2 className="text-2xl mb-4">Delete Jobs</h2>
            <p>Are you sure you want to delete this jobs?</p>
            <div className="flex justify-end mt-4">
              <button
                className="btn btn-sm w-24 bg-red text-white mr-2"
                onClick={() => {
                  handleDeleteJobs(); // Call the delete function
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

      {/* Add Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
        >
          <div
            ref={modalRef}
            className="bg-white p-6 md:p-8 lg:p-12 rounded-lg max-w-full md:max-w-3xl lg:max-w-4xl w-full h-auto overflow-y-auto max-h-full relative"
          >
            {showErrorMessage && (
              <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red text-white p-4 rounded-lg shadow-lg z-[70]">
                <p>{showMessage}</p>
              </div>
            )}
            <button
              className="absolute top-4 right-4 text-black text-2xl"
              onClick={closeModal}
            >
              &times;
            </button>
            <div className="text-xl mb-3">Add New Jobs</div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Jobs Name</label>
              <input
                id="jobs-name"
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter Jobs Name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Address</label>
              <input
                id="jobs-address"
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter Jobs Address"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Jobs Image</label>
              <input
                type="file"
                accept="image/*"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Description</label>
              <textarea
                id="jobs-description"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter Jobs Description"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Contact Details</label>
              <input
                id="jobs-contact"
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter Jobs Details"
              />
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-4 mb-4">
              <button
                className="btn bg-zinc-800 text-white w-full md:w-64 py-2 rounded-lg"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="btn bg-green text-white w-full md:w-64 py-2 rounded-lg"
                onClick={handleCreateJobs}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminJobs;
