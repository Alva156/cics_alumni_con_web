import React, { useState, useEffect, useRef } from "react";
import ReactPaginate from "react-paginate";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";

function Certifications() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [selectedCertification, setSelectedCertification] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [certifications, setCertifications] = useState([]);
  const [sortCriteria, setSortCriteria] = useState("Most Recent");
  const modalRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
    
  const itemsPerPage = 6;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (isViewModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isViewModalOpen]);

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

  const openViewModal = (certification) => {
    setSelectedCertification(certification);
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setSelectedCertification(null);
  };

  const filteredCertifications = certifications.filter((certification) =>
    certification.name.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };
  
  // Paginate the sortedCertifications list
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCertifications = sortedCertifications.slice(startIndex, endIndex);

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
      <h1 className="text-2xl font-medium text-gray-700 mb-6">
        Certifications
      </h1>

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
          onChange={(e) => setSortCriteria(e.target.value)}
        >
          <option>Name (A-Z)</option>
          <option>Name (Z-A)</option>
          <option>Most Recent</option>
          <option>Oldest</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {paginatedCertifications.length > 0 ? (
    paginatedCertifications.map((certification) => (
      <div
        key={certification._id}
        className="bg-white p-4 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => openViewModal(certification)}
      >
        <img
          src={`${backendUrl}${certification.image}`}
          alt={certification.name}
          className="w-full h-48 object-cover rounded-t-lg mb-4"
        />
        <div className="text-md font-semibold text-gray-800 mb-2 overflow-hidden text-ellipsis whitespace-nowrap">
          {certification.name}
        </div>
        <p className="text-sm text-gray-600 mb-4 overflow-hidden text-ellipsis">
          {certification.description.slice(0, 100)}...
        </p>
        <a
          href="#"
          style={{ color: "#be142e" }}
          className="text-sm font-medium hover:underline"
        >
          Read More
        </a>
      </div>
    ))
  ) : (
    <p>No certifications found.</p>
  )}
</div>


      <ReactPaginate
  previousLabel={<button className="w-full h-full">Previous</button>}
  nextLabel={<button className="w-full h-full">Next</button>}
  breakLabel={<button className="w-full h-full">...</button>}
  pageCount={Math.ceil(sortedCertifications.length / itemsPerPage)} // Total pages
  marginPagesDisplayed={2}
  pageRangeDisplayed={5}
  onPageChange={handlePageChange}
  containerClassName={"flex justify-center items-center space-x-2 mt-6"}
  pageClassName={
    "w-10 h-10 flex items-center justify-center border border-black rounded bg-white cursor-pointer hover:bg-gray-200 transition"
  }
  pageLinkClassName={"w-full h-full flex items-center justify-center"}
  previousClassName={
    "w-24 h-10 flex items-center justify-center border border-black rounded bg-white cursor-pointer hover:bg-gray-200 transition"
  }
  previousLinkClassName={"w-full h-full flex items-center justify-center"}
  nextClassName={
    "w-24 h-10 flex items-center justify-center border border-black rounded bg-white cursor-pointer hover:bg-gray-200 transition"
  }
  nextLinkClassName={"w-full h-full flex items-center justify-center"}
  breakClassName={
    "w-10 h-10 flex items-center justify-center border border-black bg-white cursor-default"
  }
  breakLinkClassName={"w-full h-full flex items-center justify-center"}
  activeClassName={"bg-black text-red font-medium"}
  disabledClassName={"opacity-50 cursor-not-allowed"}
/>


      {/* View Modal */}
      {isViewModalOpen && selectedCertification && (
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
              {selectedCertification.name}
            </div>
            <div className="text-md mb-2">{selectedCertification.address}</div>
            <img
              src={`${backendUrl}${selectedCertification.image}`}
              alt={selectedCertification.name}
              className="mb-4 w-full h-48 md:h-64 lg:h-80 object-cover rounded"
            />
            <div className="text-sm mb-4">
              {selectedCertification.description}
            </div>

            {/* Conditionally render Website or Contact Details */}
            {selectedCertification.contact && (
              <div className="text-sm font-medium mb-2">
                Website or Contact Details
                <a
                  href={
                    selectedCertification.contact.includes("@") // Check if it's an email
                      ? `mailto:${selectedCertification.contact}`
                      : selectedCertification.contact.startsWith("http") // Check if it's a website URL
                      ? selectedCertification.contact
                      : selectedCertification.contact.startsWith("+") // Check if it's a phone number (with international code)
                      ? `tel:${selectedCertification.contact}`
                      : "#"
                  }
                  className="mt-2 block text-sm text-blue-600 underline font-normal"
                  target="_blank" // This ensures the link opens in a new tab
                  rel="noopener noreferrer" // Recommended for security reasons when using target="_blank"
                >
                  {selectedCertification.contact}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Certifications;
