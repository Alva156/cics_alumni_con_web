import React, { useState, useEffect } from "react";
import "../../App.css";
import axios from "axios";
import { uniqueId } from "lodash"; // Make sure you import uniqueId
import imageCompression from "browser-image-compression";
import { useNavigate } from "react-router-dom";

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
  const [accountEmail, setAccountEmail] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [initialAccountEmail, setInitialAccountEmail] = useState("");
  const [profileId, setProfileId] = useState(null);

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
          setProfileImage(reader.result); // This will set the base64 string of the compressed image
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
      case "accountEmail":
        setAccountEmail(value);
        break;
      case "firstName":
        setFirstName(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "birthday":
        setBirthday(value);
        break;
      case "profession":
        setProfession(value);
        break;
      case "collegeProgram":
        setCollegeProgram(value);
        break;
      case "specialization":
        setSpecialization(value);
        break;
      case "yearStartedCollege":
        setYearStartedCollege(value);
        break;
      case "yearGraduatedCollege":
        setYearGraduatedCollege(value);
        break;
      case "timeToJob":
        setTimeToJob(value);
        break;
      case "employmentStatus":
        setEmploymentStatus(value);
        break;
      case "professionAlignment":
        setProfessionAlignment(value);
        break;
      case "workIndustry":
        setWorkIndustry(value);
        break;
      case "maritalStatus":
        setMaritalStatus(value);
        break;
      case "salaryRange":
        setSalaryRange(value);
        break;
      case "placeOfEmployment":
        setPlaceOfEmployment(value);
        break;
      case "linkedIn":
        setLinkedIn(value);
        break; // Fixed state name here
      case "facebook":
        setFacebook(value);
        break;
      case "instagram":
        setInstagram(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "mobileNumber":
        setMobileNumber(value);
        break;
      case "otherContact":
        setOtherContact(value);
        break;
      default:
        break;
    }
  };

  // Handle changes for secondary education, tertiary education, and company sections
  const handleSecondaryEducationChange = (index, e) => {
    const newSections = [...secondaryEducationSections];
    newSections[index][e.target.name] = e.target.value;
    setSecondaryEducationSections(newSections);
  };

  const handleTertiaryEducationChange = (index, e) => {
    const newSections = [...tertiaryEducationSections];
    newSections[index][e.target.name] = e.target.value;
    setTertiaryEducationSections(newSections);
  };

  const handleCompanyChange = (index, e) => {
    const newSections = [...companySections];
    newSections[index][e.target.name] = e.target.value;
    setCompanySections(newSections);
  };

  // Updated handleDeleteCompanySection with logging
  const handleDeleteCompanySection = async (sectionId) => {
    console.log("Delete button clicked");
    console.log("Section ID in function:", sectionId);
    
    if (!profileId || !sectionId) {
      console.log("Profile ID or Section ID is missing.");
      return;
    }
  
    console.log("Deleting company section with Profile ID:", profileId);
    console.log("Attempting to delete section with ID:", sectionId);
  
    try {
      const response = await axios.delete(
        `${backendUrl}/profile/company-section/${profileId}/${sectionId}`,
        { withCredentials: true }
      );
  
      console.log("Delete response:", response);
      
      if (response.status === 200) {
        
        // Update state to remove the deleted section
        setCompanySections((prevSections) => {
          const updatedSections = prevSections.filter((section) => section._id !== sectionId); // Ensure correct ID comparison
          // Check if the updated sections array is empty
          if (updatedSections.length === 0) {
            // If empty, handle the empty state if needed, e.g., reset form or show a message
            alert("No company sections remaining.");
          }
          return updatedSections;
        });
  
        alert("Company section deleted successfully!");
      } else {
        alert("Failed to delete company section. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting company section:", error);
      if (error.response) {
        console.log("Response status:", error.response.status);
        console.log("Response data:", error.response.data);
        alert(`Failed to delete company section. Reason: ${error.response.data.message || "Please try again."}`);
      } else {
        alert("Failed to delete company section. Please check your network connection.");
      }
    }
};



  const handleSave = (e) => {
    console.log("saved");
    e.preventDefault(); // Prevent default form submission
    handleSubmit(e); // Call the handleSubmit function to save the form data
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      profileImage,
      attachments: attachments.map((attachment) => ({
        fileName: attachment.fileName,
        file: attachment.file, // include the file object here
      })),
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

    try {
      // Check if the profile exists
      await axios.get(`${backendUrl}/profile/userprofile`, {
        withCredentials: true,
      });

      // Update the existing profile
      await axios.put(`${backendUrl}/profile/updateprofile`, userData, {
        withCredentials: true,
      });

      // Check if the email has changed
      if (accountEmail !== initialAccountEmail) {
        setShowValidationMessage(false);

        // Set validation message for the modal
        setValidationMessage(
          "Email changed successfully! Please log in using your new email."
        );

        // Show the modal only, without the background message
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

    //validation message for successful save (if email has not changed)
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
          setProfileImage(profileData.profileImage || "");
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ">
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

      <form onSubmit={handleSubmit}>
        <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
          <div className="page-title">User Profile</div>

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

                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-40 w-40 border-2"
                  />

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
                    <input
                      type="text"
                      placeholder="Type here"
                      className="input input-sm input-bordered w-full h-10"
                      name="specialization"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                    />
                  </div>

                  <div className="py-1">
                    <label className="pt-4 pb-2 text-sm">
                      Year Started on College Program
                    </label>
                    <input
                      type="date"
                      placeholder="Type here"
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
                      type="date"
                      placeholder="Type here"
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
                      type="text"
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
                      className="btn btn-sm w-36 bg-green text-white"
                      onClick={addSecondaryEducationSection}
                    >
                      +
                    </button>
                  </div>
                </div>

                {secondaryEducationSections.map((section, index) => (
                  <div
                    key={index}
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
                          handleSecondaryEducationChange(index, e)
                        }
                        name="schoolName"
                      />
                    </div>

                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Year Started</label>
                      <input
                        type="date"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.yearStarted}
                        onChange={(e) =>
                          handleSecondaryEducationChange(index, e)
                        }
                        name="yearStarted"
                      />
                    </div>

                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Year Ended</label>
                      <input
                        type="date"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.yearEnded}
                        onChange={(e) =>
                          handleSecondaryEducationChange(index, e)
                        }
                        name="yearEnded"
                      />
                    </div>
                  </div>
                ))}

                {/* TERTIARY EDUCATION */}
                <div className="flex items-center mt-8">
                  <div className="text-lg w-1/2">Tertiary Education</div>
                  <div className="text-lg w-1/2 text-end">
                    <button
                      className="btn btn-sm w-36 bg-green text-white"
                      onClick={addTertiaryEducationSection}
                    >
                      +
                    </button>
                  </div>
                </div>

                {tertiaryEducationSections.map((section, index) => (
                  <div
                    key={index}
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
                          handleTertiaryEducationChange(index, e)
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
                          handleTertiaryEducationChange(index, e)
                        }
                      />
                    </div>

                    {/* Year Started */}
                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Year Started</label>
                      <input
                        type="date"
                        name="yearStarted"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.yearStarted}
                        onChange={(e) =>
                          handleTertiaryEducationChange(index, e)
                        }
                      />
                    </div>

                    {/* Year Ended */}
                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Year Ended</label>
                      <input
                        type="date"
                        name="yearEnded"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.yearEnded}
                        onChange={(e) =>
                          handleTertiaryEducationChange(index, e)
                        }
                      />
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
                      className="btn btn-sm w-36 bg-green text-white"
                      onClick={addCompanySection}
                    >
                      +
                    </button>
                  </div>
                </div>

                {companySections.map((section, index) => (
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
        onChange={(e) => handleCompanyChange(index, e)}
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
        onChange={(e) => handleCompanyChange(index, e)}
      />
    </div>
    {/* Year Started */}
    <div className="py-1">
      <label className="pt-4 pb-2 text-sm">Year Started</label>
      <input
        type="date"
        name="yearStarted"
        className="input input-sm input-bordered w-full h-10"
        value={section.yearStarted}
        onChange={(e) => handleCompanyChange(index, e)}
      />
    </div>
    {/* Year Ended */}
    <div className="py-1">
      <label className="pt-4 pb-2 text-sm">Year Ended</label>
      <input
        type="date"
        name="yearEnded"
        className="input input-sm input-bordered w-full h-10"
        value={section.yearEnded}
        onChange={(e) => handleCompanyChange(index, e)}
      />
    </div>
    {/* Delete Button */}
    <div className="flex justify-end">
      <button
        className="btn btn-sm w-36 bg-red text-white mt-2"
        onClick={() => {
          console.log("Profile ID:", profileId);
          console.log("Section ID:", section._id); // Use section._id here
          handleDeleteCompanySection(section._id); // Pass the correct section ID
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
