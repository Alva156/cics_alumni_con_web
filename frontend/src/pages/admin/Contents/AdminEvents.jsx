import React, { useState, useEffect, useRef } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";

function AdminEvents() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [selectedEvents, setSelectedEvents] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState([]);
  const [sortCriteria, setSortCriteria] = useState("Name (A-Z)");
  const modalRef = useRef(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showSuccessMessage, setSuccessMessage] = useState(false);
  const [showErrorMessage, setErrorMessage] = useState(false);
  const [showMessage, setshowMessage] = useState("");

  // Fetch all events from the server
  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${backendUrl}/events/view`, {
        withCredentials: true,
      });
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openViewModal = (events) => {
    setSelectedEvents(events);
    setIsViewModalOpen(true);
  };

  const openEditModal = (events) => {
    setSelectedEvents(events);
    setIsEditModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedEvents(null);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setSelectedEvents(null);
  };

  const handleDeleteEvents = async () => {
    if (!selectedEvents) {
      console.log("No events selected for deletion.");
      return;
    }

    console.log("Deleting events with ID:", selectedEvents._id); // Debugging line

    try {
      const response = await axios.delete(
        `${backendUrl}/events/delete-events/${selectedEvents._id}`,
        { withCredentials: true }
      );

      console.log("Delete response:", response.data); // Debugging line
      fetchEvents(); // Refresh events list
      closeModal(); // Close modal after deleting
      setshowMessage("Events deleted successfully!");
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Error deleting events:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleUpdateEvents = async () => {
    if (!selectedEvents) return;

    if (
      !selectedEvents.name ||
      !selectedEvents.address ||
      !selectedEvents.description ||
      !selectedEvents.contact
    ) {
      setshowMessage("Please fill in all required fields.");
      setErrorMessage(true);
      setTimeout(() => setErrorMessage(false), 3000);
      return;
    }

    const eventData = new FormData();
    eventData.append("name", selectedEvents.name);
    eventData.append("address", selectedEvents.address);
    eventData.append("description", selectedEvents.description);
    eventData.append("contact", selectedEvents.contact);

    const image = document.getElementById("events-image").files[0];
    if (image) {
      eventData.append("image", image);
    }

    try {
      const response = await axios.put(
        `${backendUrl}/events/update-events/${selectedEvents._id}`,
        eventData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === selectedEvents._id ? response.data : event
        )
      );

      closeModal();
      setshowMessage("Events updated successfully!");
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating events:", error);
      if (error.response) {
        setshowMessage(error.response.data.msg); // Display error message from backend
        setErrorMessage(true);
        setTimeout(() => setErrorMessage(false), 3000);
      }
    }
  };

  const handleCreateEvents = async () => {
    const eventData = new FormData();
    eventData.append("name", document.getElementById("events-name").value);
    eventData.append(
      "address",
      document.getElementById("events-address").value
    );
    eventData.append(
      "description",
      document.getElementById("events-description").value
    );
    eventData.append(
      "contact",
      document.getElementById("events-contact").value
    );

    const image = document.getElementById("events-image").files[0];
    if (image) {
      eventData.append("image", image); // Add the image to formData
    }

    if (
      !eventData.get("name") ||
      !eventData.get("address") ||
      !eventData.get("description") ||
      !eventData.get("contact")
    ) {
      setshowMessage("Please fill in all required fields.");
      setErrorMessage(true);
      setTimeout(() => setErrorMessage(false), 3000);
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/events/create-events`,
        eventData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setEvents([...events, response.data]);
      closeModal();
      setshowMessage("Events created successfully!");
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);

      // Reset input fields if necessary
      document.getElementById("events-name").value = "";
      document.getElementById("events-address").value = "";
      document.getElementById("events-description").value = "";
      document.getElementById("events-contact").value = "";
    } catch (error) {
      console.error("Error creating events:", error);
      if (error.response) {
        setshowMessage(error.response.data.msg);
        setErrorMessage(true);
        setTimeout(() => setErrorMessage(false), 3000);
      }
    }
  };

  const filteredEvents = events.filter((events) =>
    events.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort events based on selected criteria
  const sortedEvents = filteredEvents.sort((a, b) => {
    if (sortCriteria === "Name (A-Z)") {
      return a.name.localeCompare(b.name);
    } else if (sortCriteria === "Name (Z-A)") {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green text-white p-4 rounded-lg shadow-lg z-50">
          <p>{showMessage}</p>
        </div>
      )}

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search Events"
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
        <div className="text-lg">My Listed Events</div>
        <button
          className="btn btn-sm w-36 bg-green text-white relative"
          onClick={openAddModal}
        >
          +
        </button>
      </div>

      <hr className="mb-6 border-black" />

      {filteredEvents.map((events) => (
        <div
          key={events._id}
          className="mb-4 p-4 border border-black rounded-lg flex justify-between items-center hover:bg-gray-200 transition-colors cursor-pointer"
          onClick={() => openViewModal(events)}
        >
          <div>
            <div className="text-md font-medium mb-1">{events.name}</div>
            <div className="text-sm text-black-600">{events.address}</div>
          </div>
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-full bg-[#BE142E] flex justify-center items-center cursor-pointer mr-4 relative group"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEvents(events); // Set the events to delete
                setIsDeleteModalOpen(true); // Open the delete modal
              }}
            >
              <span className="hidden group-hover:block absolute bottom-8 bg-gray-700 text-white text-xs rounded px-2 py-1">
                Delete
              </span>
            </div>
            <div
              className="w-4 h-4 rounded-full bg-[#3D3C3C] flex justify-center items-center cursor-pointer relative group"
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(events);
              }}
            >
              <span className="hidden group-hover:block absolute bottom-8 bg-gray-700 text-white text-xs rounded px-2 py-1">
                Edit
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* View Modal */}
      {isViewModalOpen && selectedEvents && (
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
              {selectedEvents.name}
            </div>
            <div className="text-md mb-2">{selectedEvents.address}</div>
            <img
              src={`${backendUrl}${selectedEvents.image}`}
              alt={selectedEvents.name}
              className="mb-4 w-full h-48 md:h-64 lg:h-80 object-cover rounded"
            />
            <div className="text-sm mb-4">{selectedEvents.description}</div>
            <div className="text-sm font-medium mb-2">Contact Details</div>
            <a
              href={`mailto:${selectedEvents.contact}`}
              className="block text-sm text-blue-600 underline"
            >
              {selectedEvents.contact}
            </a>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedEvents && (
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
            <button
              className="absolute top-4 right-4 text-black text-2xl"
              onClick={closeModal}
            >
              &times;
            </button>
            <div className="text-xl mb-3">Edit Events</div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Events Name</label>
              <input
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Events Name"
                value={selectedEvents.name}
                onChange={(e) =>
                  setSelectedEvents({
                    ...selectedEvents,
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
                value={selectedEvents.address}
                onChange={(e) =>
                  setSelectedEvents({
                    ...selectedEvents,
                    address: e.target.value,
                  })
                }
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">Events Image</label>
              <input
                id="events-image"
                type="file"
                accept="image/*"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">Description</label>
              <textarea
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                value={selectedEvents.description}
                onChange={(e) =>
                  setSelectedEvents({
                    ...selectedEvents,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Contact</label>
              <input
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                value={selectedEvents.contact}
                onChange={(e) =>
                  setSelectedEvents({
                    ...selectedEvents,
                    contact: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-4 mb-4">
              <button
                className="btn bg-zinc-800 text-white w-full md:w-64 py-2 rounded-lg"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateEvents}
                className="btn bg-green text-white w-full md:w-64 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-64 sm:w-96">
            <h2 className="text-2xl mb-4">Delete Events</h2>
            <p>Are you sure you want to delete this events?</p>
            <div className="flex justify-end mt-4">
              <button
                className="btn btn-sm w-24 bg-red text-white mr-2"
                onClick={() => {
                  handleDeleteEvents(); // Call the delete function
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
            <button
              className="absolute top-4 right-4 text-black text-2xl"
              onClick={closeModal}
            >
              &times;
            </button>
            <div className="text-xl mb-3">Add New Events</div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Events Name</label>
              <input
                id="events-name"
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter Events Name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Address</label>
              <input
                id="events-address"
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter Events Address"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Events Image</label>
              <input
                id="events-image"
                type="file"
                accept="image/*"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Description</label>
              <textarea
                id="events-description"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter Events Description"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Contact Details</label>
              <input
                id="events-contact"
                type="text"
                className="w-full border border-black bg-gray-100 rounded-lg px-4 py-1 text-sm"
                placeholder="Enter Events Details"
              />
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-4 mb-4">
              <button
                className="btn bg-zinc-800 text-white w-full md:w-64 py-2 rounded-lg"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="btn bg-green text-white w-full md:w-64 py-2 rounded-lg"
                onClick={handleCreateEvents}
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

export default AdminEvents;
