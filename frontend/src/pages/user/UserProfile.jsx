import React, { useState, useEffect } from "react";
import "../../App.css";
import axios from "axios";
import { uniqueId } from "lodash"; // Make sure you import uniqueId
import imageCompression from "browser-image-compression";
import { useNavigate } from "react-router-dom";
import profilesymbol from "../../assets/userprofile.png";
import blankprofilepic from "../../assets/blankprofilepic.jpg";

function UserProfile() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [profession, setProfession] = useState("");
  const [collegeProgram, setCollegeProgram] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [yearStartedCollege, setYearStartedCollege] = useState("");
  const [yearGraduatedCollege, setYearGraduatedCollege] = useState("");
  const [timeToJob, setTimeToJob] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [workIndustry, setWorkIndustry] = useState("");
  const [professionAlignment, setProfessionAlignment] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [placeOfEmployment, setPlaceOfEmployment] = useState("");
  const [linkedIn, setLinkedIn] = useState(""); // Fixed state name here
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otherContact, setOtherContact] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [accountEmail, setAccountEmail] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [initialAccountEmail, setInitialAccountEmail] = useState("");
  const [profileId, setProfileId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);

  const [secondaryEducationSections, setSecondaryEducationSections] = useState([
    { schoolName: "", yearStarted: "", yearEnded: "" },
  ]);
  const [tertiaryEducationSections, setTertiaryEducationSections] = useState([
    { schoolName: "", program: "", yearStarted: "", yearEnded: "" },
  ]);

  const [companySections, setCompanySections] = useState([
    {
      id: uniqueId(),
      companyName: "",
      position: "",
      yearStarted: "",
      yearEnded: "",
    },
  ]);

  // Initialize attachments state
  const [attachments, setAttachments] = useState([
    { id: uniqueId(), filename: "", filepath: "" },
  ]);

  // Handler for file selection

  // Update attachments state after file upload
  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      axios
        .post(`${backendUrl}/profile/uploadattachment`, formData, {
          withCredentials: true,
        })
        .then((response) => {
          if (
            response.data &&
            response.data.filename &&
            response.data.filepath
          ) {
            const newAttachments = [...attachments];
            newAttachments[index] = {
              id: uniqueId(),
              filename: response.data.filename,
              filepath: response.data.filepath,
            };
            setAttachments(newAttachments);
          } else {
            console.error("Unexpected response format:", response.data);
          }
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
        });
    }
  };

  // Function to add a new attachment field
  const addAttachment = () => {
    setAttachments((prev) => [
      ...prev,
      { id: uniqueId(), fileName: "", filePath: "" },
    ]);
  };

  const handleAttachmentChange = async (e, id) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post(
          `${backendUrl}/uploadAttachment`,
          formData,
          {
            withCredentials: true,
          }
        );

        // Add the response data (which includes fileName and filePath) to the attachments state
        setAttachments((prev) => [
          ...prev,
          {
            id: response.data.id,
            fileName: response.data.fileName,
            filePath: response.data.filePath,
            file: null,
          },
        ]);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  const addSecondaryEducationSection = () => {
    setSecondaryEducationSections([
      ...secondaryEducationSections,
      { schoolName: "", yearStarted: "", yearEnded: "" },
    ]);
  };

  const addTertiaryEducationSection = () => {
    setTertiaryEducationSections([
      ...tertiaryEducationSections,
      { schoolName: "", program: "", yearStarted: "", yearEnded: "" },
    ]);
  };

  const addCompanySection = () => {
    setCompanySections([
      ...companySections,
      {
        id: uniqueId(),
        companyName: "",
        position: "",
        yearStarted: "",
        yearEnded: "",
      },
    ]);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file); // Set the File object directly
    setImagePreview(URL.createObjectURL(file)); // Set preview URL for the selected image
  };

  const handleSectionChange = (sectionType, sectionId, e) => {
    const { name, value } = e.target;

    if (sectionType === "secondary") {
      setSecondaryEducationSections((prevSections) =>
        prevSections.map((section) =>
          section._id === sectionId ? { ...section, [name]: value } : section
        )
      );
    } else if (sectionType === "tertiary") {
      setTertiaryEducationSections((prevSections) =>
        prevSections.map((section) =>
          section._id === sectionId ? { ...section, [name]: value } : section
        )
      );
    } else if (sectionType === "company") {
      setCompanySections((prevSections) =>
        prevSections.map((section) =>
          section._id === sectionId ? { ...section, [name]: value } : section
        )
      );
    }
  };

  const initiateDeleteSection = (sectionType, sectionId) => {
    setIsDeleteModalOpen(true); // Open the modal
    setSectionToDelete({ sectionType, sectionId }); // Store the section type and ID
  };

  const handleDeleteSection = async () => {
    if (!sectionToDelete) {
      return;
    }

    const { sectionType, sectionId } = sectionToDelete;

    console.log("Delete button clicked");
    console.log("Section ID in function:", sectionId);

    if (!profileId || !sectionId) {
      console.log("Profile ID or Section ID is missing.");
      return;
    }

    try {
      // Call the DELETE endpoint to remove the section from the database
      const deleteResponse = await axios.delete(
        `${backendUrl}/profile/${sectionType}/${profileId}/${sectionId}`,
        { withCredentials: true }
      );

      console.log("Delete response:", deleteResponse);

      if (deleteResponse.status === 200) {
        // Update the frontend state after successful deletion
        if (sectionType === "company-section") {
          setCompanySections((prevSections) =>
            prevSections.filter((section) => section._id !== sectionId)
          );
        } else if (sectionType === "secondary-section") {
          setSecondaryEducationSections((prevSections) =>
            prevSections.filter((section) => section._id !== sectionId)
          );
        } else if (sectionType === "tertiary-section") {
          setTertiaryEducationSections((prevSections) =>
            prevSections.filter((section) => section._id !== sectionId)
          );
        }

        // Set validation message for successful deletion
        setValidationMessage("Profile updated successfully!");
        setShowValidationMessage(true); // Show the validation message

        setTimeout(() => {
          setShowValidationMessage(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error deleting section:", error);
      alert(
        `Failed to delete ${sectionType.replace("-", " ")}. Please try again.`
      );
    }

    // Close the modal and clear the sectionToDelete
    setIsDeleteModalOpen(false);
    setSectionToDelete(null);
  };

  const handleSave = async (e) => {
    e.preventDefault(); // Prevent default form submission
    console.log("saved");

    await handleSubmit(e); // Call the handleSubmit function to save the form data
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault(); // Prevent default form submission

    // Validate required fields
    if (!firstName || !lastName) {
      setValidationMessage("First Name and Last Name are required.");
      setShowValidationMessage(true);
      setTimeout(() => setShowValidationMessage(false), 3000);
      return; // Prevent submission
    }

    // Reset error messages when inputs are valid
    setShowErrorMessage(false);

    const userData = {
      firstName,
      lastName,
      birthday,
      profession,
      accountEmail,
      collegeProgram,
      specialization,
      yearStartedCollege,
      yearGraduatedCollege,
      timeToJob,
      employmentStatus,
      workIndustry,
      professionAlignment,
      maritalStatus,
      salaryRange,
      placeOfEmployment,
      secondaryEducation: secondaryEducationSections,
      tertiaryEducation: tertiaryEducationSections,
      careerBackground: companySections,
      contactInformation: {
        linkedIn,
        facebook,
        instagram,
        email,
        mobileNumber,
        other: otherContact,
      },
    };

    const formData = new FormData();
    attachments.forEach((attachment) => {
      if (attachment.file) { // Ensure attachment.file exists
        formData.append("attachments", attachment.file); // Assuming each attachment has a `file` property
      }
    });

    if(profileImage){
      formData.append("profileImage", profileImage);
    }

    try {
      // Check if the profile exists
      await axios.get(`${backendUrl}/profile/userprofile`, {
        withCredentials: true,
      });

      // Update the existing profile
      await axios.put(`${backendUrl}/profile/updateprofile`, userData, {
        withCredentials: true,
      });

      await axios.put(`${backendUrl}/profile/updateprofile`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Re-fetch the profile to ensure we have the latest data
      const updatedProfileResponse = await axios.get(
        `${backendUrl}/profile/userprofile`,
        {
          withCredentials: true,
        }
      );

      const updatedProfile = await axios.get(
        `${backendUrl}/profile/userprofile`,
        {
          withCredentials: true,
        }
      );
      
      setProfileImage(updatedProfile.data.profileImage); // Update the image state with new image
      setImagePreview(null); // Clear the preview after upload
      // Update state with the newly fetched data
      setCompanySections(updatedProfileResponse.data.careerBackground || []);
      setSecondaryEducationSections(
        updatedProfileResponse.data.secondaryEducation || []
      );
      setTertiaryEducationSections(
        updatedProfileResponse.data.tertiaryEducation || []
      );
     

      // Check if the email has changed
      if (accountEmail !== initialAccountEmail) {
        setShowValidationMessage(false);
        setValidationMessage(
          "Email changed successfully! Please log in using your new email."
        );
        setModalVisible(true); // Show modal
      } else {
        // Only show the success message if the email has NOT changed
        setValidationMessage("Profile updated successfully!");
        setShowValidationMessage(true);
        setTimeout(() => {
          setShowValidationMessage(false);
        }, 3000);
      }

      console.log("Profile updated successfully!");
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Create a new profile if it doesn't exist
        await axios.post(`${backendUrl}/profile/createprofile`, userData, {
          withCredentials: true,
        });
        console.log("Profile created successfully!");
        setValidationMessage("Profile created successfully!");
      } else {
        // Handle errors during save
        console.error(
          "Error saving profile:",
          error.response ? error.response.data : error.message
        );
        setErrorMessage("Error saving profile. Please try again.");
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 3000);
      }
    }

    // Validation message for successful save (if email has not changed)
    if (accountEmail === initialAccountEmail) {
      setShowValidationMessage(true);
      setTimeout(() => setShowValidationMessage(false), 3000);
    }
  };

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${backendUrl}/profile/userprofile`, {
          withCredentials: true,
        });
        const profileData = response.data;

        if (profileData) {
          // Populate form fields with fetched profile data
          setFirstName(profileData.firstName || "");
          setLastName(profileData.lastName || "");
          setProfession(profileData.profession || "");
          setCollegeProgram(profileData.collegeProgram || "");
          setSpecialization(profileData.specialization || "");
          setYearStartedCollege(profileData.yearStartedCollege || "");
          setYearGraduatedCollege(profileData.yearGraduatedCollege || "");
          setTimeToJob(profileData.timeToJob || "");
          setEmploymentStatus(profileData.employmentStatus || "");
          setWorkIndustry(profileData.workIndustry || "");
          setProfessionAlignment(profileData.professionAlignment || "");
          setMaritalStatus(profileData.maritalStatus || "");
          setSalaryRange(profileData.salaryRange || "");
          setPlaceOfEmployment(profileData.placeOfEmployment || "");
          setLinkedIn(profileData.contactInformation?.linkedIn || "");
          setFacebook(profileData.contactInformation?.facebook || "");
          setInstagram(profileData.contactInformation?.instagram || "");
          setEmail(profileData.contactInformation?.email || "");
          setAccountEmail(profileData.accountEmail || "");
          setMobileNumber(profileData.contactInformation?.mobileNumber || "");
          setOtherContact(profileData.contactInformation?.other || "");
          setProfileImage(profileData.profileImage || blankprofilepic);
          setInitialAccountEmail(profileData.accountEmail || "");

          setProfileId(profileData._id);

          // Set education and company sections
          setSecondaryEducationSections(profileData.secondaryEducation || []);
          setTertiaryEducationSections(profileData.tertiaryEducation || []);
          setCompanySections(profileData.careerBackground || []);
          setAttachments(profileData.attachments || []); // Fetch attachments

          // Convert birthday to "yyyy-MM-dd" format if available
          if (profileData.birthday) {
            const birthdayDate = new Date(profileData.birthday)
              .toISOString()
              .substring(0, 10);
            setBirthday(birthdayDate);
          }
        } else {
          console.error("User profile not found");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchProfile();
  }, [backendUrl]);

  const handlePasswordSub = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!newPassword || !confirmPassword) {
      setErrorMessage("All fields are required.");
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      setErrorMessage("Password must meet the complexity requirements.");
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/profile/changepassword`,
        { newPassword }, // Only new password
        { withCredentials: true }
      );

      if (response.status === 200) {
        setValidationMessage(
          "Password changed successfully! Please log in using your new password."
        );
        setModalVisible(true);
      } else {
        setErrorMessage("Failed to reset password.");
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 3000);
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      setErrorMessage("Server error occurred.");
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
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

  return (
    <>
      {/* Password Modal */}
      {isPassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 z-50 ">
          <div className="relative bg-white p-6 md:p-8 lg:p-12 rounded-lg w-full max-w-md md:max-w-3xl lg:max-w-4xl xl:max-w-5xl h-auto overflow-y-auto max-h-[90vh] mx-4 ">
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
      {/* Modal */}
      {modalVisible && (
        <dialog id="my_modal_5" className="modal modal-middle " open>
          <div className="modal-box">
            <p className="py-4">{validationMessage}</p>
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

      {showErrorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red text-white p-4 rounded-lg shadow-lg z-50">
          <p>{errorMessage}</p>
        </div>
      )}
      {showValidationMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green text-white p-4 rounded-lg shadow-lg z-50">
          <p>{validationMessage}</p>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-64 sm:w-96">
            <h2 className="text-2xl mb-4">Delete Section</h2>
            <p>Are you sure you want to delete this section?</p>
            <div className="flex justify-end mt-4">
              <button
                className="btn btn-sm w-24 bg-red text-white mr-2"
                onClick={handleDeleteSection} // Call the actual delete function on confirm
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

      <form onSubmit={handleSubmit}>
        <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
          <div className="flex items-center mb-4">
            {/* <img src={profilesymbol} alt="Logo" className="w-10 h-10 mr-2" /> */}
            <h1 className="text-2xl font-medium text-gray-700">User Profile</h1>
          </div>

          {/* TABS */}
          <div
            role="tablist"
            className="tabs tabs-lifted tabs-xs sm:tabs-sm md:tabs-md lg:tabs-lg"
          >
            <input
              type="radio"
              name="my_tabs_2"
              role="tab"
              className="tab"
              aria-label="Primary"
              defaultChecked
            />
            <div
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 rounded-box p-6 tab-active"
            >
              <div>
                <div className="text-black font-light">
                  {/* PRIMARY INFORMATION */}
                  <div className="text-xl py-4">Primary Information</div>

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

                  <div className="mt-4">
                    <label className="pt-4 pb-2 text-sm">Profile Picture</label>
                    <input
                      type="file"
                      className="file-input file-input-sm file-input-bordered text-xs w-full h-10"
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
                      onChange={(e) => setFirstName(e.target.value)}
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
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>

                  <div className="py-1">
                    <label className="pt-4 pb-2 text-sm">Birthday *</label>
                    <input
                      type="date"
                      placeholder="Type here"
                      className="input input-sm input-bordered w-full h-10"
                      required
                      name="birthday"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                    />
                  </div>

                  <div className="py-1">
                    <label className="pt-4 pb-2 text-sm">Profession</label>
                    <input
                      type="text"
                      placeholder="Type here"
                      className="input input-sm input-bordered w-full h-10"
                      name="profession"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                    />
                  </div>

                  <div className="py-1">
                    <label className="pt-4 pb-2 text-sm">College Program</label>
                    <select
                      className="select select-bordered select-sm border-2 w-full h-10"
                      onChange={(e) => setCollegeProgram(e.target.value)}
                      name="collegeProgram"
                      value={collegeProgram}
                    >
                      <option value="" disabled>
                        Choose
                      </option>
                      <option>Computer Science</option>
                      <option>Information Systems</option>
                      <option>Information Technology</option>
                    </select>
                  </div>

                  <div className="py-1">
                    <label className="pt-4 pb-2 text-sm">Specialization</label>
                    <select
                      className="select select-bordered select-sm border-2 w-full h-10"
                      onChange={(e) => setSpecialization(e.target.value)}
                      name="specialization"
                      value={specialization}
                    >
                      <option value="" disabled>
                        Choose
                      </option>
                      <option>Web Development</option>
                      <option>Networking</option>
                      <option>Automation</option>
                    </select>
                  </div>

                  <div className="py-1">
                    <label className="pt-4 pb-2 text-sm">
                      Year Started on College Program
                    </label>
                    <input
                      type="number"
                      min="1990" // Set the minimum acceptable year
                      max="2024" // Set the maximum acceptable year
                      step="1" // Allow only whole numbers (no decimals)
                      placeholder="YYYY"
                      className="input input-sm input-bordered w-full h-10"
                      name="yearStartedCollege"
                      value={yearStartedCollege}
                      onChange={(e) => setYearStartedCollege(e.target.value)}
                    />
                  </div>

                  <div className="py-1">
                    <label className="pt-4 pb-2 text-sm">
                      Year Graduated on College Program
                    </label>
                    <input
                      type="number"
                      min="1990" // Set the minimum acceptable year
                      max="2024" // Set the maximum acceptable year
                      step="1" // Allow only whole numbers (no decimals)
                      placeholder="YYYY"
                      className="input input-sm input-bordered w-full h-10"
                      name="yearGraduatedCollege"
                      value={yearGraduatedCollege}
                      onChange={(e) => setYearGraduatedCollege(e.target.value)}
                    />
                  </div>

                  <div className="py-1">
                    <label className="pt-4 pb-2 text-sm">
                      Time it took to land a job after graduation (Months)
                    </label>
                    <input
                      type="number"
                      placeholder="Type here"
                      className="input input-sm input-bordered w-full h-10"
                      name="timeToJob"
                      value={timeToJob}
                      onChange={(e) => setTimeToJob(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECONDARY INFORMATION */}
            <input
              type="radio"
              name="my_tabs_2"
              role="tab"
              className="tab"
              aria-label="Secondary"
            />
            <div
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 rounded-box p-6"
            >
              <div>
                <div className="text-xl py-4 mt-4">Secondary Information</div>

                <div className="py-1">
                  <label className="pt-4 pb-2 text-sm">Employment Status</label>
                  <select
                    name="employmentStatus"
                    className="select select-bordered select-sm border-2 w-full h-10"
                    onChange={(e) => setEmploymentStatus(e.target.value)}
                    value={employmentStatus}
                  >
                    <option value="" disabled>
                      Choose
                    </option>
                    <option>Employed</option>
                    <option>Unemployed</option>
                    <option>Underemployed</option>
                    <option>Freelancing</option>
                  </select>
                </div>

                <div className="py-1">
                  <label className="pt-4 pb-2 text-sm">Work Industry</label>
                  <select
                    name="workIndustry"
                    className="select select-bordered select-sm border-2 w-full h-10"
                    onChange={(e) => setWorkIndustry(e.target.value)}
                    value={workIndustry}
                  >
                    <option value="" disabled>
                      Choose
                    </option>
                    <option>Local</option>
                    <option>International</option>
                  </select>
                </div>

                <div className="py-1">
                  <label className="pt-4 pb-2 text-sm">
                    Is current profession in line with college degree?
                  </label>
                  <select
                    name="professionAlignment"
                    className="select select-bordered select-sm border-2 w-full h-10"
                    onChange={(e) => setProfessionAlignment(e.target.value)}
                    value={professionAlignment}
                  >
                    <option value="" disabled>
                      Choose
                    </option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>

                <div className="py-1">
                  <label className="pt-4 pb-2 text-sm">Marital Status</label>
                  <select
                    name="maritalStatus"
                    className="select select-bordered select-sm border-2 w-full h-10"
                    onChange={(e) => setMaritalStatus(e.target.value)}
                    value={maritalStatus}
                  >
                    <option value="" disabled>
                      Choose
                    </option>
                    <option>Single</option>
                    <option>Married</option>
                    <option>Divorced</option>
                    <option>Widowed</option>
                  </select>
                </div>

                <div className="py-1">
                  <label className="pt-4 pb-2 text-sm">
                    Salary Range (PHP)
                  </label>
                  <select
                    name="salaryRange"
                    className="select select-bordered select-sm border-2 w-full h-10"
                    onChange={(e) => setSalaryRange(e.target.value)}
                    value={salaryRange}
                  >
                    <option value="" disabled>
                      Choose
                    </option>
                    <option>14K below</option>
                    <option>15-30K</option>
                    <option>31-60K</option>
                    <option>61-100K</option>
                    <option>100K above</option>
                  </select>
                </div>

                <div className="py-1">
                  <label className="pt-4 pb-2 text-sm">
                    Place of Employment
                  </label>
                  <select
                    name="placeOfEmployment"
                    className="select select-bordered select-sm border-2 w-full h-10"
                    onChange={(e) => setPlaceOfEmployment(e.target.value)}
                    value={placeOfEmployment}
                  >
                    <option value="" disabled>
                      Choose
                    </option>
                    <option>Local</option>
                    <option>International</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CONTACT INFORMATION */}
            <input
              type="radio"
              name="my_tabs_2"
              role="tab"
              className="tab"
              aria-label="Contacts"
            />
            <div
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 rounded-box p-6"
            >
              <div>
                <div className="text-xl py-4 mt-4">Contact Information</div>

                <div className="py-1">
                  <label className="pt-4 pb-2 text-sm">LinkedIn</label>
                  <input
                    type="text"
                    placeholder="Type here"
                    className="input input-sm input-bordered w-full h-10"
                    name="linkedIn"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                  />
                </div>

                <div className="py-1">
                  <label className="pt-4 pb-2 text-sm">Facebook</label>
                  <input
                    type="text"
                    placeholder="Type here"
                    className="input input-sm input-bordered w-full h-10"
                    name="facebook"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                  />
                </div>

                <div className="py-1">
                  <label className="pt-4 pb-2 text-sm">Instagram</label>
                  <input
                    type="text"
                    placeholder="Type here"
                    className="input input-sm input-bordered w-full h-10"
                    name="instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                  />
                </div>

                <div className="py-1">
                  <label className="pt-4 pb-2 text-sm">Email Address</label>
                  <input
                    type="email"
                    placeholder="Type here"
                    className="input input-sm input-bordered w-full h-10"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="py-1">
                  <label className="pt-4 pb-2 text-sm">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="Type here"
                    className="input input-sm input-bordered w-full h-10"
                    name="mobileNumber"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                  />
                </div>

                <div className="py-1">
                  <label className="pt-4 pb-2 text-sm">Other Contact</label>
                  <input
                    type="text"
                    placeholder="Type here"
                    className="input input-sm input-bordered w-full h-10"
                    name="otherContact"
                    value={otherContact}
                    onChange={(e) => setOtherContact(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <input
              type="radio"
              name="my_tabs_2"
              role="tab"
              className="tab"
              aria-label="Attachments"
            />
            <div
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 rounded-box p-6"
            >
              <div>
                {/* ATTACHMENTS */}
                <div className="flex items-center">
                  <div className="text-xl py-4 mt-4 w-1/2">Attachments</div>
                  <div className="text-xl py-4 mt-4 w-1/2 text-end">
                    <button
                      type="button" // Prevent form submission
                      className="btn btn-sm w-36 bg-green text-white"
                      onClick={addAttachment}
                    >
                      +
                    </button>
                  </div>
                </div>

                {attachments.map((attachment, index) => (
                  <div key={attachment.id}>
                    <label className="pt-4 pb-2 text-sm">
                      Attachment {index + 1}{" "}
                      {/* Change to index + 1 for better user experience */}
                    </label>
                    <div className="text-sm text-gray-600">
                      {attachment.filename || "No file uploaded."}
                    </div>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="file-input file-input-sm file-input-bordered text-xs w-full h-10 mb-2"
                      onChange={(e) => handleFileChange(e, index)} // Pass the correct index
                    />
                  </div>
                ))}
              </div>
            </div>

            <input
              type="radio"
              name="my_tabs_2"
              role="tab"
              className="tab"
              aria-label="Education"
            />
            <div
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 rounded-box p-6"
            >
              <div>
                {/* EDUCATIONAL BACKGROUND */}
                <div className="text-xl py-4 mt-4 w-1/2">
                  Educational Background
                </div>

                {/* SECONDARY EDUCATION */}
                <div className="flex items-center">
                  <div className="text-lg w-1/2">Secondary Education</div>
                  <div className="text-lg w-1/2 text-end">
                    <button
                      type="button"
                      className="btn btn-sm w-36 bg-green text-white"
                      onClick={addSecondaryEducationSection}
                    >
                      +
                    </button>
                  </div>
                </div>

                {secondaryEducationSections.map((section) => (
                  <div
                    key={section._id}
                    className="w-full border-2 rounded py-2 px-4 mt-2"
                  >
                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">School Name</label>
                      <input
                        type="text"
                        placeholder="Type here"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.schoolName}
                        onChange={(e) =>
                          handleSectionChange("secondary", section._id, e)
                        }
                        name="schoolName"
                      />
                    </div>

                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Year Started</label>
                      <input
                        type="number"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.yearStarted}
                        onChange={(e) =>
                          handleSectionChange("secondary", section._id, e)
                        }
                        name="yearStarted"
                        min="1990" // Set the minimum acceptable year
                        max="2024" // Set the maximum acceptable year
                        step="1" // Allow only whole numbers (no decimals)
                        placeholder="YYYY"
                      />
                    </div>

                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Year Ended</label>
                      <input
                        type="number"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.yearEnded}
                        onChange={(e) =>
                          handleSectionChange("secondary", section._id, e)
                        }
                        name="yearEnded"
                        min="1990" // Set the minimum acceptable year
                        max="2024" // Set the maximum acceptable year
                        step="1" // Allow only whole numbers (no decimals)
                        placeholder="YYYY"
                      />
                    </div>

                    {/* Delete Button */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="btn btn-sm w-36 bg-red text-white mt-2"
                        onClick={
                          () => {
                            console.log("Profile ID:", profileId);
                            console.log("Section ID:", section._id); // Use section._id here
                            initiateDeleteSection(
                              "secondary-section",
                              section._id
                            );
                          } // Pass the correct section ID
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {/* TERTIARY EDUCATION */}
                <div className="flex items-center mt-8">
                  <div className="text-lg w-1/2">Tertiary Education</div>
                  <div className="text-lg w-1/2 text-end">
                    <button
                      type="button"
                      className="btn btn-sm w-36 bg-green text-white"
                      onClick={addTertiaryEducationSection}
                    >
                      +
                    </button>
                  </div>
                </div>

                {tertiaryEducationSections.map((section) => (
                  <div
                    key={section._id}
                    className="w-full border-2 rounded py-2 px-4 mt-2"
                  >
                    {/* School Name */}
                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">School Name</label>
                      <input
                        type="text"
                        name="schoolName"
                        placeholder="Type here"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.schoolName}
                        onChange={(e) =>
                          handleSectionChange("tertiary", section._id, e)
                        }
                      />
                    </div>

                    {/* Program */}
                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Program</label>
                      <input
                        type="text"
                        name="program"
                        placeholder="Type here"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.program}
                        onChange={(e) =>
                          handleSectionChange("tertiary", section._id, e)
                        }
                      />
                    </div>

                    {/* Year Started */}
                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Year Started</label>
                      <input
                        type="number"
                        name="yearStarted"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.yearStarted}
                        onChange={(e) =>
                          handleSectionChange("tertiary", section._id, e)
                        }
                        min="1990" // Set the minimum acceptable year
                        max="2024" // Set the maximum acceptable year
                        step="1" // Allow only whole numbers (no decimals)
                        placeholder="YYYY"
                      />
                    </div>

                    {/* Year Ended */}
                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Year Ended</label>
                      <input
                        type="number"
                        name="yearEnded"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.yearEnded}
                        onChange={(e) =>
                          handleSectionChange("tertiary", section._id, e)
                        }
                        min="1990" // Set the minimum acceptable year
                        max="2024" // Set the maximum acceptable year
                        step="1" // Allow only whole numbers (no decimals)
                        placeholder="YYYY"
                      />
                    </div>
                    {/* Delete Button */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="btn btn-sm w-36 bg-red text-white mt-2"
                        onClick={
                          () => {
                            console.log("Profile ID:", profileId);
                            console.log("Section ID:", section._id); // Use section._id here
                            initiateDeleteSection(
                              "tertiary-section",
                              section._id
                            );
                          } // Pass the correct section ID
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <input
              type="radio"
              name="my_tabs_2"
              role="tab"
              className="tab"
              aria-label="Career"
            />
            <div
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 rounded-box p-6"
            >
              <div>
                {/* CAREER */}
                <div className="flex items-center">
                  <div className="text-xl py-4 mt-4 w-1/2">
                    Career Background
                  </div>
                  <div className="text-xl py-4 mt-4 w-1/2 text-end">
                    <button
                      type="button"
                      className="btn btn-sm w-36 bg-green text-white"
                      onClick={addCompanySection}
                    >
                      +
                    </button>
                  </div>
                </div>

                {companySections.map((section) => (
                  <div
                    key={section._id}
                    className="w-full border-2 rounded py-2 px-4 mt-2"
                  >
                    {/* Company Name */}
                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Company Name</label>
                      <input
                        type="text"
                        name="companyName"
                        placeholder="Type here"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.companyName}
                        onChange={(e) =>
                          handleSectionChange("company", section._id, e)
                        }
                      />
                    </div>
                    {/* Position */}
                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Position</label>
                      <input
                        type="text"
                        name="position"
                        placeholder="Type here"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.position}
                        onChange={(e) =>
                          handleSectionChange("company", section._id, e)
                        }
                      />
                    </div>
                    {/* Year Started */}
                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Year Started</label>
                      <input
                        type="number"
                        name="yearStarted"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.yearStarted}
                        onChange={(e) =>
                          handleSectionChange("company", section._id, e)
                        }
                        min="1990" // Set the minimum acceptable year
                        max="2024" // Set the maximum acceptable year
                        step="1" // Allow only whole numbers (no decimals)
                        placeholder="YYYY"
                      />
                    </div>
                    {/* Year Ended */}
                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Year Ended</label>
                      <input
                        type="number"
                        name="yearEnded"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.yearEnded}
                        onChange={(e) =>
                          handleSectionChange("company", section._id, e)
                        }
                        min="1990" // Set the minimum acceptable year
                        max="2024" // Set the maximum acceptable year
                        step="1" // Allow only whole numbers (no decimals)
                        placeholder="YYYY"
                      />
                    </div>
                    {/* Delete Button */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="btn btn-sm w-36 bg-red text-white mt-2"
                        onClick={() => {
                          console.log("Profile ID:", profileId);
                          console.log("Section ID:", section._id); // Use section._id here
                          initiateDeleteSection("company-section", section._id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <input
              type="radio"
              name="my_tabs_2"
              role="tab"
              className="tab"
              aria-label="Settings"
            />
            <div
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 rounded-box p-6"
            >
              <div>
                {/* SETTINGS */}
                <div className="text-xl py-4 mt-4">Settings</div>

                <div className="py-1">
                  <label className="pt-4 pb-2 text-sm">Account Email *</label>
                  <input
                    type="email" // Changed type to email for better validation
                    name="accountEmail"
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    placeholder="Type here"
                    className="input input-sm input-bordered w-full h-10"
                  />
                </div>
              </div>
              {/* END OF SETTINGS */}
            </div>
          </div>
          {/* END OF TABS */}
        </div>
      </form>
      <div>
        {/* BOTTOM BUTTONS */}
        <div className="flex justify-center mt-16 space-x-3 mb-12">
          <div>
            <button
              className="btn md:w-64 w-52 bg-green text-white"
              onClick={handleSave} // Add a function to handle saving
              aria-label="Save" // Added aria-label for accessibility
            >
              Save
            </button>
          </div>
          <div className="">
            <button
              onClick={openPassModal}
              className="btn md:w-64 w-full bg-fgray text-white"
            >
              Reset Password
            </button>
          </div>
        </div>

        {/* END OF BOTTOM BUTTONS */}
      </div>
    </>
  );
}

export default UserProfile;
