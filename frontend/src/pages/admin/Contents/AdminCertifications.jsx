import React, { useState, useEffect, useRef } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";

function AdminCertifications() {
  const [selectedCertifications, setSelectedCertifications] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [certifications, setCertifications] = useState([]);
  const [sortCriteria, setSortCriteria] = useState("Name (A-Z)");
  const modalRef = useRef(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showSuccessMessage, setSuccessMessage] = useState(false);
  const [showErrorMessage, setErrorMessage] = useState(false);
  const [showMessage, setshowMessage] = useState("");

  // Fetch all certifications from the server
  const fetchCertifications = async () => {
    try {
      const response = await axios.get("http://localhost:6001/certifications/view", {
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
        `http://localhost:6001/certifications/delete-certifications/${selectedCertifications._id}`,
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
      !selectedCertifications.description ||
      !selectedCertifications.contact
    ) {
      setshowMessage("Please fill in all required fields.");
      setErrorMessage(true);
      setTimeout(() => setErrorMessage(false), 3000);
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:6001/certifications/update-certifications/${selectedCertifications._id}`,
        {
          name: selectedCertifications.name,
          address: selectedCertifications.address,
          image: selectedCertifications.image,
          description: selectedCertifications.description,
          contact: selectedCertifications.contact,
        },
        { withCredentials: true }
      );

      setCertifications((prevCertifications) =>
        prevCertifications.map((certifications) =>
          certifications._id === selectedCertifications._id ? response.data : certifications
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
    }
  };

  const handleCreateCertifications = async () => {
    const certificationsData = {
      name: document.getElementById("certifications-name").value,
      address: document.getElementById("certifications-address").value,
      image: "", // Handle image upload separately
      description: document.getElementById("certifications-description").value,
      contact: document.getElementById("certifications-contact").value,
    };
    if (
      !certificationsData.name ||
      !certificationsData.address ||
      !certificationsData.description ||
      !certificationsData.contact
    ) {
      setshowMessage("Please fill in all required fields.");
      setErrorMessage(true); // Ensure to set this to true
      setTimeout(() => setErrorMessage(false), 3000);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:6001/certifications/create-certifications",
        certificationsData,
        {
          withCredentials: true,
        }
      );

      setCertifications([...certifications, response.data]); // Update certifications list
      setSelectedCertifications(null); // Clear selected certifications
      setIsAddModalOpen(false); // Close the modal
      setshowMessage("Certifications created successfully!");
      setSuccessMessage(true);
      // Optionally reset input fields if necessary
      document.getElementById("certifications-name").value = "";
      document.getElementById("certifications-address").value = "";
      document.getElementById("certifications-description").value = "";
      document.getElementById("certifications-contact").value = "";
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Error creating certifications:", error);
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
        </select>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-lg">My Listed Certifications</div>
        <button
          className="btn btn-sm w-36 bg-green text-white relative"
          onClick={openAddModal}
        >
          +
        </button>
      </div>

      <hr className="mb-6 border-black" />

      {filteredCertifications.map((certifications) => (
        <div
          key={certifications._id}
          className="mb-4 p-4 border border-black rounded-lg flex justify-between items-center hover:bg-gray-200 transition-colors cursor-pointer"
          onClick={() => openViewModal(certifications)}
        >
          <div>
            <div className="text-md font-medium mb-1">{certifications.name}</div>
            <div className="text-sm text-black-600">{certifications.address}</div>
          </div>
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-full bg-[#BE142E] flex justify-center items-center cursor-pointer mr-4 relative group"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCertifications(certifications); // Set the certifications to delete
                setIsDeleteModalOpen(true); // Open the delete modal
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
                openEditModal(certifications);
              }}
            >
              <span className="hidden group-hover:block absolute bottom-8 bg-gray-700 text-white text-xs rounded px-2 py-1">
                Edit
              </span>
            </div>
          </div>
        </div>
      ))}

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
              src={selectedCertifications.image}
              alt={selectedCertifications.name}
              className="mb-4 w-full h-48 md:h-64 lg:h-80 object-cover rounded"
            />
            <div className="text-sm mb-4">{selectedCertifications.description}</div>
            <div className="text-sm font-medium mb-2">Contact Details</div>
            <a
              href={`mailto:${selectedCertifications.contact}`}
              className="block text-sm text-blue-600 underline"
            >
              {selectedCertifications.contact}
            </a>
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
              <label className="block text-sm mb-1">Certifications Image</label>
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
              <label className="block text-sm mb-1">Contact</label>
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
            <div className="flex flex-col md:flex-row justify-center gap-4 mb-4">
              <button
                className="btn bg-zinc-800 text-white w-full md:w-64 py-2 rounded-lg"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCertifications}
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
            <button
              className="absolute top-4 right-4 text-black text-2xl"
              onClick={closeModal}
            >
              &times;
            </button>
            <div className="text-xl mb-3">Add New Certifications</div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Certifications Name</label>
              <input
                id="certifications-name"
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter Certifications Name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Address</label>
              <input
                id="certifications-address"
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter Certifications Address"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Certifications Image</label>
              <input
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
                placeholder="Enter Certifications Description"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Contact Details</label>
              <input
                id="certifications-contact"
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter Certifications Details"
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
