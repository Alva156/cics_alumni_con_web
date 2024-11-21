import React, { useState, useEffect, useRef } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";

function AdminCertifications() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [selectedCertifications, setSelectedCertifications] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [certifications, setCertifications] = useState([]);
  const [sortCriteria, setSortCriteria] = useState("Most Recent");
  const modalRef = useRef(null);
  const deleteModalRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle outside click for delete modal
      if (
        deleteModalRef.current &&
        !deleteModalRef.current.contains(event.target)
      ) {
        setIsDeleteModalOpen(false);
      }
    };

    if (isDeleteModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDeleteModalOpen]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (
      isViewModalOpen ||
      isEditModalOpen ||
      isAddModalOpen ||
      isDeleteModalOpen
    ) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isViewModalOpen, isEditModalOpen, isAddModalOpen, isDeleteModalOpen]);
  const [showSuccessMessage, setSuccessMessage] = useState(false);
  const [showErrorMessage, setErrorMessage] = useState(false);
  const [showMessage, setshowMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-8 border-red border-solid border-opacity-75"></div>
    </div>
  );

  // Fetch all certifications from the server
  const fetchCertifications = async () => {
    try {
      const response = await axios.get(`${backendUrl}/certifications/view`, {
        withCredentials: true,
      });
      setCertifications(response.data);
    } catch (error) {
      console.error("Error fetching certifications:", error);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  const openViewModal = (certifications) => {
    setSelectedCertifications(certifications);
    setIsViewModalOpen(true);
  };

  const openEditModal = (certifications) => {
    setSelectedCertifications(certifications);
    setIsEditModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedCertifications(null);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedCertifications(null);
  };

  const handleDeleteCertifications = async () => {
    if (!selectedCertifications) {
      console.log("No certifications selected for deletion.");
      return;
    }

    console.log("Deleting certifications with ID:", selectedCertifications._id); // Debugging line

    try {
      const response = await axios.delete(
        `${backendUrl}/certifications/delete-certifications/${selectedCertifications._id}`,
        { withCredentials: true }
      );

      console.log("Delete response:", response.data); // Debugging line
      fetchCertifications(); // Refresh certifications list
      closeModal(); // Close modal after deleting
      setshowMessage("Certifications deleted successfully!");
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Error deleting certifications:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleUpdateCertifications = async () => {
    if (!selectedCertifications) return;

    if (
      !selectedCertifications.name ||
      !selectedCertifications.address ||
      !selectedCertifications.description
    ) {
      setshowMessage("Please fill in all required fields.");
      setErrorMessage(true);
      setTimeout(() => setErrorMessage(false), 3000);
      return;
    }

    const certificationsData = new FormData();
    certificationsData.append("name", selectedCertifications.name);
    certificationsData.append("address", selectedCertifications.address);
    certificationsData.append(
      "description",
      selectedCertifications.description
    );
    certificationsData.append(
      "contact",
      selectedCertifications.contact ? selectedCertifications.contact : ""
    );

    const image = document.getElementById("certifications-image").files[0];
    if (image) {
      certificationsData.append("image", image);
    }
    setLoading(true); // Start loading

    try {
      const response = await axios.put(
        `${backendUrl}/certifications/update-certifications/${selectedCertifications._id}`,
        certificationsData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setCertifications((prevCertifications) =>
        prevCertifications.map((certification) =>
          certification._id === selectedCertifications._id
            ? response.data
            : certification
        )
      );

      closeModal();
      setshowMessage("Certifications updated successfully!");
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating certifications:", error);
      if (error.response) {
        setshowMessage(error.response.data.msg);
        setErrorMessage(true);
        setTimeout(() => setErrorMessage(false), 3000);
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleCreateCertifications = async () => {
    const certificationsData = new FormData();
    certificationsData.append(
      "name",
      document.getElementById("certifications-name").value
    );
    certificationsData.append(
      "address",
      document.getElementById("certifications-address").value
    );
    certificationsData.append(
      "description",
      document.getElementById("certifications-description").value
    );
    certificationsData.append(
      "contact",
      document.getElementById("certifications-contact").value
    );

    const image = document.getElementById("certifications-image").files[0];
    if (image) {
      certificationsData.append("image", image);
    }

    if (
      !certificationsData.get("name") ||
      !certificationsData.get("address") ||
      !certificationsData.get("description")
    ) {
      setshowMessage("Please fill in all required fields.");
      setErrorMessage(true);
      setTimeout(() => setErrorMessage(false), 3000);
      return;
    }
    setLoading(true); // Start loading

    try {
      const response = await axios.post(
        `${backendUrl}/certifications/create-certifications`,
        certificationsData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setCertifications([...certifications, response.data]);
      closeModal();
      setshowMessage("Certifications created successfully!");
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Error creating certifications:", error);
      if (error.response) {
        setshowMessage(error.response.data.msg);
        setErrorMessage(true);
        setTimeout(() => setErrorMessage(false), 3000);
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const filteredCertifications = certifications.filter((certifications) =>
    certifications.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort certifications based on selected criteria
  const sortedCertifications = filteredCertifications.sort((a, b) => {
    if (sortCriteria === "Name (A-Z)") {
      return a.name.localeCompare(b.name);
    } else if (sortCriteria === "Name (Z-A)") {
      return b.name.localeCompare(a.name);
    } else if (sortCriteria === "Most Recent") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortCriteria === "Oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
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
        <h1 className="text-2xl font-medium text-gray-700">Certifications</h1>
      </div>

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search Certifications"
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
          <option>Most Recent</option>
          <option>Oldest</option>
        </select>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-lg">My Listed Certifications</div>
        <button
          className="btn btn-sm w-36 bg-green text-white relative"
          onClick={openAddModal}
        >
          + Add Certification
        </button>
      </div>

      <hr className="mb-6 border-black" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCertifications.map((certifications) => (
          <div
            key={certifications._id}
            className="relative mb-4 p-4 border border-black rounded-lg flex flex-col hover:bg-gray-200 transition-colors cursor-pointer"
            onClick={() => openViewModal(certifications)}
          >
            <img
              src={`${backendUrl}${certifications.image}`}
              alt={certifications.name}
              className="w-full h-48 object-cover rounded-t-lg mb-4 mt-4"
            />
            <div className="absolute top-2 right-2 flex space-x-2">
              <div
                className="w-8 h-8 rounded-full bg-[#BE142E] flex justify-center items-center cursor-pointer relative group"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCertifications(certifications);
                  setIsDeleteModalOpen(true);
                }}
              >
                <span className="hidden group-hover:block absolute bottom-10 bg-gray-700 text-white text-xs rounded px-2 py-1">
                  Delete
                </span>
                <i className="fas fa-trash text-white"></i>{" "}
                {/* Icon for Delete */}
              </div>
              <div
                className="w-8 h-8 rounded-full bg-[#3D3C3C] flex justify-center items-center cursor-pointer relative group"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(certifications);
                }}
              >
                <span className="hidden group-hover:block absolute bottom-10 bg-gray-700 text-white text-xs rounded px-2 py-1">
                  Edit
                </span>
                <i className="fas fa-edit text-white"></i> {/* Icon for Edit */}
              </div>
            </div>
            <div>
              <div className="text-md font-medium mb-1">
                {certifications.name}
              </div>
              <div className="text-sm text-black-600">
                {certifications.address}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedCertifications && (
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
            <div className="text-2xl font-medium mb-2">
              {selectedCertifications.name}
            </div>
            <div className="text-md mb-2">{selectedCertifications.address}</div>
            <img
              src={`${backendUrl}${selectedCertifications.image}`}
              alt={selectedCertifications.name}
              className="mb-4 w-full h-48 md:h-64 lg:h-80 object-cover rounded"
            />
            <div className="text-sm mb-4">
              {selectedCertifications.description}
            </div>
            {/* Conditionally render Website or Contact Details */}
            {selectedCertifications.contact && (
              <div className="text-sm font-medium mb-2">
                Website or Contact Details
                <a
                  href={
                    selectedCertifications.contact.includes("@") // Check if it's an email
                      ? `mailto:${selectedCertifications.contact}`
                      : selectedCertifications.contact.startsWith("http") // Check if it's a website URL
                      ? selectedCertifications.contact
                      : selectedCertifications.contact.startsWith("+") // Check if it's a phone number (with international code)
                      ? `tel:${selectedCertifications.contact}`
                      : "#"
                  }
                  className="mt-2 block text-sm text-blue-600 underline font-normal"
                  target="_blank" // This ensures the link opens in a new tab
                  rel="noopener noreferrer" // Recommended for security reasons when using target="_blank"
                >
                  {selectedCertifications.contact}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedCertifications && (
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
            {loading && <LoadingSpinner />} {/* Show loading spinner */}
            <button
              className="absolute top-4 right-4 text-black text-2xl"
              onClick={closeModal}
            >
              &times;
            </button>
            <div className="text-xl mb-3">Edit Certifications</div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Certifications Name</label>
              <input
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Certifications Name"
                value={selectedCertifications.name}
                onChange={(e) =>
                  setSelectedCertifications({
                    ...selectedCertifications,
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
                value={selectedCertifications.address}
                onChange={(e) =>
                  setSelectedCertifications({
                    ...selectedCertifications,
                    address: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">
                Certification Image{" "}
                <span className="text-xs font-light italic">
                  (Allowed formats: JPG, JPEG, PNG, Max size: 5MB)
                </span>
              </label>
              <input
                id="certifications-image"
                type="file"
                accept="image/*"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Description</label>
              <textarea
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                value={selectedCertifications.description}
                onChange={(e) =>
                  setSelectedCertifications({
                    ...selectedCertifications,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">
                Website or Contact Details
              </label>
              <input
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                value={selectedCertifications.contact}
                onChange={(e) =>
                  setSelectedCertifications({
                    ...selectedCertifications,
                    contact: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <button
                className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-[#3D3C3C] text-white px-4 py-2 md:px-6 md:py-3"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCertifications}
                className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-green text-white px-4 py-2 md:px-6 md:py-3"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            ref={modalRef}
            className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-64 sm:w-96"
          >
            <h2 className="text-2xl mb-4">Delete Certifications</h2>
            <p>Are you sure you want to delete this certifications?</p>
            <div className="flex justify-end mt-4">
              <button
                className="btn btn-sm w-24 bg-red text-white mr-2"
                onClick={() => {
                  handleDeleteCertifications(); // Call the delete function
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
            {loading && <LoadingSpinner />} {/* Show loading spinner */}
            <button
              className="absolute top-4 right-4 text-black text-2xl"
              onClick={closeModal}
            >
              &times;
            </button>
            <div className="text-xl mb-3">Add New Certification</div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Certification Name</label>
              <input
                id="certifications-name"
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter Certification Name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Address</label>
              <input
                id="certifications-address"
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter Certification Address"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">
                Certification Image{" "}
                <span className="text-xs font-light italic">
                  (Allowed formats: JPG, JPEG, PNG, Max size: 5MB)
                </span>
              </label>
              <input
                id="certifications-image"
                type="file"
                accept="image/*"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Description</label>
              <textarea
                id="certifications-description"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter Certification Description"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">
                Website or Contact Details
              </label>
              <input
                id="certifications-contact"
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter Certification Details"
              />
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
                onClick={handleCreateCertifications}
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

export default AdminCertifications;
