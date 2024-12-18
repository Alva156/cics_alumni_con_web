import React, { useState, useEffect, useRef } from "react";
import ReactPaginate from "react-paginate";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import { Worker, Viewer } from "@react-pdf-viewer/core"; // Import Viewer
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.js";
import "../../../App.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { themePlugin } from "@react-pdf-viewer/theme";
import { DarkIcon, LightIcon } from "@react-pdf-viewer/theme";
import { fullScreenPlugin } from "@react-pdf-viewer/full-screen";
import { SpecialZoomLevel } from "@react-pdf-viewer/core";
import {
  ExitFullScreenIcon,
  FullScreenIcon,
} from "@react-pdf-viewer/full-screen";

// Import styles
import "@react-pdf-viewer/full-screen/lib/styles/index.css";

function Documents() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState([]);
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

  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  // Paginate the sortedDocuments list
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = sortedDocuments.slice(startIndex, endIndex);

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

  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const themePluginInstance = themePlugin();
  const darkIcon = DarkIcon();
  const fullScreenPluginInstance = fullScreenPlugin();

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
      <h1 className="text-2xl font-medium text-gray-700 mb-6">
        Document Request Steps
      </h1>

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
        {paginatedDocuments.length > 0 ? (
          paginatedDocuments.map((document) => (
            <div
              key={document._id}
              className="bg-white p-4 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => openViewModal(document)}
            >
              {document.image ? (
                document.image.endsWith(".pdf") ? (
                  <div className="overflow-y-hidden object-contain">
                    <Worker workerUrl={pdfWorker}>
                      <div className="w-full max-h-48 overflow-hidden mb-4">
                        <Viewer
                          fileUrl={`${backendUrl}${document.image}`}
                          renderTextLayer={false}
                          initialPage={0} // Show the first page only in the preview
                          style={{
                            height: "100%",
                            width: "100%",
                            objectFit: "contain", // Ensures the PDF fits without stretching
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
          ))
        ) : (
          <p>No documents found.</p>
        )}
      </div>

      <ReactPaginate
        previousLabel={<button className="w-full h-full">Previous</button>}
        nextLabel={<button className="w-full h-full">Next</button>}
        breakLabel={<button className="w-full h-full">...</button>}
        pageCount={Math.ceil(sortedDocuments.length / itemsPerPage)} // Total number of pages
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
                <Worker workerUrl={pdfWorker}>
                  <div className="w-full h-[40vh] overflow-auto mb-4 flex items-center justify-center px-">
                    <Viewer
                      fileUrl={`${backendUrl}${selectedDocument.image}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      plugins={[fullScreenPluginInstance]}
                    />
                  </div>
                </Worker>
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

            {/* Conditionally render Website or Contact Details */}
            {selectedDocument.contact && (
              <div className="text-sm font-medium mb-2">
                Website or Contact Details
                <a
                  href={
                    selectedDocument.contact.includes("@") // Check if it's an email
                      ? `mailto:${selectedDocument.contact}`
                      : selectedDocument.contact.startsWith("http") // Check if it's a website URL
                      ? selectedDocument.contact
                      : selectedDocument.contact.startsWith("+") // Check if it's a phone number (with international code)
                      ? `tel:${selectedDocument.contact}`
                      : "#"
                  }
                  className="mt-2 block text-sm text-blue-600 underline font-normal"
                  target="_blank" // This ensures the link opens in a new tab
                  rel="noopener noreferrer" // Recommended for security reasons when using target="_blank"
                >
                  {selectedDocument.contact}
                </a>
              </div>
            )}
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
