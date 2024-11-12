import React, { useState, useEffect, useRef } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";

function Companies() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState([]);
  const [sortCriteria, setSortCriteria] = useState("Name (A-Z)");
  const modalRef = useRef(null);

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

  const closeModal = () => {
    setIsViewModalOpen(false);
    setSelectedCompany(null);
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
      <h1 className="text-2xl font-medium text-gray-700 mb-6">Companies</h1>

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
          onChange={(e) => setSortCriteria(e.target.value)}
        >
          <option>Name (A-Z)</option>
          <option>Name (Z-A)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCompanies.map((company) => (
          <div
            key={company._id}
            className="bg-white p-4 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => openViewModal(company)}
          >
            <img
              src={`${backendUrl}${company.image}`}
              alt={company.name}
              className="w-full h-48 object-cover rounded-t-lg mb-4"
            />
            <div className="text-md font-semibold text-gray-800 mb-2 overflow-hidden text-ellipsis whitespace-nowrap">
              {company.name}
            </div>
            <p className="text-sm text-gray-600 mb-4 overflow-hidden text-ellipsis">
              {company.description.slice(0, 100)}...
            </p>
            <a
              href="#"
              className="text-blue-500 text-sm font-medium hover:underline"
            >
              Read More
            </a>
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
            <div className="text-2xl font-medium mb-2">{selectedCompany.name}</div>
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
    </div>
  );
}

export default Companies;
