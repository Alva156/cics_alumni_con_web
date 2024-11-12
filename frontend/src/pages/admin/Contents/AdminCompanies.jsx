import React, { useState, useEffect, useRef } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";

function AdminCompanies() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState([]);
  const [sortCriteria, setSortCriteria] = useState("Name (A-Z)");
  const modalRef = useRef(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showSuccessMessage, setSuccessMessage] = useState(false);
  const [showErrorMessage, setErrorMessage] = useState(false);
  const [showMessage, setshowMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-8 border-red border-solid border-opacity-75"></div>
    </div>
  );

  // Fetch all companies from the server
  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${backendUrl}/companies/view`, {
        withCredentials: true,
      });
      setCompanies(response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const openViewModal = (company) => {
    setSelectedCompany(company);
    setIsViewModalOpen(true);
  };

  const openEditModal = (company) => {
    setSelectedCompany(company);
    setIsEditModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedCompany(null);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setSelectedCompany(null);
  };

  const handleDeleteCompany = async () => {
    if (!selectedCompany) {
      console.log("No company selected for deletion.");
      return;
    }

    console.log("Deleting company with ID:", selectedCompany._id); // Debugging line

    try {
      const response = await axios.delete(
        `${backendUrl}/companies/delete-companies/${selectedCompany._id}`,
        { withCredentials: true }
      );

      console.log("Delete response:", response.data); // Debugging line
      fetchCompanies(); // Refresh company list
      closeModal(); // Close modal after deleting
      setshowMessage("Company deleted successfully!");
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Error deleting company:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleUpdateCompany = async () => {
    if (!selectedCompany) return;

    if (
      !selectedCompany.name ||
      !selectedCompany.address ||
      !selectedCompany.description ||
      !selectedCompany.contact
    ) {
      setshowMessage("Please fill in all required fields.");
      setErrorMessage(true);
      setTimeout(() => setErrorMessage(false), 3000);
      return;
    }

    const companyData = new FormData();
    companyData.append("name", selectedCompany.name);
    companyData.append("address", selectedCompany.address);
    companyData.append("description", selectedCompany.description);
    companyData.append("contact", selectedCompany.contact);

    const image = document.getElementById("company-image").files[0];
    if (image) {
      companyData.append("image", image);
    }
    setLoading(true); // Start loading

    try {
      const response = await axios.put(
        `${backendUrl}/companies/update-companies/${selectedCompany._id}`,
        companyData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setCompanies((prevCompanies) =>
        prevCompanies.map((company) =>
          company._id === selectedCompany._id ? response.data : company
        )
      );

      closeModal();
      setshowMessage("Company updated successfully!");
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating company:", error);
      if (error.response) {
        setshowMessage(error.response.data.msg); // Display error message from backend
        setErrorMessage(true);
        setTimeout(() => setErrorMessage(false), 3000);
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };
  const handleCreateCompany = async () => {
    const companyData = new FormData();
    companyData.append("name", document.getElementById("company-name").value);
    companyData.append(
      "address",
      document.getElementById("company-address").value
    );
    companyData.append(
      "description",
      document.getElementById("company-description").value
    );
    companyData.append(
      "contact",
      document.getElementById("company-contact").value
    );
    const image = document.getElementById("company-image").files[0];
    if (image) {
      companyData.append("image", image); // Add the image to formData
    }

    if (
      !companyData.get("name") ||
      !companyData.get("address") ||
      !companyData.get("description") ||
      !companyData.get("contact")
    ) {
      setshowMessage("Please fill in all required fields.");
      setErrorMessage(true);
      setTimeout(() => setErrorMessage(false), 3000);
      return;
    }
    setLoading(true); // Start loading

    try {
      const response = await axios.post(
        `${backendUrl}/companies/create-companies`,
        companyData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setCompanies([...companies, response.data]);
      closeModal();
      setshowMessage("Company created successfully!");
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Error creating company:", error);
      // Display error message to the user
      if (error.response) {
        setshowMessage(error.response.data.msg);
        setErrorMessage(true);
        setTimeout(() => setErrorMessage(false), 3000);
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort companies based on selected criteria
  const sortedCompanies = filteredCompanies.sort((a, b) => {
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
        <h1 className="text-2xl font-medium text-gray-700">Companies</h1>
      </div>

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search Company"
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
        <div className="text-lg">My Listed Companies</div>
        <button
          className="btn btn-sm w-36 bg-green text-white relative"
          onClick={openAddModal}
        >
          +
        </button>
      </div>
      <hr className="mb-6 border-black" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <div
            key={company._id}
            className="relative mb-4 p-4 border border-black rounded-lg flex flex-col hover:bg-gray-200 transition-colors cursor-pointer"
            onClick={() => openViewModal(company)}
          >
            <img
              src={`${backendUrl}${company.image}`}
              alt={company.name}
              className="w-full h-48 object-cover rounded-t-lg mb-4 mt-4"
            />
            <div className="absolute top-2 right-2 flex space-x-2">
              <div
                className="w-8 h-8 rounded-full bg-[#BE142E] flex justify-center items-center cursor-pointer relative group"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCompany(company);
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
                  openEditModal(company);
                }}
              >
                <span className="hidden group-hover:block absolute bottom-10 bg-gray-700 text-white text-xs rounded px-2 py-1">
                  Edit
                </span>
                <i className="fas fa-edit text-white"></i> {/* Icon for Edit */}
              </div>
            </div>
            <div>
              <div className="text-md font-medium mb-1">{company.name}</div>
              <div className="text-sm text-black-600">{company.address}</div>
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedCompany && (
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
              {selectedCompany.name}
            </div>
            <div className="text-md mb-2">{selectedCompany.address}</div>
            <img
              src={`${backendUrl}${selectedCompany.image}`}
              alt={selectedCompany.name}
              className="mb-4 w-full h-48 md:h-64 lg:h-80 object-cover rounded"
            />
            <div className="text-sm mb-4">{selectedCompany.description}</div>
            <div className="text-sm font-medium mb-2">Contact Details</div>
            <a
              href={`mailto:${selectedCompany.contact}`}
              className="block text-sm text-blue-600 underline"
            >
              {selectedCompany.contact}
            </a>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {isEditModalOpen && selectedCompany && (
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
            <div className="text-xl mb-3">Edit Company</div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Company Name</label>
              <input
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Company Name"
                value={selectedCompany.name}
                onChange={(e) =>
                  setSelectedCompany({
                    ...selectedCompany,
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
                value={selectedCompany.address}
                onChange={(e) =>
                  setSelectedCompany({
                    ...selectedCompany,
                    address: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Company Image</label>
              <input
                id="company-image" // Add this line
                type="file"
                accept="image/*"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Description</label>
              <textarea
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                value={selectedCompany.description}
                onChange={(e) =>
                  setSelectedCompany({
                    ...selectedCompany,
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
                value={selectedCompany.contact}
                onChange={(e) =>
                  setSelectedCompany({
                    ...selectedCompany,
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
                onClick={handleUpdateCompany}
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
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-64 sm:w-96">
            <h2 className="text-2xl mb-4">Delete Company</h2>
            <p>Are you sure you want to delete this company?</p>
            <div className="flex justify-end mt-4">
              <button
                className="btn btn-sm w-24 bg-red text-white mr-2"
                onClick={() => {
                  handleDeleteCompany(); // Call the delete function
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
            <div className="text-xl mb-3">Add New Company</div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Company Name</label>
              <input
                id="company-name"
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter Company Name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Address</label>
              <input
                id="company-address"
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter Company Address"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Company Image</label>
              <input
                id="company-image" // Add this line
                type="file"
                accept="image/*"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Description</label>
              <textarea
                id="company-description"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter Company Description"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Contact Details</label>
              <input
                id="company-contact"
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter Company Details"
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
                onClick={handleCreateCompany}
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

export default AdminCompanies;
