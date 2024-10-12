import React, { useState, useEffect } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression"; // Ensure you have this package installed
import "../../App.css"; // Adjust the path based on your project structure

function AdminAccount() {
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [accountEmail, setAccountEmail] = useState("");

  // Fetch profile data when the component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:6001/profile/userprofile", { withCredentials: true });
        const { firstName, lastName, accountEmail, profileImage } = response.data;

        // Populate form with fetched data
        setFirstName(firstName || "");
        setLastName(lastName || "");
        setAccountEmail(accountEmail || "");
        setProfileImage(profileImage || ""); // Store original profile image for display
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const options = {
          maxSizeMB: 1, // Limit to 1MB
          maxWidthOrHeight: 500, // Adjust dimensions to limit size
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfileImage(reader.result); // Set the base64 string of the compressed image
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Error compressing image:", error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "firstName":
        setFirstName(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "accountEmail":
        setAccountEmail(value);
        break;
      default:
        break;
    }
  };

  const handleSave = async (e) => {
    e.preventDefault(); // Prevent default form submission

    setShowErrorMessage(false);
    setShowValidationMessage(false);

    if (!firstName || !lastName) {
      setErrorMessage("First Name and Last Name are required.");
      setShowErrorMessage(true);
      setTimeout(() => {
          setShowErrorMessage(false);
      }, 3000);
      return; // Prevent submission
  }


    // Prepare updated data for submission
    const updatedData = {
      firstName,
      lastName,
      accountEmail,
      profileImage, // Base64 string if the image has been updated
    };

    try {
      // Update the profile with the provided data
      await axios.put("http://localhost:6001/profile/updateprofile", updatedData, {
        withCredentials: true,
      });

      setValidationMessage("Profile updated successfully!");
      setShowValidationMessage(true);
      setTimeout(() => {
        setShowValidationMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setErrorMessage("Error saving profile. Please try again.");
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 3000);
    }
  };

  return (
    <div className="admin-account">
      {showErrorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2  bg-red text-white p-4 rounded-lg shadow-lg z-50">
          <p>{errorMessage}</p>
        </div>
      )}
      {showValidationMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2  bg-green text-white p-4 rounded-lg shadow-lg z-50">
          <p>{validationMessage}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
        <div className="page-title text-xl py-4">Admin Account</div>

        <div className="py-1">
          <img src={profileImage} alt="Profile" className="h-40 w-40 border-2 mb-4" />
          <label className="pt-4 pb-2 text-sm">Profile Picture</label>
          <input
            type="file"
            className="file-input file-input-sm file-input-bordered text-xs w-full h-10 mt-2"
            onChange={handleImageChange}
            accept="image/*"
          />
        </div>

        <div className="py-1">
          <label className="pt-4 pb-2 text-sm">First Name *</label>
          <input
            type="text"
            placeholder="Type here"
            className="input input-sm input-bordered w-full h-10"
            required
            name="firstName"
            value={firstName}
            onChange={handleChange}
          />
        </div>

        <div className="py-1">
          <label className="pt-4 pb-2 text-sm">Last Name *</label>
          <input
            type="text"
            placeholder="Type here"
            className="input input-sm input-bordered w-full h-10"
            required
            name="lastName"
            value={lastName}
            onChange={handleChange}
          />
        </div>

        <div className="py-1">
          <label className="pt-4 pb-2 text-sm">Email *</label>
          <input
            type="email"
            placeholder="Type here"
            className="input input-sm input-bordered w-full h-10"
            required
            name="accountEmail"
            value={accountEmail}
            onChange={handleChange}
          />
        </div>

        <div className="flex mt-8 space-x-3">
        <div className="">
          <button className="btn md:w-64 w-52 bg-[#E58008] text-white">
            Reset Password
          </button>
        </div>
      </div>

      <div className="flex justify-center mt-16 space-x-3">
        <div className="">
          <button className="btn md:w-64 w-52 bg-fgray text-white">
            Cancel
          </button>
        </div>
        <div className="">
          <button className="btn md:w-64 w-52 bg-green text-white" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
      </form>
    </div>
  );
}

export default AdminAccount;
