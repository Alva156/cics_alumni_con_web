import React, { useState, useEffect, useRef } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";

function AdminCompanies() {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState([]);
  const [sortCriteria, setSortCriteria] = useState("Name (A-Z)");
  const modalRef = useRef(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch all companies from the server
  const fetchCompanies = async () => {
    try {
      const response = await axios.get("http://localhost:6001/companies/view", {
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
        `http://localhost:6001/companies/delete-companies/${selectedCompany._id}`,
        { withCredentials: true }
      );

      console.log("Delete response:", response.data); // Debugging line
      fetchCompanies(); // Refresh company list
      closeModal(); // Close modal after deleting
    } catch (error) {
      console.error(
        "Error deleting company:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleUpdateCompany = async () => {
    if (!selectedCompany) return;

    try {
      const response = await axios.put(
        `http://localhost:6001/companies/update-companies/${selectedCompany._id}`,
        {
          name: selectedCompany.name,
          address: selectedCompany.address,
          image: selectedCompany.image,
          description: selectedCompany.description,
          contact: selectedCompany.contact,
        },
        { withCredentials: true }
      );

      setCompanies((prevCompanies) =>
        prevCompanies.map((company) =>
          company._id === selectedCompany._id ? response.data : company
        )
      );

      closeModal(); // Close modal after updating
    } catch (error) {
      console.error("Error updating company:", error);
    }
  };

  const handleCreateCompany = async () => {
    const companyData = {
      name: document.getElementById("company-name").value,
      address: document.getElementById("company-address").value,
      image: "", // Handle image upload separately
      description: document.getElementById("company-description").value,
      contact: document.getElementById("company-contact").value,
    };

    try {
      const response = await axios.post(
        "http://localhost:6001/companies/create-companies",
        companyData,
        {
          withCredentials: true,
        }
      );

      setCompanies([...companies, response.data]); // Update companies list
      setSelectedCompany(null); // Clear selected company
      setIsAddModalOpen(false); // Close the modal
      // Optionally reset input fields if necessary
      document.getElementById("company-name").value = "";
      document.getElementById("company-address").value = "";
      document.getElementById("company-description").value = "";
      document.getElementById("company-contact").value = "";
    } catch (error) {
      console.error("Error creating company:", error);
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
      <h1 className="text-xl mb-4">Companies</h1>

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

      {filteredCompanies.map((company) => (
        <div
          key={company._id}
          className="mb-4 p-4 border border-black rounded-lg flex justify-between items-center hover:bg-gray-200 transition-colors cursor-pointer"
          onClick={() => openViewModal(company)}
        >
          <div>
            <div className="text-md font-medium mb-1">{company.name}</div>
            <div className="text-sm text-black-600">{company.address}</div>
          </div>
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-full bg-[#BE142E] flex justify-center items-center cursor-pointer mr-4 relative group"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCompany(company); // Set the company to delete
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
                openEditModal(company);
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
              src={selectedCompany.image}
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
            <div className="flex flex-col md:flex-row justify-center gap-4 mb-4">
              <button
                className="btn bg-zinc-800 text-white w-full md:w-64 py-2 rounded-lg"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCompany}
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
            <div className="flex flex-col md:flex-row justify-center gap-4 mb-4">
              <button
                className="btn bg-zinc-800 text-white w-full md:w-64 py-2 rounded-lg"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="btn bg-green text-white w-full md:w-64 py-2 rounded-lg"
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
