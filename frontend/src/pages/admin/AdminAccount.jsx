import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../App.css"; // Adjust the path based on your project structure
import { useNavigate } from "react-router-dom";
import blankprofilepic from "../../assets/blankprofilepic.jpg";

function AdminAccount() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showValidationMessage2, setShowValidationMessage2] = useState(false);
  const [validationMessage2, setValidationMessage2] = useState("");
  const [showErrorMessage2, setShowErrorMessage2] = useState(false);
  const [errorMessage2, setErrorMessage2] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [initialAccountEmail, setInitialAccountEmail] = useState("");
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [profileId, setProfileId] = useState("");

  useEffect(() => {
    if (timer > 0 && otpSent) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer, otpSent]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  const sendOTP = async () => {
    if (!newEmail.trim()) {
      setErrorMessage2("Please fill up the required fields.");
      setShowErrorMessage2(true);
      setTimeout(() => setShowErrorMessage2(false), 3000);
      return;
    }

    if (newEmail.endsWith("@ust.edu.ph")) {
      setErrorMessage2("UST email is not allowed.");
      setShowErrorMessage2(true);
      setTimeout(() => setShowErrorMessage2(false), 3000);
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/profile/send-otp`,
        { newEmail },
        { withCredentials: true }
      );

      if (
        response.status === 200 &&
        response.data.msg === "OTP sent successfully"
      ) {
        setValidationMessage2("OTP sent successfully.");
        setShowValidationMessage2(true);
        setOtpSent(true);
        setTimer(300); // 5 minutes in seconds (300 seconds)
        setTimeout(() => setShowValidationMessage2(false), 3000);
      } else {
        setErrorMessage2("Failed to send OTP. Please try again.");
        setShowErrorMessage2(true);
        setTimeout(() => setShowErrorMessage2(false), 3000);
      }
    } catch (error) {
      console.error(
        "Error sending OTP:",
        error.response?.data || error.message
      );
      setErrorMessage2("Error sending OTP. Please try again.");
      setShowErrorMessage2(true);
      setTimeout(() => setShowErrorMessage2(false), 3000);
    }
  };

  const verifyOTPAndUpdateEmail = async () => {
    if (!newEmail.trim() || !otp.trim()) {
      setErrorMessage2("Please fill up the required fields.");
      setShowErrorMessage2(true);
      setTimeout(() => setShowErrorMessage2(false), 3000);
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/profile/verify-otp`,
        { newEmail, otp },
        { withCredentials: true }
      );

      // Check if the response status is 200
      if (response.status === 200 && response.data.success) {
        setNewEmail(""); // Clear new email input
        setOtp(""); // Clear OTP input
        setValidationMessage2(
          "Email changed successfully! Please log in using your new email."
        );
        setModalVisible(true);

        setIsEmailModalOpen(false);
        setAccountEmail(newEmail); // Update the account email
        setOtpSent(false);
        setTimer(0);
      } else {
        setErrorMessage2("Invalid OTP. Please try again.");
        setShowErrorMessage2(true);
        setTimeout(() => setShowErrorMessage2(false), 3000);
      }
    } catch (error) {
      console.error(
        "Error verifying OTP:",
        error.response?.data || error.message
      );
      setErrorMessage2("Invalid OTP. Please try again.");
      setShowErrorMessage2(true);
      setTimeout(() => setShowErrorMessage2(false), 3000);
    }
  };

  // Fetch profile data when the component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${backendUrl}/profile/userprofile`, {
          withCredentials: true,
        });
        const { firstName, lastName, accountEmail, profileImage } =
          response.data;

        // Populate form with fetched data
        setFirstName(firstName || "");
        setLastName(lastName || "");
        setAccountEmail(accountEmail || "");
        setInitialAccountEmail(accountEmail || "");
        setProfileImage(profileImage || blankprofilepic);
        setProfileId(profileId);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file); // Set the File object directly
    setImagePreview(URL.createObjectURL(file)); // Set preview URL for the selected image
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
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    if (profileImage) {
      formData.append("profileImage", profileImage); // Append the file directly
    }

    try {
      // Update the profile with the provided data
      await axios.put(`${backendUrl}/profile/updateprofile`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Fetch the updated profile image after successful upload
      const updatedProfile = await axios.get(
        `${backendUrl}/profile/userprofile`,
        {
          withCredentials: true,
        }
      );

      setProfileImage(updatedProfile.data.profileImage); // Update the image state with new image
      setImagePreview(null); // Clear the preview after upload

      // Show success message for profile update
      setValidationMessage("Profile updated successfully!");
      setShowValidationMessage(true);
      setTimeout(() => {
        setShowValidationMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Error saving profile:", error);

      // Check for specific error messages related to image uploads
      if (error.response && error.response.data.msg) {
        setErrorMessage(error.response.data.msg); // Display backend error message (like file size or format errors)
      } else {
        setErrorMessage("Error saving profile. Please try again.");
      }
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 3000);
    }
  };

  const handlePasswordSub = async (e) => {
    e.preventDefault();
    setErrorMessage2("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage2("All fields are required.");
      setShowErrorMessage2(true);
      setTimeout(() => setShowErrorMessage2(false), 3000);
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      setErrorMessage2("Password must meet the complexity requirements.");
      setShowErrorMessage2(true);
      setTimeout(() => setShowErrorMessage2(false), 3000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage2("New and Confirm Passwords do not match.");
      setShowErrorMessage2(true);
      setTimeout(() => setShowErrorMessage2(false), 3000);
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/profile/changepassword`,
        { oldPassword, newPassword }, // Include old password in the request
        { withCredentials: true }
      );

      if (response.status === 200) {
        setValidationMessage2(
          "Password changed successfully! Please log in using your new password."
        );
        setModalVisible(true);
        setIsPassModalOpen(false);
      } else {
        setErrorMessage2(response.data.error || "Failed to reset password.");
        setShowErrorMessage2(true);
        setTimeout(() => setShowErrorMessage2(false), 3000);
      }
    } catch (err) {
      console.error("Error resetting password:", err);

      // Check if error response from server exists and has a message
      if (err.response && err.response.data && err.response.data.error) {
        setErrorMessage2(err.response.data.error);
      } else {
        setErrorMessage2("Server error occurred.");
      }

      setShowErrorMessage2(true);
      setTimeout(() => setShowErrorMessage2(false), 3000);
    }
  };

  const handleExitModal = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/users/cancel`,
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error cancelling:", error);
    }
  };
  // Function to open the password modal
  const openPassModal = () => {
    setIsPassModalOpen(true);
  };

  // Function to close the password modal
  const closePassModal = () => {
    setIsPassModalOpen(false);
  };

  const openEmailModal = () => {
    setIsEmailModalOpen(true);
  };

  // Function to close the password modal
  const closeEmailModal = () => {
    setIsEmailModalOpen(false);
    setOtpSent(false);
    setTimer(0);
    setNewEmail("");
    setOtp("");
  };

  const handleDeleteProfileImage = async () => {
    try {
      await axios.delete(`${backendUrl}/profile/deleteProfileImage`, {
        withCredentials: true,
      });
      // Reset to the blank profile image and clear the preview
      setProfileImage(blankprofilepic);
      setValidationMessage("Profile image deleted successfully!");
      setShowValidationMessage(true);
      setImagePreview(null);
      setIsDeleteModalOpen(false); // Close the modal
      setTimeout(() => {
        setShowValidationMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Error deleting profile image:", error);
      setErrorMessage("Failed to delete profile image. Please try again.");
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
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
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-64 sm:w-96">
            <h2 className="text-2xl mb-4">Delete Profile Image</h2>
            <p>Are you sure you want to delete your Profile Image?</p>
            <div className="flex justify-end mt-4">
              <button
                className="btn btn-sm w-24 bg-red text-white mr-2"
                onClick={handleDeleteProfileImage} // Trigger the delete function
              >
                Delete
              </button>
              <button
                className="btn btn-sm w-24 bg-gray-500 text-white"
                onClick={() => setIsDeleteModalOpen(false)} // Close the modal on cancel
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12"
      >
        <div className="flex items-center mb-4">
          <h1 className="text-2xl font-medium text-gray-700">Admin Account</h1>
        </div>

        <div className="py-1">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Image Preview"
              className="h-40 w-40 border-2 mb-4"
            />
          ) : (
            <img
              src={
                profileImage === blankprofilepic
                  ? blankprofilepic
                  : `${backendUrl}${profileImage}`
              }
              alt="Profile"
              className="h-40 w-40 border-2 mb-4"
            />
          )}
          <div className="flex justify-between items-center pt-4">
            <label className="text-sm">Profile Picture</label>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-4 h-4 rounded-full bg-red flex justify-center items-center cursor-pointer"
            ></button>
          </div>

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
          <div className="py-1">
            <button
              type="button"
              className="btn md:w-64 w-52 bg-orange text-white" // Add a function to handle saving
              onClick={openEmailModal}
              aria-label="Save" // Added aria-label for accessibility
            >
              Change Account Email
            </button>
          </div>
        </div>
      </form>

      <div className="flex justify-center mt-4 space-x-3 mb-12">
        <button
          className="btn md:w-64 w-52 bg-green text-white"
          onClick={handleSave}
        >
          Save
        </button>
        <button
          onClick={openPassModal}
          className="btn md:w-64 w-52 bg-[#E58008] text-white"
        >
          Reset Password
        </button>
      </div>
      {/* Modal */}
      {modalVisible && (
        <dialog id="my_modal_5" className="modal modal-middle " open>
          <div className="modal-box">
            <p className="py-4">{validationMessage || validationMessage2}</p>

            <div className="modal-action">
              <button
                onClick={handleExitModal}
                className=" bg-green text-white py-2 px-4 rounded hover:bg-green"
              >
                OK
              </button>
            </div>
          </div>
        </dialog>
      )}
      {/* Password Modal */}
      {isPassModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          {showErrorMessage2 && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2  bg-red text-white p-4 rounded-lg shadow-lg z-50">
              <p>{errorMessage2}</p>
            </div>
          )}
          {showValidationMessage2 && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2  bg-green text-white p-4 rounded-lg shadow-lg z-50">
              <p>{validationMessage2}</p>
            </div>
          )}

          <div className="relative bg-white p-6 md:p-8 lg:p-12 rounded-lg w-full max-w-md md:max-w-3xl lg:max-w-4xl xl:max-w-5xl h-auto overflow-y-auto max-h-[90vh] mx-4">
            <button
              onClick={closePassModal}
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
                Old Password
              </label>
              <input
                type="password"
                name="oldPassword"
                placeholder="Old Password"
                className="input input-sm input-bordered w-full h-10"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                className="input input-sm input-bordered w-full h-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} // Add this line
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="input input-sm input-bordered w-full h-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} // Add this line
                required
              />
            </div>
            <p className="text-[0.6rem] mb-1 ml-2 sm:text-xs">
              Password Requirements:
            </p>
            <p className="text-[0.6rem] mt-1 ml-2 sm:text-xs">
              At least 8 characters long
            </p>
            <p className="text-[0.6rem] mt-1 ml-2 sm:text-xs">
              Must contain at least one uppercase letter (A-Z)
            </p>
            <p className="text-[0.6rem] mt-1 ml-2 sm:text-xs">
              Must contain at least one digit (0-9)
            </p>
            <p className="text-[0.6rem] mt-1 ml-2 sm:text-xs">
              Must include at least one special character (e.g., !, @, #, $, %,
              ^, &, *)
            </p>
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={handlePasswordSub}
                className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-green text-white px-4 py-2 md:px-6 md:py-3"
              >
                Save
              </button>
              <button
                className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-[#3D3C3C] text-white px-4 py-2 md:px-6 md:py-3"
                onClick={closePassModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          {/* Error and Validation Messages */}
          {showErrorMessage2 && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red text-white p-4 rounded-lg shadow-lg z-50">
              <p>{errorMessage2}</p>
            </div>
          )}
          {showValidationMessage2 && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green text-white p-4 rounded-lg shadow-lg z-50">
              <p>{validationMessage2}</p>
            </div>
          )}

          {/* Modal Content */}
          <div className="relative bg-white p-6 md:p-8 lg:p-12 rounded-lg w-full max-w-md md:max-w-3xl lg:max-w-4xl xl:max-w-5xl h-auto overflow-y-auto max-h-[90vh] mx-4">
            {/* Modal Body */}
            <div className="mb-4">
              <div className="block mb-2 text-sm font-medium">
                Updating Email Address
              </div>
              <div className="block mb-2 text-sm font-light">
                Update your account email address using the email OTP option.
              </div>
            </div>

            {/* Current Email Display */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">
                Current Account Email
              </label>
              <input
                type="email"
                className="input input-sm input-bordered w-full h-10"
                required
                name="accountEmail"
                value={accountEmail}
                readOnly
              />
            </div>

            {/* New Email Input and Send OTP Button */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">
                New Email *
              </label>
              <input
                type="email"
                placeholder="Type new email"
                className="input input-sm input-bordered w-full h-10"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)} // This captures user input
              />
              <button
                onClick={sendOTP}
                className="btn btn-sm mt-2 w-28 md:btn-md md:w-52 lg:w-60 bg-[#3D3C3C] text-white px-4 py-2 md:px-6 md:py-3"
              >
                Send OTP
              </button>
            </div>

            {otpSent && timer > 0 && (
              <div className="mb-4">
                <p className="text-left text-sm md:text-base">
                  OTP valid for: {formatTime(timer)}
                </p>
              </div>
            )}

            {/* OTP Input and Verify Button */}
            <div className="mb-2 mt-2">
              <label className="block mt-2 mb-2 text-sm font-medium">
                Enter OTP *
              </label>
              <input
                type="text"
                placeholder="Enter OTP"
                className="input input-sm input-bordered w-full h-10"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button
                onClick={sendOTP}
                className="btn btn-sm mt-1 w-28 md:btn-md md:w-52 lg:w-60 bg-[#BE142E] text-white px-4 py-2 md:px-6 md:py-3"
              >
                Resend OTP
              </button>
            </div>

            {/* Save and Cancel Buttons */}
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={verifyOTPAndUpdateEmail}
                className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-green text-white px-4 py-2 md:px-6 md:py-3"
              >
                Save
              </button>
              <button
                onClick={closeEmailModal}
                className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-[#3D3C3C] text-white px-4 py-2 md:px-6 md:py-3"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAccount;
