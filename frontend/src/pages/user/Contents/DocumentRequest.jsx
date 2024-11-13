import React, { useState, useEffect, useRef } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import { Worker, Viewer } from "@react-pdf-viewer/core"; // Import Viewer
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.js";
import "../../../App.css";

function Documents() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [selectedDocument, setSelectedDocument] = useState(null);
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

  const openViewModal = (document) => {
    setSelectedDocument(document);
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setSelectedDocument(null);
  };

  const filteredDocuments = documents.filter((document) =>
    document.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort documents based on selected criteria
  const sortedDocuments = filteredDocuments.sort((a, b) => {
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

  const downloadDocument = async (imagePath) => {
    if (!imagePath) {
      console.error("Error: No image path provided for download.");
      return;
    }

    try {
      const filename = imagePath.split("/").pop();
      const downloadUrl = `${backendUrl}/documents/download/${filename}`;
      console.log("Download URL:", downloadUrl);

      const response = await axios.get(downloadUrl, {
        responseType: "blob",
        withCredentials: true,
      });

      if (response.status === 200) {
        const blob = new Blob([response.data]);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename; // Use the filename from the URL
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      } else {
        console.error("Download failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error downloading the document:", error);
    }
  };

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
      <h1 className="text-2xl font-medium text-gray-700 mb-6">Documents</h1>

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
          onChange={(e) => setSortCriteria(e.target.value)}
        >
          <option>Name (A-Z)</option>
          <option>Name (Z-A)</option>
          <option>Most Recent</option>
          <option>Oldest</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedDocuments.map((document) => (
          <div
            key={document._id}
            className="bg-white p-4 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => openViewModal(document)}
          >
            {document.image ? (
              document.image.endsWith(".pdf") ? (
                <div className="flex justify-center items-center text-center text-xl md:px-0 lg:px-0 px-12 xl:px-0 2xl:px-12">
  <Worker workerUrl={pdfWorker}>
    <div className="w-full h-48 mb-4 overflow-hidden object-cover">
      <Viewer
        fileUrl={`${backendUrl}${document.image}`}
        initialPage={0}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover", // Ensures the content fills the space
        }}
      />
    </div>
  </Worker>
</div>

                
              ) : (
                <img
                  src={`${backendUrl}${document.image}`}
                  alt={document.name}
                  className="w-full h-48 object-cover rounded-t-lg mb-4"
                />
              )
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-t-lg mb-4">
                <span className="text-gray-500">No Image Available</span>
              </div>
            )}
            <div className="text-md font-semibold text-gray-800 mb-2 overflow-hidden text-ellipsis whitespace-nowrap">
              {document.name}
            </div>
            <p className="text-sm text-gray-600 mb-4 overflow-hidden text-ellipsis">
              {document.description.slice(0, 100)}...
            </p>
            <a
              href="#"
              style={{ color: "#be142e" }}
              className="text-sm font-medium hover:underline"
            >
              Read More
            </a>
          </div>
        ))}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedDocument && (
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
              {selectedDocument.name}
            </div>
            <div className="text-md mb-2">{selectedDocument.address}</div>
            {selectedDocument && selectedDocument.image ? (
              selectedDocument.image.endsWith(".pdf") ? (
                <div className="px-10">
                  <Worker workerUrl={pdfWorker}>
                  <div className="w-full h-[40vh] overflow-auto mb-4 flex items-center justify-center px-">
                    <Viewer
                      fileUrl={`${backendUrl}${selectedDocument.image}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  </div>
                </Worker>
                </div>
                
              ) : (
                <img
                  src={`${backendUrl}${selectedDocument.image}`}
                  alt={selectedDocument.name}
                  className="mb-4 w-full h-64 object-cover rounded"
                />
              )
            ) : (
              <div className="mb-4 w-full h-64 bg-gray-200 flex items-center justify-center rounded">
                <span className="text-gray-500">No Image Available</span>
              </div>
            )}
            <div className="text-sm mb-4">{selectedDocument.description}</div>
            <div className="text-sm font-medium mb-2">Contact Details</div>
            <a
              href={`mailto:${selectedDocument.contact}`}
              className="block text-sm text-blue-600 underline"
            >
              {selectedDocument.contact}
            </a>
            {/* Download button */}
            <button
              onClick={() =>
                selectedDocument.image &&
                downloadDocument(selectedDocument.image)
              }
              className="mt-4 block text-sm text-red underline"
            >
              Download Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documents;
