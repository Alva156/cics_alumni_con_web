import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import sampleidpic from "../../assets/sampleidpic.jpg";

function Threads() {
  const [myThreads, setMyThreads] = useState([]);
  const [allThreads, setAllThreads] = useState([]);
  const [newThread, setNewThread] = useState({ title: "", content: "" });
  const [selectedThread, setSelectedThread] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState(null);
  const [validationMessage, setValidationMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const showValidation = (message) => {
    setValidationMessage(message);
    setShowValidationMessage(true);
    setTimeout(() => {
      setShowValidationMessage(false);
    }, 3000); // Hide the message after 3 seconds
  };

  // Function to show error messages
  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorMessage(true);
    setTimeout(() => {
      setShowErrorMessage(false);
    }, 3000); // Hide the message after 3 seconds
  };

  useEffect(() => {
    const fetchAllThreads = async () => {
      try {
        const response = await axios.get("http://localhost:6001/threads/get", {
          withCredentials: true,
        });
        setAllThreads(response.data);
      } catch (error) {
        console.error("Error fetching all threads:", error);
      }
    };

    const fetchMyThreads = async () => {
      try {
        const response = await axios.get(
          "http://localhost:6001/threads/my-threads",
          {
            withCredentials: true,
          }
        );
        setMyThreads(response.data);
      } catch (error) {
        console.error("Error fetching my threads:", error);
      }
    };

    fetchAllThreads();
    fetchMyThreads();
  }, []);

  const handleCreateThread = async () => {
    if (!newThread.title || !newThread.content) {
      showError("Please fill in both the title and content fields.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:6001/threads/create",
        {
          title: newThread.title,
          content: newThread.content,
        },
        { withCredentials: true }
      );

      // Manually set `isOwner` to true for the newly created thread
      const createdThread = { ...response.data.thread, isOwner: true };

      setMyThreads([...myThreads, createdThread]); // Update myThreads
      setAllThreads([...allThreads, createdThread]); // Update allThreads
      setNewThread({ title: "", content: "" });
      setIsAddModalOpen(false);
      showValidation("Thread created successfully!");
    } catch (error) {
      console.error("Error creating thread:", error);
    }
  };
  const handleUpdateThread = async () => {
    if (!selectedThread.title || !selectedThread.content) {
      showError("Please fill in both the title and content fields.");
      return;
    }
    if (!selectedThread) return;

    try {
      const response = await axios.put(
        `http://localhost:6001/threads/update/${selectedThread._id}`,
        {
          title: selectedThread.title,
          content: selectedThread.content,
        },
        { withCredentials: true }
      );

      // Update the `myThreads` state
      setMyThreads(
        myThreads.map((thread) =>
          thread._id === selectedThread._id ? response.data.thread : thread
        )
      );

      // Update the `allThreads` state and ensure the `isOwner` field is preserved
      setAllThreads(
        allThreads.map((thread) =>
          thread._id === selectedThread._id
            ? { ...response.data.thread, isOwner: thread.isOwner } // Keep `isOwner` field
            : thread
        )
      );

      setSelectedThread(null);
      setIsEditModalOpen(false);
      showValidation("Thread updated successfully!");
    } catch (error) {
      console.error("Error updating thread:", error);
    }
  };

  const handleDeleteThread = async () => {
    if (!threadToDelete) return;
    try {
      await axios.delete(
        `http://localhost:6001/threads/delete/${threadToDelete._id}`,
        {
          withCredentials: true,
        }
      );

      // Update the threads state to remove the deleted thread
      setMyThreads(
        myThreads.filter((thread) => thread._id !== threadToDelete._id)
      );
      setAllThreads(
        allThreads.filter((thread) => thread._id !== threadToDelete._id)
      );
      setThreadToDelete(null);
      setIsDeleteModalOpen(false);
      showValidation("Thread deleted successfully!");
    } catch (error) {
      console.error("Error deleting thread:", error);
    }
  };

  const openViewModal = (thread) => {
    setSelectedThread(thread);
    setIsViewModalOpen(true);
  };

  const openEditModal = (thread) => {
    setSelectedThread(thread);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (thread) => {
    setThreadToDelete(thread);
    setIsDeleteModalOpen(true);
  };

  const openAddModal = () => {
    setNewThread({ title: "", content: "" });
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedThread(null);
    setThreadToDelete(null);
  };

  // Filter threads based on search term
  const filteredThreads = myThreads.filter((thread) =>
    thread.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
      <div className="carousel relative bg-white m-6 max-w-full overflow-hidden">
        {showValidationMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green text-white p-4 rounded-lg shadow-lg z-50">
            <p>{validationMessage}</p>
          </div>
        )}
      </div>
      <h1 className="text-xl mb-4">Threads</h1>
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search Threads"
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
          <option>Title (A-Z)</option>
          <option>Title (Z-A)</option>
        </select>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-lg">My Threads</div>
        <button
          className="btn btn-sm w-36 bg-green text-white"
          onClick={openAddModal}
        >
          + New Thread
        </button>
      </div>

      <hr className="mb-6 border-black" />
      {myThreads.length === 0 ? (
        <div>No threads created yet.</div>
      ) : (
        myThreads.map((thread) => (
          <div
            key={thread._id}
            className="mb-4 p-4 border border-black rounded-lg flex justify-between cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => openViewModal(thread)}
          >
            <div>
              <div className="text-md font-medium mb-1">{thread.title}</div>
              <div className="text-sm text-black-600">999 replies</div>
            </div>
            <div className="flex items-center">
              <div
                className="w-4 h-4 rounded-full bg-[#BE142E] flex justify-center items-center cursor-pointer mr-2 relative group"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteModal(thread);
                }}
              >
                <span className="hidden group-hover:block absolute bottom-8 bg-gray-700 text-white text-xs rounded px-2 py-1">
                  Delete
                </span>
              </div>
              <div
                className="w-4 h-4 rounded-full bg-[#3D3C3C] flex justify-center items-center cursor-pointer mr-2 relative group"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(thread);
                }}
              >
                <span className="hidden group-hover:block absolute bottom-8 bg-gray-700 text-white text-xs rounded px-2 py-1">
                  Edit
                </span>
              </div>
            </div>
          </div>
        ))
      )}

      <div className="flex justify-between items-center mb-4 mt-12">
        <div className="text-lg">All Threads</div>
      </div>

      <hr className="mb-6 border-black" />

      {allThreads.length === 0 ? (
        <div>No threads created yet.</div>
      ) : (
        allThreads.map((thread) => (
          <div
            key={thread._id}
            className="mb-4 p-4 border border-black rounded-lg flex justify-between cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => openViewModal(thread)}
          >
            <div>
              <div className="text-md font-medium mb-1">{thread.title}</div>
              <div className="text-sm text-black-600">999 replies</div>
            </div>
            {/* Only show buttons if the logged-in user is the owner of the thread */}
            {thread.isOwner && (
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full bg-[#BE142E] flex justify-center items-center cursor-pointer mr-2 relative group"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteModal(thread);
                  }}
                >
                  <span className="hidden group-hover:block absolute bottom-8 bg-gray-700 text-white text-xs rounded px-2 py-1">
                    Delete
                  </span>
                </div>
                <div
                  className="w-4 h-4 rounded-full bg-[#3D3C3C] flex justify-center items-center cursor-pointer mr-2 relative group"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(thread);
                  }}
                >
                  <span className="hidden group-hover:block absolute bottom-8 bg-gray-700 text-white text-xs rounded px-2 py-1">
                    Edit
                  </span>
                </div>
              </div>
            )}
          </div>
        ))
      )}
      {isViewModalOpen && selectedThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 md:p-8 lg:p-12 rounded-lg w-full max-w-md md:max-w-3xl lg:max-w-4xl xl:max-w-5xl h-auto overflow-y-auto max-h-[90vh] relative mx-4">
            {/* Header section */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <img
                  src={sampleidpic} // Replace with dynamic user avatar
                  alt="User Avatar"
                  className="w-14 h-14 mr-3"
                />
                <div>
                  <h2 className="text-xl font-semibold">
                    {`${selectedThread.userId.firstName} ${selectedThread.userId.lastName}`}
                  </h2>
                  <p className="text-gray-500">
                    {selectedThread.userRole || "Software Engineer"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Posted on{" "}
                    {selectedThread.createdAt
                      ? new Date(selectedThread.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : null}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            {/* Thread content */}
            <div className="border-b border-black mb-4 pb-2">
              <h3 className="text-lg font-medium">{selectedThread.title}</h3>
              <p className="mt-2 text-black">{selectedThread.content}</p>
            </div>

            {/* Comments Section */}
            <div className="space-y-4 max-h-64 overflow-y-auto">
              <div className="p-4 border border-black rounded-lg flex items-start mb-2">
                <img
                  src={sampleidpic}
                  alt="User Avatar"
                  className="w-10 h-10 mr-3"
                />
                <div className="flex-grow">
                  <h4 className="font-semibold text-sm">James Lorenz Santos</h4>
                  <p className="text-gray-500 text-xs mb-2">
                    Software Developer • Posted on July 5, 2024
                  </p>
                  <p className="text-gray-700">
                    What is your capstone all about? Maybe I can help you.
                  </p>
                </div>
                <div className="flex space-x-2">
                  <div
                    className="w-4 h-4 rounded-full bg-[#BE142E] flex justify-center items-center cursor-pointer relative group"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(thread);
                    }}
                  >
                    <span className="absolute top-full left-1/2 transform -translate-x-1/2 mb-1 bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                      Delete
                    </span>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full bg-[#3D3C3C] flex justify-center items-center cursor-pointer relative group"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(comment); // Handle comment edit
                    }}
                  >
                    <span className="absolute top-full left-1/2 transform -translate-x-1/2 mb-1 bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                      Edit
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          {showErrorMessage && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red text-white p-4 rounded-lg shadow-lg z-50">
              <p>{errorMessage}</p>
            </div>
          )}
          <div className="relative bg-white p-6 md:p-8 lg:p-12 rounded-lg w-full max-w-md md:max-w-3xl lg:max-w-4xl xl:max-w-5xl h-auto overflow-y-auto max-h-[90vh] mx-4">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-sm md:text-base lg:text-lg"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
            <div className="mb-4">
              <input
                type="text"
                value={selectedThread.title}
                onChange={(e) =>
                  setSelectedThread({
                    ...selectedThread,
                    title: e.target.value,
                  })
                }
                className="w-full border border-black rounded-lg px-4 py-2 mb-4 mt-4"
              />
              <textarea
                value={selectedThread.content}
                onChange={(e) =>
                  setSelectedThread({
                    ...selectedThread,
                    content: e.target.value,
                  })
                }
                className="w-full border border-black rounded-lg px-4 py-2 h-80"
              />
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={closeModal}
                  className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-[#3D3C3C] text-white px-4 py-2 md:px-6 md:py-3"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdateThread}
                  className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-green text-white px-4 py-2 md:px-6 md:py-3"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-64 sm:w-96">
            <h2 className="ttext-2xl mb-4">Delete Thread</h2>
            <p>Are you sure you want to delete this thread?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleDeleteThread}
                className="btn btn-sm w-24 bg-red text-white mr-2"
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
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          {showErrorMessage && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red text-white p-4 rounded-lg shadow-lg z-50">
              <p>{errorMessage}</p>
            </div>
          )}
          <div className="relative bg-white p-6 md:p-8 lg:p-12 rounded-lg w-full max-w-md md:max-w-3xl lg:max-w-4xl xl:max-w-5xl h-auto overflow-y-auto max-h-[90vh] mx-4">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-sm md:text-base lg:text-lg"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Discussion Title"
                value={newThread.title}
                onChange={(e) =>
                  setNewThread({ ...newThread, title: e.target.value })
                }
                className="w-full border border-black rounded-lg px-4 py-2 mb-4 mt-4"
              />
              <textarea
                placeholder="Discussion Content"
                value={newThread.content}
                onChange={(e) =>
                  setNewThread({ ...newThread, content: e.target.value })
                }
                className="w-full border border-black rounded-lg px-4 py-2 h-80"
              />
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={closeModal}
                  className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-[#3D3C3C] text-white px-4 py-2 md:px-6 md:py-3"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateThread}
                  className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-green text-white px-4 py-2 md:px-6 md:py-3"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Threads;
