import React, { useState, useEffect, useRef } from "react";
import sampleidpic from "../../assets/sampleidpic.jpg";

function AdminThreads() {
  const [threads, setThreads] = useState([
    {
      id: 1,
      author: "Denise Valdivieso",
      img: sampleidpic,
      role: "Software Engineer",
      date: "June 5, 2024",
      title: "Capstone Help",
      replies: "999 replies",
      content: `We are currently doing a Capstone project and it is quite hard.
            Any tips on how to pass the Capstone project without having any
            stress? Thank you.`,
      active: false,
      posts: [
        {
          id: 1,
          post: "Post 1",
          img: sampleidpic,
          author: "James Santos",
          role: "Software Engineer",
          date: "June 5, 2024",
          content: "Hello world, this is the first post!",
          postType: "text",
        },
        {
          id: 2,
          post: "Post 2",
          img: sampleidpic,
          author: "Andrei Alvarico",
          role: "Software Engineer",
          date: "June 5, 2024",
          content: "Hello world, this is the first post!",
          postType: "text",
        },
        {
          id: 3,
          post: "Post 3",
          img: sampleidpic,
          author: "Alessandra Claire Cruz",
          role: "Software Engineer",
          date: "June 5, 2024",
          content: "Hello world, this is the first post!",
          postType: "text",
        },
      ],
    },
    {
      id: 2,
      img: sampleidpic,
      author: "Alessandra Claire Cruz",
      role: "Software Engineer",
      date: "June 5, 2024",
      title: "Blah Blah",
      replies: "999 replies",
      content: `Blah Blah Blah`,
      active: true,
      posts: [
        {
          id: 1,
          post: "Post 1",
          img: sampleidpic,
          author: "Andrei Alvarico",
          role: "Software Engineer",
          date: "June 5, 2024",
          content: "Luh!",
          postType: "text",
        },
        {
          id: 2,
          post: "Post 2",
          img: sampleidpic,
          author: "Denise Valdivieso",
          role: "Software Engineer",
          date: "June 5, 2024",
          content: "Hello world, this is the first post!",
          postType: "text",
        },
        {
          id: 3,
          post: "Post 3",
          img: sampleidpic,
          author: "James Santos",
          role: "Software Engineer",
          date: "June 5, 2024",
          content: "Hello world, this is the first post!",
          postType: "text",
        },
      ],
    },
  ]);

  const [selectedThread, setSelectedThread] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditReplyModalOpen, setIsEditReplyModalOpen] = useState(false);
  const [selectedReply, setSelectedReply] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState(null);
  const [isDeleteReplyModalOpen, setIsDeleteReplyModalOpen] = useState(false);
  const [posts, setPosts] = useState([{ postText: "", postType: "text" }]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAddReply, setshowAddReply] = useState(false);
  const [deleteConfirmationMessage, setDeleteConfirmationMessage] =
    useState("");

  const modalRef = useRef(null);

  const openViewModal = (thread) => {
    setSelectedThread(thread);
    setIsViewModalOpen(true);
  };

  const openEditModal = (thread) => {
    setSelectedThread(thread);
    setPosts(
      thread.posts.map((post) => ({
        ...post,
      }))
    );
    setIsEditModalOpen(true);
  };

  const openEditReplyModal = (thread, reply) => {
    setSelectedThread(thread);
    setSelectedReply(reply);
    setIsEditReplyModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedThread(null);
    setPosts([{ postText: "", postType: "text" }]);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setSelectedThread(null);
  };

  const closeEditReplyModal = () => {
    setIsEditReplyModalOpen(false);
  };

  const closeDeleteModal = () => {
    setIsDeleteReplyModalOpen(false);
    setIsViewModalOpen(true);
    setSelectedReply(null);
  };

  const handlePostChange = (postIndex, value) => {
    const newPosts = [...posts];
    newPosts[postIndex].postText = value;
    setPosts(newPosts);
  };

  const handleDeleteThread = (thread) => {
    setThreadToDelete(thread);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (threadToDelete) {
      setThreads((prevThreads) =>
        prevThreads.filter((thread) => thread.id !== threadToDelete.id)
      );
      setDeleteConfirmationMessage("Thread deleted successfully!");
      setThreadToDelete(null);
      setTimeout(() => {
        setDeleteConfirmationMessage("");
      }, 2000);
    }
    setIsDeleteModalOpen(false);
  };

  const handleToggleThread = (id) => {
    setThreads((prevThreads) =>
      prevThreads.map((thread) =>
        thread.id === id ? { ...thread, active: !thread.active } : thread
      )
    );
  };

  const handleDeleteReply = () => {
    if (!selectedThread || !selectedReply) return;

    const updatedThreads = threads.map((thread) => {
      if (thread.id === selectedThread.id) {
        return {
          ...thread,
          posts: thread.posts.filter((post) => post.id !== selectedReply.id),
        };
      }
      return thread;
    });

    setThreads(updatedThreads);

    setSelectedThread((prevThread) => ({
      ...prevThread,
      posts: prevThread.posts.filter((post) => post.id !== selectedReply.id),
    }));

    setDeleteConfirmationMessage("Reply deleted successfully!");

    setTimeout(() => {
      setDeleteConfirmationMessage("");
    }, 2000); // Message will disappear after 2 seconds

    closeDeleteModal();
  };

  const renderPostContent = (post, index, isActive) => {
    return (
      <div key={index} className="mb-4 space-y-4 max-h-64 overflow-y-auto">
        <div className="p-4 border border-black rounded-lg flex items-start mb-2">
          <img src={post.img} alt="User Avatar" className="w-10 h-10 mr-3" />
          <div className="flex-grow">
            <h4 className="font-semibold text-sm">{post.author}</h4>
            <p className="text-gray-500 text-xs mb-2">
              {post.role}• Posted on {post.date}
            </p>
            <p className="text-gray-700">{post.content}</p>
          </div>
          {!isActive && ( // Conditionally render edit and delete buttons
            <div className="flex justify-end mt-2">
              <div
                className="w-4 h-4 rounded-full bg-[#BE142E] flex justify-center items-center cursor-pointer mr-2 relative group"
                onClick={() => {
                  setSelectedReply(post);
                  setIsDeleteReplyModalOpen(true);
                }}
              >
                <span className="hidden group-hover:block absolute top-5 bg-gray-700 text-white text-xs rounded px-2 py-1">
                  Delete
                </span>
              </div>

              <div
                className="w-4 h-4 rounded-full bg-[#3D3C3C] flex justify-center items-center cursor-pointer mr-2 relative group"
                onClick={() => openEditReplyModal(selectedThread, post)}
              >
                <span className="hidden group-hover:block absolute top-5 bg-gray-700 text-white text-xs rounded px-2 py-1">
                  Edit
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleSave = () => {
    setThreads((prevThreads) =>
      prevThreads.map((thread) =>
        thread.id === selectedThread.id
          ? {
              ...thread,
              title: selectedThread.title,
              content: selectedThread.content,
              posts: posts.map((post) => ({
                ...post,
              })),
            }
          : thread
      )
    );
    setShowConfirmation(true);
    closeModal();

    setTimeout(() => {
      setShowConfirmation(false);
    }, 2000);
  };
  const handleAddPost = () => {
    if (posts.length === 1 && posts[0].postText === "") return;
    setPosts([{ postText: "", postType: "text" }]);
  };
  const handleReplySave = () => {
    setThreads((prevThreads) =>
      prevThreads.map((thread) =>
        thread.id === selectedThread.id
          ? {
              ...thread,
              posts: thread.posts.map((post) =>
                post.content === selectedReply.content ? selectedReply : post
              ),
            }
          : thread
      )
    );
    setShowConfirmation(true);
    closeEditReplyModal();

    setTimeout(() => {
      setShowConfirmation(false);
    }, 2000); // Adjust the delay as needed
  };

  const inactiveThreads = threads
    .filter((thread) => !thread.active)
    .filter((thread) =>
      thread.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const activeThreads = threads
    .filter((thread) => thread.active)
    .filter((thread) =>
      thread.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
      isEditReplyModalOpen
    ) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isViewModalOpen, isEditModalOpen, isAddModalOpen, isEditReplyModalOpen]);

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
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
        <div className="text-lg">My Posts</div>
        <button
          className="btn btn-sm w-36 bg-green text-white"
          onClick={openAddModal}
        >
          +
        </button>
      </div>
      <hr className="mb-6 border-black" />
      {inactiveThreads.map((thread, index) => (
        <div
          key={index}
          className="mb-4 p-4 border border-black rounded-lg flex justify-between cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => openViewModal(thread)}
        >
          <div>
            <div className="text-md font-medium mb-1">{thread.title}</div>
            <div className="text-sm text-black-600">{thread.replies}</div>
          </div>
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-full bg-[#BE142E] flex justify-center items-center cursor-pointer mr-2 relative group"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteThread(thread);
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
      ))}
      <div className="text-lg mb-4">All Threads</div>
      <hr className="mb-6 border-black" />
      {activeThreads.map((thread) => (
        <div
          key={thread.id}
          className="mb-4 p-4 border border-black rounded-lg flex justify-between cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => openViewModal(thread)}
        >
          <div>
            <div className="text-md font-medium mb-1">{thread.title}</div>
            <div className="text-sm text-black-600">{thread.replies}</div>
          </div>
        </div>
      ))}
      {isViewModalOpen && selectedThread && (
        <div
          ref={modalRef}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white p-6 md:p-8 lg:p-12 rounded-lg w-full max-w-md md:max-w-3xl lg:max-w-4xl xl:max-w-5xl h-auto overflow-y-auto max-h-[90vh] relative mx-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <img
                  src={selectedThread.img}
                  alt="User Avatar"
                  className="w-14 h-14 mr-3"
                />
                <div>
                  <h2 className="text-xl font-semibold">
                    {selectedThread.author}
                  </h2>
                  <p className="text-gray-500">{selectedThread.role}</p>
                  <p className="text-gray-400 text-sm">
                    Posted on {selectedThread.date}.
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

            <div className="border-b border-black mb-4 pb-2">
              <h3 className="text-lg font-medium">{selectedThread.title}</h3>
              <p className="mt-2 text-black">{selectedThread.content}</p>
            </div>
            <div className="text-sm mb-4">Replies</div>
            {selectedThread.posts.map((post, index) => (
              <div key={index} className="mb-4">
                {renderPostContent(post, index, selectedThread.active)}
              </div>
            ))}

            <div className="mt-4">
              <textarea
                className="w-full border border-black h-[8vh] rounded-lg p-2"
                placeholder="Add reply here..."
                rows="3"
              ></textarea>
              <button
                className="btn px-20 bg-[#1458BE] text-white"
                onClick={() => {
                  setshowAddReply(true);
                  setTimeout(() => {
                    setshowAddReply(false);
                  }, 2000);
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      {isEditModalOpen && selectedThread && (
        <div
          ref={modalRef}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        >
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
              <label className="block mb-2 text-sm font-medium">
                Edit Discussion Title
              </label>
              <input
                type="text"
                className="w-full border border-black rounded-lg px-4 py-2 mb-4 mt-4"
                value={selectedThread.title}
                onChange={(e) =>
                  setSelectedThread({
                    ...selectedThread,
                    title: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">
                Edit Discussion Content
              </label>
              <textarea
                className="w-full border border-black rounded-lg px-4 py-2 h-64"
                value={selectedThread.content}
                onChange={(e) =>
                  setSelectedThread({
                    ...selectedThread,
                    content: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <button
                className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-green text-white px-4 py-2 md:px-6 md:py-3"
                onClick={handleSave} // Updated handler
              >
                Save
              </button>
              <button
                className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-[#3D3C3C] text-white px-4 py-2 md:px-6 md:py-3"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isEditReplyModalOpen && selectedReply && (
        <div
          ref={modalRef}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-2xl mb-4">Edit Reply</h2>
            <textarea
              className="w-full border border-black rounded-lg px-4 py-2"
              value={selectedReply.content}
              onChange={(e) =>
                setSelectedReply({
                  ...selectedReply,
                  content: e.target.value,
                })
              }
            />
            <div className="flex justify-center gap-2 mt-4">
              <button
                className="btn btn-sm w-24 bg-green text-white mr-2"
                onClick={handleReplySave}
              >
                Save
              </button>
              <button
                className="btn btn-sm w-24 bg-gray-500 text-white"
                onClick={closeEditReplyModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        >
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
              <label className="block mb-1 text-sm font-light">
                Discussion Title
              </label>
              <input
                type="text"
                className="w-full border border-black rounded-lg px-4 py-2 mb-4 mt-4"
                value={selectedThread ? selectedThread.title : ""}
                onChange={(e) =>
                  setSelectedThread({
                    ...selectedThread,
                    title: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-light">
                Discussion Content
              </label>
              <div className="mb-4">
                <textarea
                  className="w-full border border-black rounded-lg px-4 py-2 h-64"
                  value={posts[0].postText}
                  onChange={(e) => handlePostChange(0, e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <button
                className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-green text-white px-4 py-2 md:px-6 md:py-3"
                onClick={() => {
                  setThreads([
                    ...threads,
                    {
                      id: threads.length + 1,
                      author: "Alessandra Claire Cruz",
                      img: sampleidpic,
                      role: "Software Engineer",
                      date: "June 5,2024",
                      title: selectedThread.title,
                      replies: "0 replies",
                      active: false,
                      posts: [],
                    },
                    {
                      id: threads.length + 1,
                      author: "Alessandra Claire Cruz",
                      img: sampleidpic,
                      role: "Software Engineer",
                      date: "June 5,2024",
                      title: selectedThread.title,
                      replies: "0 replies",
                      active: true,
                      posts: [],
                    },
                  ]);
                  setShowConfirmation(true);
                  closeModal();
                  setTimeout(() => {
                    setShowConfirmation(false);
                  }, 2000);
                }}
              >
                Add
              </button>
              <button
                className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-[#3D3C3C] text-white px-4 py-2 md:px-6 md:py-3"
                onClick={closeModal}
              >
                Cancel
              </button>
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
                className="btn btn-sm w-24 bg-red text-white mr-2"
                onClick={handleConfirmDelete}
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
      {isDeleteReplyModalOpen && selectedReply && (
        <div
          ref={modalRef}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-64 sm:w-96">
            <h2 className="text-2xl mb-4">Delete Reply</h2>
            <p>Are you sure you want to delete this reply?</p>
            <div className="flex justify-end mt-4">
              <button
                className="btn btn-sm w-24 bg-red text-white mr-2"
                onClick={handleDeleteReply}
              >
                Delete
              </button>
              <button
                className="btn btn-sm w-24 bg-gray-500 text-white"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirmation && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green text-white p-4 rounded-lg shadow-lg">
          <p> Saved successfully!</p>
        </div>
      )}
      {showAddReply && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green text-white p-4 rounded-lg shadow-lg">
          <p> Reply Sent!</p>
        </div>
      )}
      {deleteConfirmationMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red text-white p-4 rounded-lg shadow-lg">
          {deleteConfirmationMessage}
        </div>
      )}
    </div>
  );
}

export default AdminThreads;
