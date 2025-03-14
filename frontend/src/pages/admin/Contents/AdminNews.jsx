import React, { useState, useEffect, useRef } from "react";
import ReactPaginate from "react-paginate";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";

function AdminNews() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [selectedNews, setSelectedNews] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [news, setNews] = useState([]);
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

  // Fetch all news from the server
  const fetchNews = async () => {
    try {
      const response = await axios.get(`${backendUrl}/news/view`, {
        withCredentials: true,
      });
      setNews(response.data);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const openViewModal = (news) => {
    setSelectedNews(news);
    setIsViewModalOpen(true);
  };

  const openEditModal = (news) => {
    setSelectedNews(news);
    setIsEditModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedNews(null);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedNews(null);
  };

  const handleDeleteNews = async () => {
    if (!selectedNews) {
      console.log("No news selected for deletion.");
      return;
    }

    console.log("Deleting news with ID:", selectedNews._id); // Debugging line

    try {
      const response = await axios.delete(
        `${backendUrl}/news/delete-news/${selectedNews._id}`,
        { withCredentials: true }
      );

      console.log("Delete response:", response.data); // Debugging line
      fetchNews(); // Refresh news list
      closeModal(); // Close modal after deleting
      setshowMessage("News deleted successfully!");
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Error deleting news:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleUpdateNews = async () => {
    if (!selectedNews) return;

    if (
      !selectedNews.name ||
      !selectedNews.address ||
      !selectedNews.description
    ) {
      setshowMessage("Please fill in all required fields.");
      setErrorMessage(true);
      setTimeout(() => setErrorMessage(false), 3000);
      return;
    }

    const newsData = new FormData();
    newsData.append("name", selectedNews.name);
    newsData.append("address", selectedNews.address);
    newsData.append("description", selectedNews.description);
    newsData.append(
      "contact",
      selectedNews.contact ? selectedNews.contact : ""
    );

    const image = document.getElementById("news-image").files[0];
    if (image) {
      newsData.append("image", image);
    }
    setLoading(true); // Start loading

    try {
      const response = await axios.put(
        `${backendUrl}/news/update-news/${selectedNews._id}`,
        newsData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setNews((prevNews) =>
        prevNews.map((news) =>
          news._id === selectedNews._id ? response.data : news
        )
      );

      closeModal();
      setshowMessage("News updated successfully!");
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating news:", error);
      if (error.response) {
        setshowMessage(error.response.data.msg); // Display error message from backend
        setErrorMessage(true);
        setTimeout(() => setErrorMessage(false), 3000);
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleCreateNews = async () => {
    const newsData = new FormData();
    newsData.append("name", document.getElementById("news-name").value);
    newsData.append("address", document.getElementById("news-address").value);
    newsData.append(
      "description",
      document.getElementById("news-description").value
    );
    newsData.append("contact", document.getElementById("news-contact").value);

    const image = document.getElementById("news-image").files[0];
    if (image) {
      newsData.append("image", image); // Add the image to formData
    }

    if (
      !newsData.get("name") ||
      !newsData.get("address") ||
      !newsData.get("description")
    ) {
      setshowMessage("Please fill in all required fields.");
      setErrorMessage(true);
      setTimeout(() => setErrorMessage(false), 3000);
      return;
    }
    setLoading(true); // Start loading

    try {
      const response = await axios.post(
        `${backendUrl}/news/create-news`,
        newsData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setNews([...news, response.data]);
      closeModal();
      setshowMessage("News created successfully!");
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Error creating news:", error);
      if (error.response) {
        setshowMessage(error.response.data.msg);
        setErrorMessage(true);
        setTimeout(() => setErrorMessage(false), 3000);
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const filteredNews = news.filter((news) =>
    news.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort news based on selected criteria
  const sortedNews = filteredNews.sort((a, b) => {
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
  
  // Paginate the filteredNews list
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNews = filteredNews.slice(startIndex, endIndex);

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green text-white p-4 rounded-lg shadow-lg z-50">
          <p>{showMessage}</p>
        </div>
      )}

      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-medium text-gray-700">News</h1>
      </div>

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search News"
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
        <div className="text-lg">My Listed News</div>
        <button
          className="btn btn-sm w-36 bg-green text-white relative"
          onClick={openAddModal}
        >
          + Add News
        </button>
      </div>

      <hr className="mb-6 border-black" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {paginatedNews.length > 0 ? (
    paginatedNews.map((news) => (
      <div
        key={news._id}
        className="relative mb-4 p-4 border border-black rounded-lg flex flex-col hover:bg-gray-200 transition-colors cursor-pointer"
        onClick={() => openViewModal(news)}
      >
        <img
          src={`${backendUrl}${news.image}`}
          alt={news.name}
          className="w-full h-48 object-cover rounded-t-lg mb-4 mt-4"
        />
        <div className="absolute top-2 right-2 flex space-x-2">
          <div
            className="w-8 h-8 rounded-full bg-[#BE142E] flex justify-center items-center cursor-pointer relative group"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNews(news);
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
              openEditModal(news);
            }}
          >
            <span className="hidden group-hover:block absolute bottom-10 bg-gray-700 text-white text-xs rounded px-2 py-1">
              Edit
            </span>
            <i className="fas fa-edit text-white"></i>
          </div>
        </div>
        <div>
          <div className="text-md font-medium mb-1">{news.name}</div>
          <div className="text-sm text-black-600">{news.address}</div>
        </div>
      </div>
    ))
  ) : (
    <p>No news found.</p>
  )}
</div>

      <ReactPaginate
  previousLabel={<button className="w-full h-full">Previous</button>}
  nextLabel={<button className="w-full h-full">Next</button>}
  breakLabel={<button className="w-full h-full">...</button>}
  pageCount={Math.ceil(filteredNews.length / itemsPerPage)} // Total pages
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
      {isViewModalOpen && selectedNews && (
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
            <div className="text-2xl font-medium mb-2">{selectedNews.name}</div>
            <div className="text-md mb-2">{selectedNews.address}</div>
            <img
              src={`${backendUrl}${selectedNews.image}`}
              alt={selectedNews.name}
              className="mb-4 w-full h-48 md:h-64 lg:h-80 object-cover rounded"
            />
            <div className="text-sm mb-4">{selectedNews.description}</div>

            {/* Conditionally render Website or Contact Details */}
            {selectedNews.contact && (
              <div className="text-sm font-medium mb-2">
                Website or Contact Details
                <a
                  href={
                    selectedNews.contact.includes("@") // Check if it's an email
                      ? `mailto:${selectedNews.contact}`
                      : selectedNews.contact.startsWith("http") // Check if it's a website URL
                      ? selectedNews.contact
                      : selectedNews.contact.startsWith("+") // Check if it's a phone number (with international code)
                      ? `tel:${selectedNews.contact}`
                      : "#"
                  }
                  className="mt-2 block text-sm text-blue-600 underline font-normal"
                  target="_blank" // This ensures the link opens in a new tab
                  rel="noopener noreferrer" // Recommended for security reasons when using target="_blank"
                >
                  {selectedNews.contact}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedNews && (
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
            <div className="text-xl mb-3">Edit News</div>
            <div className="mb-4">
              <label className="block text-sm mb-1">News Name</label>
              <input
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="News Name"
                value={selectedNews.name}
                onChange={(e) =>
                  setSelectedNews({
                    ...selectedNews,
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
                value={selectedNews.address}
                onChange={(e) =>
                  setSelectedNews({
                    ...selectedNews,
                    address: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">
                News Image{" "}
                <span className="text-xs font-light italic">
                  (Allowed formats: JPG, JPEG, PNG, Max size: 5MB)
                </span>
              </label>
              <input
                id="news-image"
                type="file"
                accept="image/*"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Description</label>
              <textarea
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                value={selectedNews.description}
                onChange={(e) =>
                  setSelectedNews({
                    ...selectedNews,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">
                {" "}
                Website or Contact Details
              </label>
              <input
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                value={selectedNews.contact}
                onChange={(e) =>
                  setSelectedNews({
                    ...selectedNews,
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
                onClick={handleUpdateNews}
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
            <h2 className="text-2xl mb-4">Delete News</h2>
            <p>Are you sure you want to delete this news?</p>
            <div className="flex justify-end mt-4">
              <button
                className="btn btn-sm w-24 bg-red text-white mr-2"
                onClick={() => {
                  handleDeleteNews(); // Call the delete function
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
            <div className="text-xl mb-3">Add New News</div>
            <div className="mb-4">
              <label className="block text-sm mb-1">News Name</label>
              <input
                id="news-name"
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter News Name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Address</label>
              <input
                id="news-address"
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter News Address"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">
                News Image{" "}
                <span className="text-xs font-light italic">
                  (Allowed formats: JPG, JPEG, PNG, Max size: 5MB)
                </span>
              </label>
              <input
                id="news-image"
                type="file"
                accept="image/*"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Description</label>
              <textarea
                id="news-description"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter News Description"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">
                {" "}
                Website or Contact Details
              </label>
              <input
                id="news-contact"
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter News Details"
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
                onClick={handleCreateNews}
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

export default AdminNews;
