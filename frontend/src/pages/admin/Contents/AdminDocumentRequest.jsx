import React, { useState, useEffect, useRef } from "react";
import ReactPaginate from "react-paginate";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import { Worker, Viewer } from "@react-pdf-viewer/core"; // Import Viewer
import pdfWorker from "pdfjs-dist";
import "../../../App.css";

function AdminDocuments() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [selectedDocuments, setSelectedDocuments] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState([]);
  const [sortCriteria, setSortCriteria] = useState("Most Recent");
  const modalRef = useRef(null);
  const deleteModalRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
    
  const itemsPerPage = 6;

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

  const openEditModal = (documents) => {
    setSelectedDocuments(documents);
    setIsEditModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedDocuments(null);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedDocuments(null);
  };

  const handleDeleteDocuments = async () => {
    if (!selectedDocuments) {
      console.log("No documents selected for deletion.");
      return;
    }

    console.log("Deleting documents with ID:", selectedDocuments._id); // Debugging line

    try {
      const response = await axios.delete(
        `${backendUrl}/documents/delete-documents/${selectedDocuments._id}`,
        { withCredentials: true }
      );

      console.log("Delete response:", response.data); // Debugging line
      fetchDocuments(); // Refresh documents list
      closeModal(); // Close modal after deleting
      setshowMessage("Documents deleted successfully!");
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Error deleting documents:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleUpdateDocuments = async () => {
    if (!selectedDocuments) return;

    if (
      !selectedDocuments.name ||
      !selectedDocuments.address ||
      !selectedDocuments.description
    ) {
      setshowMessage("Please fill in all required fields.");
      setErrorMessage(true);
      setTimeout(() => setErrorMessage(false), 3000);
      return;
    }

    const documentData = new FormData();
    documentData.append("name", selectedDocuments.name);
    documentData.append("address", selectedDocuments.address);
    documentData.append("description", selectedDocuments.description);
    documentData.append(
      "contact",
      selectedDocuments.contact ? selectedDocuments.contact : ""
    );

    const image = document.getElementById("documents-image").files[0]; // Make sure the input ID matches
    if (image) {
      documentData.append("image", image); // Append image to FormData
    }
    setLoading(true); // Start loading

    try {
      const response = await axios.put(
        `${backendUrl}/documents/update-documents/${selectedDocuments._id}`,
        documentData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setDocuments((prevDocuments) =>
        prevDocuments.map((doc) =>
          doc._id === selectedDocuments._id ? response.data : doc
        )
      );

      closeModal();
      setshowMessage("Documents updated successfully!");
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating documents:", error);
      if (error.response) {
        setshowMessage(error.response.data.msg); // Display error message from backend
        setErrorMessage(true);
        setTimeout(() => setErrorMessage(false), 3000);
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };
  const handleCreateDocuments = async () => {
    const documentsData = new FormData(); // Use FormData to handle image uploads
    documentsData.append(
      "name",
      document.getElementById("documents-name").value
    );
    documentsData.append(
      "address",
      document.getElementById("documents-address").value
    );
    documentsData.append(
      "description",
      document.getElementById("documents-description").value
    );
    documentsData.append(
      "contact",
      document.getElementById("documents-contact").value
    );

    const image = document.getElementById("documents-image").files[0]; // Ensure the input ID matches
    if (image) {
      documentsData.append("image", image); // Append image to FormData
    }

    if (
      !documentsData.get("name") ||
      !documentsData.get("address") ||
      !documentsData.get("description")
    ) {
      setshowMessage("Please fill in all required fields.");
      setErrorMessage(true);
      setTimeout(() => setErrorMessage(false), 3000);
      return;
    }
    setLoading(true); // Start loading

    try {
      const response = await axios.post(
        `${backendUrl}/documents/create-documents`,
        documentsData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setDocuments([...documents, response.data]); // Update documents list
      setSelectedDocuments(null); // Clear selected documents
      setIsAddModalOpen(false); // Close the modal
      setshowMessage("Documents created successfully!");
      setSuccessMessage(true);
      // Reset input fields
      document.getElementById("documents-name").value = "";
      document.getElementById("documents-address").value = "";
      document.getElementById("documents-description").value = "";
      document.getElementById("documents-contact").value = "";
      document.getElementById("documents-image").value = ""; // Reset image input

      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Error creating documents:", error);
      if (error.response) {
        setshowMessage(error.response.data.msg); // Display error message from backend
        setErrorMessage(true);
        setTimeout(() => setErrorMessage(false), 3000);
      }
    } finally {
      setLoading(false); // Stop loading
    }
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
  
  // Paginate the filteredDocuments list
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green text-white p-4 rounded-lg shadow-lg z-50">
          <p>{showMessage}</p>
        </div>
      )}

      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-medium text-gray-700">
          Document Request Steps
        </h1>
      </div>

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
          <option>Most Recent</option>
          <option>Oldest</option>
        </select>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-lg">My Listed Documents</div>
        <button
          className="btn btn-sm w-36 bg-green text-white relative"
          onClick={openAddModal}
        >
          + Add Document
        </button>
      </div>

      <hr className="mb-6 border-black" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {paginatedDocuments.length > 0 ? (
    paginatedDocuments.map((documents) => (
      <div
        key={documents._id}
        className="bg-white p-4 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer relative"
        onClick={() => openViewModal(documents)}
      >
        {/* Check if document.image exists before rendering */}
        {documents.image ? (
          documents.image.endsWith(".pdf") ? (
            <div className="overflow-y-hidden object-contain">
              <Worker workerUrl={pdfWorker}>
                <div className="w-full max-h-48 overflow-hidden mb-4">
                  <Viewer
                    fileUrl={`${backendUrl}${documents.image}`}
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
              src={`${backendUrl}${documents.image}`}
              alt={documents.name}
              className="w-full h-48 object-cover rounded-t-lg mb-4"
            />
          )
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-t-lg mb-4">
            <span className="text-gray-500">No Image Available</span>
          </div>
        )}

        <div className="text-md font-semibold text-gray-800 mb-2 overflow-hidden text-ellipsis whitespace-nowrap">
          {documents.name}
        </div>
        <p className="text-sm text-gray-600 mb-4 overflow-hidden text-ellipsis">
          {documents.description.slice(0, 100)}...
        </p>

        {/* Button container */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <div
            className="w-8 h-8 rounded-full bg-[#BE142E] flex justify-center items-center cursor-pointer relative group"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDocuments(documents);
              setIsDeleteModalOpen(true);
            }}
          >
            <span className="hidden group-hover:block absolute bottom-10 bg-gray-700 text-white text-xs rounded px-2 py-1">
              Delete
            </span>
            <i className="fas fa-trash text-white"></i>
          </div>
          <div
            className="w-8 h-8 rounded-full bg-[#3D3C3C] flex justify-center items-center cursor-pointer relative group"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(documents);
            }}
          >
            <span className="hidden group-hover:block absolute bottom-10 bg-gray-700 text-white text-xs rounded px-2 py-1">
              Edit
            </span>
            <i className="fas fa-edit text-white"></i>
          </div>
        </div>
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
  pageCount={Math.ceil(filteredDocuments.length / itemsPerPage)} // Total pages
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
            {/* Conditional rendering for images and PDFs */}
            {selectedDocuments && selectedDocuments.image ? (
              selectedDocuments.image.endsWith(".pdf") ? (
                <div className="px-10">
                  <Worker workerUrl={pdfWorker}>
                    <div className="w-full h-[40vh] overflow-auto mb-4 flex items-center justify-center">
                      {" "}
                      {/* Added flex and centering */}
                      <Viewer
                        fileUrl={`${backendUrl}${selectedDocuments.image}`}
                        renderTextLayer={false}
                        style={{
                          width: "100%", // Ensure it takes full width
                          height: "100%", // Adjusts height relative to the container's height
                          objectFit: "contain", // Ensures the PDF is fully contained within the container
                        }}
                      />
                    </div>
                  </Worker>
                </div>
              ) : (
                <img
                  src={`${backendUrl}${selectedDocuments.image}`}
                  alt={selectedDocuments.name}
                  className="mb-4 w-full h-64 object-cover rounded"
                />
              )
            ) : (
              <div className="mb-4 w-full h-64 bg-gray-200 flex items-center justify-center rounded">
                <span className="text-gray-500">No Image Available</span>
              </div>
            )}
            <div className="text-sm mb-4">{selectedDocuments.description}</div>

            {/* Conditionally render Website or Contact Details */}
            {selectedDocuments.contact && (
              <div className="text-sm font-medium mb-2">
                Website or Contact Details
                <a
                  href={
                    selectedDocuments.contact.includes("@") // Check if it's an email
                      ? `mailto:${selectedDocuments.contact}`
                      : selectedDocuments.contact.startsWith("http") // Check if it's a website URL
                      ? selectedDocuments.contact
                      : selectedDocuments.contact.startsWith("+") // Check if it's a phone number (with international code)
                      ? `tel:${selectedDocuments.contact}`
                      : "#"
                  }
                  className="mt-2 block text-sm text-blue-600 underline font-normal"
                  target="_blank" // This ensures the link opens in a new tab
                  rel="noopener noreferrer" // Recommended for security reasons when using target="_blank"
                >
                  {selectedDocuments.contact}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedDocuments && (
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
            <div className="text-xl mb-3">Edit Documents</div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Document Name</label>
              <input
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Documents Name"
                value={selectedDocuments.name}
                onChange={(e) =>
                  setSelectedDocuments({
                    ...selectedDocuments,
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
                value={selectedDocuments.address}
                onChange={(e) =>
                  setSelectedDocuments({
                    ...selectedDocuments,
                    address: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">
                Document File{" "}
                <span className="text-xs font-light italic">
                  (Allowed formats: PDF, JPG, JPEG, PNG, Max size: 5MB)
                </span>
              </label>
              <input
                id="documents-image"
                type="file"
                accept="image/*,.pdf"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Description</label>
              <textarea
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                value={selectedDocuments.description}
                onChange={(e) =>
                  setSelectedDocuments({
                    ...selectedDocuments,
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
                value={selectedDocuments.contact}
                onChange={(e) =>
                  setSelectedDocuments({
                    ...selectedDocuments,
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
                onClick={handleUpdateDocuments}
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
            <h2 className="text-2xl mb-4">Delete Documents</h2>
            <p>Are you sure you want to delete this documents?</p>
            <div className="flex justify-end mt-4">
              <button
                className="btn btn-sm w-24 bg-red text-white mr-2"
                onClick={() => {
                  handleDeleteDocuments(); // Call the delete function
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
            <div className="text-xl mb-3">Add New Document</div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Document Name</label>
              <input
                id="documents-name"
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter Documents Name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Address</label>
              <input
                id="documents-address"
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter Documents Address"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">
                Document File{" "}
                <span className="text-xs font-light italic">
                  (Allowed formats: PDF, JPG, JPEG, PNG, Max size: 5MB)
                </span>
              </label>
              <input
                id="documents-image"
                type="file"
                accept="image/*,.pdf"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Description</label>
              <textarea
                id="documents-description"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter Documents Description"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">
                Website or Contact Details
              </label>
              <input
                id="documents-contact"
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter Documents Details"
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
                onClick={handleCreateDocuments}
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

export default AdminDocuments;
