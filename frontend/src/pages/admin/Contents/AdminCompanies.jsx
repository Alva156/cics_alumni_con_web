import React, { useState, useEffect, useRef } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

function AdminCompanies() {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const modalRef = useRef(null);

  const companies = [
    {
      name: "Company Name",
      address: "Address",
      image: "",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      contact: "Contact Details",
    },
    {
      name: "Company Name",
      address: "Address",
      image: "",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      contact: "Contact Details",
    },
    {
      name: "Company Name",
      address: "Address",
      image: "",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      contact: "Contact Details",
    },
  ];

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (isViewModalOpen || isEditModalOpen || isAddModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isViewModalOpen, isEditModalOpen, isAddModalOpen]);

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <select className="ml-2 border border-black rounded px-3 py-1 text-sm">
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

      {filteredCompanies.map((company, index) => (
        <div
          key={index}
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
                console.log("Delete action");
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
            <div className="text-sm font-medium mb-2">
              {selectedCompany.contact}
            </div>
            <a
              href={`mailto:company@gmail.com`}
              className="block text-sm text-blue-600 underline"
            >
              company@gmail.com
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
                defaultValue={selectedCompany.name}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Address</label>
              <input
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                defaultValue={selectedCompany.address}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Company Image</label>
              <div className="relative w-full border border-black bg-gray-100 rounded-lg px-4 py-2 text-sm">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Attach file...</span>
                  <i className="fas fa-paperclip text-gray-500"></i>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Company Description</label>
              <textarea
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                defaultValue={selectedCompany.description}
                rows="7"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">Contact Details</label>
              <input
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm mb-4"
                defaultValue={selectedCompany.contact}
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
                onClick={() => {
                  console.log("Save action");
                  closeModal();
                }}
              >
                Save
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
            <div className="text-xl mb-3">Add Company</div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Company Name</label>
              <input
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter company name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Address</label>
              <input
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter company address"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Company Image</label>
              <div className="relative w-full border border-black bg-gray-100 rounded-lg px-4 py-2 text-sm">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Attach file...</span>
                  <i className="fas fa-paperclip text-gray-500"></i>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Company Description</label>
              <textarea
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter company description"
                rows="7"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">Contact Details</label>
              <input
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm mb-4"
                placeholder="Enter contact details"
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
                onClick={() => {
                  console.log("Add action");
                  closeModal();
                }}
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
