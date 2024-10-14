import React, { useState, useEffect, useRef } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";

function Documents() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [selectedDocuments, setSelectedDocuments] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState([]);
  const [sortCriteria, setSortCriteria] = useState("Name (A-Z)");
  const modalRef = useRef(null);

  // Fetch all documents from the server
  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${backendUrl}/documents/view`, {
        withCredentials: true,
      });
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const openViewModal = (documents) => {
    setSelectedDocuments(documents);
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setSelectedDocuments(null);
  };

  const filteredDocuments = documents.filter((documents) =>
    documents.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort documents based on selected criteria
  const sortedDocuments = filteredDocuments.sort((a, b) => {
    if (sortCriteria === "Name (A-Z)") {
      return a.name.localeCompare(b.name);
    } else if (sortCriteria === "Name (Z-A)") {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
      <h1 className="text-xl mb-4">Documents</h1>

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search Documents"
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
        <div className="text-lg">Documents Lists</div>
      </div>

      <hr className="mb-6 border-black" />

      {filteredDocuments.map((documents) => (
        <div
          key={documents._id}
          className="mb-4 p-4 border border-black rounded-lg flex justify-between items-center hover:bg-gray-200 transition-colors cursor-pointer"
          onClick={() => openViewModal(documents)}
        >
          <div>
            <div className="text-md font-medium mb-1">{documents.name}</div>
            <div className="text-sm text-black-600">{documents.address}</div>
          </div>
        </div>
      ))}

      {/* View Modal */}
      {isViewModalOpen && selectedDocuments && (
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
              {selectedDocuments.name}
            </div>
            <div className="text-md mb-2">{selectedDocuments.address}</div>
            <img
              src={selectedDocuments.image}
              alt={selectedDocuments.name}
              className="mb-4 w-full h-48 md:h-64 lg:h-80 object-cover rounded"
            />
            <div className="text-sm mb-4">{selectedDocuments.description}</div>
            <div className="text-sm font-medium mb-2">Contact Details</div>
            <a
              href={`mailto:${selectedDocuments.contact}`}
              className="block text-sm text-blue-600 underline"
            >
              {selectedDocuments.contact}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documents;
