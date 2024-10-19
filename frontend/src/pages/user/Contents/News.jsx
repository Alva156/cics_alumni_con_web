import React, { useState, useEffect, useRef } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";

function News() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [selectedNews, setSelectedNews] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [news, setNews] = useState([]);
  const [sortCriteria, setSortCriteria] = useState("Name (A-Z)");
  const modalRef = useRef(null);

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

  const closeModal = () => {
    setIsViewModalOpen(false);
    setSelectedNews(null);
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
    }
    return 0;
  });

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
      <h1 className="text-2xl font-medium text-gray-700 mb-6">News</h1>

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
        </select>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-lg">News Lists</div>
      </div>

      <hr className="mb-6 border-black" />

      {filteredNews.map((news) => (
        <div
          key={news._id}
          className="mb-4 p-4 border border-black rounded-lg flex justify-between items-center hover:bg-gray-200 transition-colors cursor-pointer"
          onClick={() => openViewModal(news)}
        >
          <div>
            <div className="text-md font-medium mb-1">{news.name}</div>
            <div className="text-sm text-black-600">{news.address}</div>
          </div>
        </div>
      ))}

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
            <div className="text-sm font-medium mb-2">Contact Details</div>
            <a
              href={`mailto:${selectedNews.contact}`}
              className="block text-sm text-blue-600 underline"
            >
              {selectedNews.contact}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default News;
