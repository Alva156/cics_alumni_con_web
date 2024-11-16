import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import sampleidpic from "../../assets/sampleidpic.jpg";
import blankprofilepic from "../../assets/blankprofilepic.jpg";
import { Filter } from "bad-words";

function AdminThreads() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [myThreads, setMyThreads] = useState([]);
  const [allThreads, setAllThreads] = useState([]);
  const [newThread, setNewThread] = useState({ title: "", content: "" });
  const [selectedThread, setSelectedThread] = useState(null);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
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
  const [filteredThreads, setFilteredThreads] = useState([]);
  const [sortOption, setSortOption] = useState("Title (A-Z)");

  // replies

  const [newReply, setNewReply] = useState("");
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editingReplyContent, setEditingReplyContent] = useState("");
  const [replies, setReplies] = useState([]); // Correct initialization
  const [isEditReplyModalOpen, setIsEditReplyModalOpen] = useState(false);
  const [selectedReply, setSelectedReply] = useState(null);
  const [isDeleteReplyModalOpen, setIsDeleteReplyModalOpen] = useState(false);
  const [replyToDelete, setReplyToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-8 border-red border-solid border-opacity-75"></div>
    </div>
  );
  const filter = new Filter();
  const customBadWords = [
    "putang ina",
    "bobo",
    "tanga",
    "sira ulo",
    "gago",
    "bwisit",
    "hayop",
    "bastard",
    "peste",
    "ulol",
    "tarantado",
    "hinayupak",
    "lintik",
    "demonyo",
    "salot",
    "lecheng",
    "putik",
    "inutil",
    "lapastangan",
    "walang hiya",
    "punyeta",
    "hudas",
    "yawa",
    "burat",
    "titi",
    "kupal",
    "unggoy",
    "gunggong",
    "ulupong",
    "buwisit",
    "tang ina",
    "puke",
    "kantot",
    "kantutan",
    "kantotan",
    "torjak",
    "dede",
    "pepe",
    "puday",
    "bilat",
    "tae",
    "mangmang",
    "iyot",
    "shet",
    "pakyu",
    "damn",
    "shit",
    "fuck",
    "fucker",
    "bitch",
    "asshole",
    "bastard",
    "dickhead",
    "motherfucker",
    "son of a bitch",
    "whore",
    "slut",
    "cunt",
    "jerk",
    "idiot",
    "bitchass",
    "nigger",
    "shitty",
    "bullshit",
    "laspag",
    "pakyu",
    "tangina",
    "batugan",
    "tameme",
    "santong kabayo",
    "abnoy",
    "duwag",
    "tuta",
    "bakla",
    "tomboy",
    "bading",
    "bugok",
    "gagu",
    "kingina",
    "putragis",
    "yabag",
    "bayag",
    "katangahan",
    "kasumpa-sumpa",
    "kagaguhan",
    "putres",
    "leche",
    "puta",
    "bobong",
    "pakyong ina",
    "shithead",
    "faggot",
    "moron",
    "crap",
    "anus",
    "motherfreaker",
    "gaylord",
    "jabol",
  ];

  filter.addWords(...customBadWords);

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

  // Call this function whenever the modal is opened or a new reply is created
  useEffect(() => {
    if (selectedThread) {
      fetchReplies();
    }
  }, [selectedThread]);

  useEffect(() => {
    const fetchAllThreads = async () => {
      try {
        const response = await axios.get(`${backendUrl}/threads/get`, {
          withCredentials: true,
        });
        setAllThreads(response.data);
      } catch (error) {
        console.error("Error fetching all threads:", error);
      }
    };

    const fetchMyThreads = async () => {
      try {
        const response = await axios.get(`${backendUrl}/threads/my-threads`, {
          withCredentials: true,
        });
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
    // Check for bad words in the title and content
    if (
      filter.isProfane(newThread.title) ||
      filter.isProfane(newThread.content)
    ) {
      showError("Your post contains prohibited words and cannot be posted.");
      return;
    }
    try {
      const response = await axios.post(
        `${backendUrl}/threads/create`,
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
    // Check for bad words in the title and content
    if (
      filter.isProfane(selectedThread.title) ||
      filter.isProfane(selectedThread.content)
    ) {
      showError("Your post contains prohibited words and cannot be posted.");
      return;
    }
    if (!selectedThread) return;

    try {
      const response = await axios.put(
        `${backendUrl}/threads/update/${selectedThread._id}`,
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
      await axios.delete(`${backendUrl}/threads/delete/${threadToDelete._id}`, {
        withCredentials: true,
      });

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
  const handleNotif = async () => {
    if (!selectedThread) return;

    try {
      // Toggle the notifEnabled status based on the current state
      const newNotifStatus = !selectedThread.notifEnabled;

      await axios.put(
        `${backendUrl}/threads/silence/${selectedThread._id}`,
        { notifEnabled: newNotifStatus }, // Send new notifEnabled status
        {
          withCredentials: true,
        }
      );

      // Update the notifEnabled status for the selected thread in both `myThreads` and `allThreads`
      const updatedMyThreads = myThreads.map((thread) =>
        thread._id === selectedThread._id
          ? { ...thread, notifEnabled: newNotifStatus }
          : thread
      );
      const updatedAllThreads = allThreads.map((thread) =>
        thread._id === selectedThread._id
          ? { ...thread, notifEnabled: newNotifStatus }
          : thread
      );

      setMyThreads(updatedMyThreads);
      setAllThreads(updatedAllThreads);

      // Optionally update state or show a message
      showValidation(
        `Thread notifications ${
          newNotifStatus ? "enabled" : "disabled"
        } successfully!`
      );
      setIsNotifModalOpen(false);
    } catch (error) {
      console.error("Error toggling notifications:", error);
    }
  };

  const fetchReplies = async (threadId) => {
    try {
      const response = await axios.get(
        `${backendUrl}/replies/thread/${threadId}`,
        {
          withCredentials: true,
        }
      );
      setReplies(response.data); // Update replies state with the fetched data
    } catch (error) {
      console.error("Error fetching replies:", error);
      setReplies([]); // Reset replies on error
    }
  };

  // Fetch replies when the selected thread changes
  useEffect(() => {
    if (selectedThread) {
      fetchReplies(selectedThread._id);
    }
  }, [selectedThread]);

  const handleCreateReply = async () => {
    // Check if the reply content is empty
    if (!newReply.trim()) {
      showError("Reply content cannot be empty."); // Show error message immediately
      return;
    }

    // Check for bad words in the reply content
    if (filter.isProfane(newReply)) {
      showError("Your reply contains prohibited words and cannot be posted."); // Show error message immediately
      return;
    }

    setLoading(true); // Start loading immediately

    try {
      const response = await axios.post(
        `${backendUrl}/replies/create`,
        { threadId: selectedThread._id, reply: newReply },
        { withCredentials: true }
      );

      // Fetch updated replies after a new reply is created
      await fetchReplies(selectedThread._id); // Ensure we fetch fresh replies

      // Update replyCount for the corresponding thread
      setMyThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread._id === selectedThread._id
            ? { ...thread, replyCount: thread.replyCount + 1 }
            : thread
        )
      );

      setAllThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread._id === selectedThread._id
            ? { ...thread, replyCount: thread.replyCount + 1 }
            : thread
        )
      );

      // Clear the reply input
      setNewReply("");

      // Show success message after loading
      setTimeout(() => {
        setLoading(false); // Stop loading after 1 second
        showValidation("Reply created successfully!"); // Show success message
      }, 1000);
    } catch (error) {
      console.error("Error creating reply:", error);

      // Stop loading immediately on error
      setLoading(false);
      showError("Failed to create reply. Please try again."); // Show error message immediately
    }
  };

  const handleEditReply = (reply) => {
    setSelectedReply({
      ...reply,
      content: reply.reply || "", // Ensure the content is set, even if it's an empty string
    });
    setIsEditReplyModalOpen(true); // Open the edit modal
  };

  const handleUpdateReply = async (replyId) => {
    if (!selectedReply.content.trim()) {
      showError("Reply content cannot be empty.");
      return;
    }
    // Check for bad words in the updated reply content
    if (filter.isProfane(selectedReply.content)) {
      showError("Your reply contains prohibited words and cannot be updated.");
      return;
    }

    try {
      const response = await axios.put(
        `${backendUrl}/replies/update/${replyId}`,
        { reply: selectedReply.content }, // Use 'reply' as the field name
        { withCredentials: true }
      );

      // Refetch replies after update to ensure buttons are updated
      await fetchReplies(selectedThread._id);

      setIsEditReplyModalOpen(false); // Close the modal after update
      setSelectedReply(null); // Clear selected reply
      showValidation("Reply updated successfully!");
    } catch (error) {
      console.error("Error updating reply:", error);
    }
  };
  const openDeleteReplyModal = (reply) => {
    setReplyToDelete(reply); // Set the reply to delete
    setIsDeleteReplyModalOpen(true); // Open the delete modal
  };

  const handleDeleteReply = async (replyId) => {
    try {
      // First, identify the thread to which the reply belongs
      const threadId = selectedThread._id; // Get the current selected thread ID

      // Send the delete request to the server
      await axios.delete(`${backendUrl}/replies/delete/${replyId}`, {
        withCredentials: true,
      });

      // Update the replies state to remove the deleted reply
      setReplies(replies.filter((reply) => reply._id !== replyId));

      // Decrement the reply count for the thread
      setMyThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread._id === threadId
            ? { ...thread, replyCount: thread.replyCount - 1 }
            : thread
        )
      );

      setAllThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread._id === threadId
            ? { ...thread, replyCount: thread.replyCount - 1 }
            : thread
        )
      );

      showValidation("Reply deleted successfully!");
    } catch (error) {
      console.error("Error deleting reply:", error);
    }
  };

  const openViewModal = (thread) => {
    setNewReply("");
    setSelectedThread(thread);
    setIsViewModalOpen(true);
    fetchReplies(thread._id);
  };

  const openNotifModal = (thread) => {
    setSelectedThread(thread);
    setIsNotifModalOpen(true);
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
    setIsNotifModalOpen(false);
    setSelectedThread(null);
    setThreadToDelete(null);
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredThreads([]);
    } else {
      const filtered = [...myThreads, ...allThreads]
        .filter((thread, index, self) => {
          // Check if the user owns the thread
          const isOwned = myThreads.some(
            (myThread) => myThread._id === thread._id
          );

          // If the thread is owned, only include the one from myThreads
          if (isOwned) {
            return thread.isOwner;
          }

          // Otherwise, include the thread from allThreads
          return !self.find((t) => t._id === thread._id && t.isOwner);
        })
        .filter((thread) =>
          thread.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      setFilteredThreads(filtered);
    }
  }, [searchTerm, myThreads, allThreads]);

  const sortThreads = (threads) => {
    return threads.sort((a, b) => {
      if (sortOption === "Title (A-Z)") {
        return a.title.localeCompare(b.title);
      } else if (sortOption === "Title (Z-A)") {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });
  };

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-0 mb-12">
      <div className="carousel relative bg-white m-3 max-w-full overflow-hidden">
        {showErrorMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red text-white p-4 rounded-lg shadow-lg z-[80]">
            <p>{errorMessage}</p>
          </div>
        )}
        {showValidationMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green text-white p-4 rounded-lg shadow-lg z-[80]">
            <p>{validationMessage}</p>
          </div>
        )}
      </div>
      <h1 className="text-2xl font-medium text-gray-700 mb-6">Threads</h1>
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
        <select
          className="ml-2 border border-black rounded px-3 py-1 text-sm"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option>Title (A-Z)</option>
          <option>Title (Z-A)</option>
        </select>
      </div>

      <div className="flex justify-between items-center mb-4 mt-12">
        {searchTerm.trim() ? (
          <div className="text-lg">Search Results:</div>
        ) : (
          <div className="text-lg">My Threads</div>
        )}
        <button
          className="btn btn-sm w-36 bg-green text-white"
          onClick={openAddModal}
        >
          + New Thread
        </button>
      </div>

      <hr className="mb-6 border-black" />

      {searchTerm.trim() ? (
        filteredThreads.length === 0 ? (
          <div>No threads match your search.</div>
        ) : (
          sortThreads(filteredThreads).map((thread) => (
            <div
              key={thread._id}
              className="mb-4 p-4 border border-black rounded-lg flex justify-between cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => openViewModal(thread)}
            >
              <div>
                <div className="text-md font-medium mb-1">{thread.title}</div>
                <div className="text-sm text-black-600">
                  Replies: {thread.replyCount || 0}
                </div>
              </div>
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
                    className="w-4 h-4 rounded-full bg-blue flex justify-center items-center cursor-pointer mr-2 relative group"
                    onClick={(e) => {
                      e.stopPropagation();
                      openNotifModal(thread);
                    }}
                  >
                    <span className="hidden group-hover:block absolute bottom-8 bg-gray-700 text-white text-xs rounded px-2 py-1">
                      Notifications
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
        )
      ) : (
        <>
          {/* My Threads Section */}
          {myThreads.length === 0 ? (
            <div>No threads created yet.</div>
          ) : (
            sortThreads(myThreads).map((thread) => (
              <div
                key={thread._id}
                className="mb-4 p-4 border border-black rounded-lg flex justify-between cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => openViewModal(thread)}
              >
                <div>
                  <div className="text-md font-medium mb-1">{thread.title}</div>
                  <div className="text-sm text-black-600">
                    Replies: {thread.replyCount || 0}
                  </div>
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
                    className="w-4 h-4 rounded-full bg-blue flex justify-center items-center cursor-pointer mr-2 relative group"
                    onClick={(e) => {
                      e.stopPropagation();
                      openNotifModal(thread);
                    }}
                  >
                    <span className="hidden group-hover:block absolute bottom-8 bg-gray-700 text-white text-xs rounded px-2 py-1">
                      Notifications
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

          {/* All Threads Section */}
          <div className="flex justify-between items-center mb-4 mt-12">
            <div className="text-lg">All Threads</div>
          </div>

          <hr className="mb-6 border-black" />

          {allThreads.length === 0 ? (
            <div>No threads created yet.</div>
          ) : (
            sortThreads(allThreads).map((thread) => (
              <div
                key={thread._id}
                className="mb-4 p-4 border border-black rounded-lg flex justify-between cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => openViewModal(thread)}
              >
                <div>
                  <div className="text-md font-medium mb-1">{thread.title}</div>
                  <div className="text-sm text-black-600">
                    Replies: {thread.replyCount || 0}
                  </div>
                </div>
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
                      className="w-4 h-4 rounded-full bg-blue flex justify-center items-center cursor-pointer mr-2 relative group"
                      onClick={(e) => {
                        e.stopPropagation();
                        openNotifModal(thread);
                      }}
                    >
                      <span className="hidden group-hover:block absolute bottom-8 bg-gray-700 text-white text-xs rounded px-2 py-1">
                        Notifications
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
        </>
      )}
      {isDeleteReplyModalOpen && replyToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-64 sm:w-96">
            <h2 className="text-2xl mb-4">Delete Reply</h2>
            <p>Are you sure you want to delete this reply?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  handleDeleteReply(replyToDelete._id); // Delete the reply
                  setIsDeleteReplyModalOpen(false); // Close the modal
                }}
                className="btn btn-sm w-24 bg-red text-white mr-2"
              >
                Yes
              </button>
              <button
                className="btn btn-sm w-24 bg-gray-500 text-white"
                onClick={() => setIsDeleteReplyModalOpen(false)} // Close modal without deleting
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {isEditReplyModalOpen && selectedReply && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-2xl mb-4">Edit Reply</h2>
            <textarea
              className="w-full border border-black rounded-lg px-4 py-2"
              value={selectedReply.content || ""} // Corrected: Use `content` instead of `reply`
              onChange={(e) =>
                setSelectedReply({
                  ...selectedReply,
                  content: e.target.value, // Update `content` correctly
                })
              }
            />
            <div className="flex justify-center gap-2 mt-4">
              <button
                className="btn btn-sm w-24 bg-green text-white mr-2"
                onClick={() => {
                  handleUpdateReply(selectedReply._id); // Call the update handler
                }}
              >
                Save
              </button>
              <button
                className="btn btn-sm w-24 bg-gray-500 text-white"
                onClick={() => setIsEditReplyModalOpen(false)} // Close the modal
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isViewModalOpen && selectedThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          {loading && <LoadingSpinner />} {/* Show loading spinner */}
          <div className="bg-white p-6 md:p-8 lg:p-12 rounded-lg w-full max-w-md md:max-w-3xl lg:max-w-4xl xl:max-w-5xl h-auto overflow-y-auto max-h-[90vh] relative mx-4">
            {/* Header section */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <img
                  src={
                    selectedThread.userProfileId.profileImage
                      ? `${backendUrl}${selectedThread.userProfileId.profileImage}`
                      : blankprofilepic
                  } // Replace with dynamic user avatar
                  alt="User Avatar"
                  className="w-14 h-14 mr-3"
                />
                <div>
                  <h2 className="text-md lg:text-xl font-semibold">
                    {`${selectedThread.userProfileId.firstName} ${selectedThread.userProfileId.lastName}`}
                  </h2>
                  <p className="text-gray-500">
                    {selectedThread.userProfileId.profession}
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
              {replies.map((reply) => (
                <div
                  key={reply._id}
                  className="p-4 border border-black rounded-lg flex items-start mb-2"
                >
                  <img
                    src={
                      reply.userProfileId.profileImage
                        ? `${backendUrl}${reply.userProfileId.profileImage}`
                        : blankprofilepic
                    }
                    alt="User Avatar"
                    className="w-10 h-10 mr-3"
                  />
                  <div className="flex-grow">
                    <h4 className="font-semibold text-sm">{`${reply.userProfileId.firstName} ${reply.userProfileId.lastName}`}</h4>

                    <p className="text-gray-500 text-xs mb-2">
                      {reply.createdAt
                        ? new Date(reply.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : ""}{" "}
                      {/* Only render an empty string if createdAt is not available */}
                    </p>
                    <p>{reply.reply}</p>
                    {editingReplyId === reply._id ? (
                      <textarea
                        value={editingReplyContent}
                        onChange={(e) => setEditingReplyContent(e.target.value)}
                        className="w-full border border-black rounded-lg p-2"
                      />
                    ) : (
                      <p className="text-gray-700">{reply.content}</p>
                    )}
                  </div>
                  {reply.isOwner && (
                    <div className="flex space-x-2">
                      <div
                        className="w-4 h-4 rounded-full bg-[#BE142E] flex justify-center items-center cursor-pointer relative group"
                        onClick={(e) => {
                          openDeleteReplyModal(reply); // Open delete modal for the specific reply
                        }}
                      >
                        <span className="absolute top-full left-1/2 transform -translate-x-1/2 mb-1 bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100">
                          Delete
                        </span>
                      </div>
                      <div
                        className="w-4 h-4 rounded-full bg-[#3D3C3C] flex justify-center items-center cursor-pointer relative group"
                        onClick={() => handleEditReply(reply)}
                      >
                        <span className="absolute top-full left-1/2 transform -translate-x-1/2 mb-1 bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100">
                          Edit
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="mt-4">
                <textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  className="w-full border border-black h-[8vh] rounded-lg p-2"
                  placeholder="Add reply here..."
                />
                <button
                  onClick={handleCreateReply}
                  className="btn px-20 bg-[#1458BE] text-white"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
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
      {isNotifModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-64 sm:w-96">
            <h2 className="text-2xl mb-4">
              {selectedThread?.notifEnabled
                ? "Turn Off Notifications"
                : "Turn On Notifications"}
            </h2>
            <p>
              {selectedThread?.notifEnabled
                ? "Do you want to disable notifications for this thread?"
                : "Do you want to enable notifications for this thread?"}
            </p>
            <div className="flex justify-end mt-4">
              <button
                className="btn btn-sm w-24 bg-red text-white mr-2"
                onClick={handleNotif}
              >
                Yes
              </button>
              <button
                className="btn btn-sm w-24 bg-gray-500 text-white"
                onClick={() => setIsNotifModalOpen(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          {showErrorMessage && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red text-white p-4 rounded-lg shadow-lg z-[80]">
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
                  Post Thread
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminThreads;
