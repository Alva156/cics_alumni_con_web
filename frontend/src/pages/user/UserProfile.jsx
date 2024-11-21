import React, { useState, useEffect, useRef } from "react";
import "../../App.css";
import axios from "axios";
import { uniqueId } from "lodash"; // Make sure you import uniqueId
import imageCompression from "browser-image-compression";
import { useNavigate } from "react-router-dom";
import profilesymbol from "../../assets/userprofile.png";
import blankprofilepic from "../../assets/blankprofilepic.jpg";
import { Worker, Viewer } from "@react-pdf-viewer/core"; // Import Viewer
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.js";

function UserProfile() {
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
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [region, setRegion] = useState("");
  const [profession, setProfession] = useState("");
  const [college, setCollege] = useState("");
  const [collegeProgram, setCollegeProgram] = useState("");
  const [availablePrograms, setAvailablePrograms] = useState([]);
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
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [maxId, setMaxId] = useState(1);
  const [isDeleteModalPicOpen, setIsDeleteModalPicOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null); // Holds the currently selected attachment for preview
  const [previewFileUrl, setPreviewFileUrl] = useState(null); // Holds the file URL for the modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false); // Tracks whether the modal is open
  const modalRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closePreviewModal(); // Use the correct modal closing function
      }
    };

    if (isPreviewModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isPreviewModalOpen]);

  const openPreviewModal = async (attachment) => {
    setPreviewAttachment(attachment);

    try {
      const response = await axios.get(
        `${backendUrl}/profile/attachments/preview/${attachment.filename}`,
        { withCredentials: true, responseType: "blob" }
      );

      const fileUrl = URL.createObjectURL(response.data);
      setPreviewFileUrl(fileUrl);
      setIsPreviewModalOpen(true);
    } catch (error) {
      console.error("Error fetching the file:", error);
    }
  };
  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setPreviewAttachment(null);
    setPreviewFileUrl(null);
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
      setIsDeleteModalPicOpen(false); // Close the modal
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
        setValidationMessage(
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteAttachmentModalOpen, setIsDeleteAttachmentModalOpen] =
    useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);

  const [hasUnsavedSecondaryChanges, setHasUnsavedSecondaryChanges] =
    useState(false);
  const [hasUnsavedTertiaryChanges, setHasUnsavedTertiaryChanges] =
    useState(false);
  const [hasUnsavedCompanyChanges, setHasUnsavedCompanyChanges] =
    useState(false);

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmCallback, setConfirmCallback] = useState(null);

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
      remarks: "",
    },
  ]);

  const collegePrograms = {
    "UST-AMV College of Accountancy": [
      "Accountancy",
      "Accounting Information System",
      "Management Accounting",
    ],
    "College of Architecture": ["Architecture"],
    "Faculty of Arts and Letters": [
      "Asian Studies",
      "Behavioral Science",
      "Communication",
      "Creative Writing",
      "Economics",
      "English Language Studies",
      "History",
      "Journalism",
      "Legal Management",
      "Literature",
      "Philosophy",
      "Political Science",
      "Sociology",
    ],
    "Faculty of Civil Law": ["Juris Doctor"],
    "College of Commerce and Business Administration": [
      "Business Administration, major in Business Economics",
      "Business Administration, major in Financial Management",
      "Business Administration, major in Human Resource Management",
      "Business Administration, major in Marketing Management",
      "Entrepreneurship",
    ],
    "College of Education": [
      "Secondary Education Major in English",
      "Secondary Education Major in Filipino",
      "Secondary Education Major in Mathematics",
      "Secondary Education Major in Religious and Values Education",
      "Secondary Education Major in Science",
      "Secondary Education Major in Social Studies",
      "Early Childhood Education",
      "Elementary Education",
      "Special Needs Education, major in Early Childhood Education",
      "Food Technology",
      "Nutrition and Dietetics",
      "Bachelor of Library and Information Science",
    ],
    "Faculty of Engineering": [
      "Chemical Engineering",
      "Civil Engineering",
      "Electrical Engineering",
      "Electronics Engineering",
      "Industrial Engineering",
      "Mechanical Engineering",
    ],
    "College of Fine Arts and Design": [
      "Fine Arts, major in Advertising Arts",
      "Fine Arts, major in Industrial Design",
      "Interior Design",
      "Fine Arts, major in Painting",
    ],
    "College of Information and Computing Sciences": [
      "Computer Science",
      "Information Systems",
      "Information Technology",
    ],
    "Faculty of Medicine and Surgery": [
      "Basic Human Studies",
      "Doctor of Medicine",
      "Master in Clinical Audiology",
      "Master in Pain Management",
    ],
    "Conservatory of Music": [
      "Performance, major in Bassoon",
      "Performance, major in Choral Conducting",
      "Performance, major in Clarinet",
      "Composition",
      "Performance, major in Double Bass",
      "Performance, major in Flute",
      "Performance, major in French Horn",
      "Performance, major in Guitar",
      "Jazz",
      "Musicology",
      "Music Education",
      "Music Theatre",
      "Music Technology",
      "Performance, major in Oboe",
      "Performance, major in Orchestral Conducting",
      "Performance, major in Percussion",
      "Performance, major in Piano",
      "Performance, major in Saxophone",
      "Performance, major in Trombone",
      "Performance, major in Trumpet",
      "Performance, major in Tuba",
      "Performance, major in Viola",
      "Performance, major in Violin",
      "Performance, major in Violoncello",
      "Performance, major in Voice",
    ],
    "College of Nursing": ["Nursing"],
    "Faculty of Pharmacy": [
      "Biochemistry",
      "Medical Technology",
      "Pharmacy",
      "Pharmacy, major in Clinical Pharmacy",
      "Doctor of Pharmacy",
    ],
    "Institute of Physical Education and Athletics": [
      "Fitness and Sports Management",
    ],
    "College of Rehabilitation Sciences": [
      "Occupational Therapy",
      "Physical Therapy",
      "Speech-Language Pathology",
      "Sports Science",
    ],
    "College of Science": [
      "Applied Mathematics, major in Actuarial Science",
      "Applied Physics, major in Instrumentation",
      "Biology, major in Environmental Biology",
      "Biology, major in Medical Biology",
      "Bachelor of Science major in Molecular Biology and Biotechnology",
      "Chemistry",
      "Data Science and Analytics",
      "Microbiology",
      "Psychology",
    ],
    "College of Tourism and Hospitality Management": [
      "Hospitality Management, major in Culinary Entrepreneurship",
      "Hospitality Management, major in Hospitality Leadership",
      "Tourism Management, major in Recreation and Leisure Management",
      "Tourism Management, major in Travel Operation and Service Management",
    ],
    "Faculty of Canon Law": [
      "Doctor of Canon Law",
      "Licentiate in Canon Law",
      "Bachelor of Canon Law",
    ],
    "Faculty of Philosophy": [
      "Doctor of Philosophy",
      "Licentiate in Philosophy",
      "Bachelor of Philosophy (Classical)",
    ],
    "Faculty of Sacred Theology": [
      "Doctor of Sacred Theology",
      "Licentiate in Sacred Theology",
      "Bachelor of Sacred Theology",
    ],
  };

  const handleCollegeChange = (e) => {
    const selectedCollege = e.target.value;
    setCollege(selectedCollege);

    // Reset the college program selection when the college changes
    setCollegeProgram(""); // Ensure college program resets
  };

  // Initialize state for attachments, assuming that attachments are fetched with correct _id values
  const [attachments, setAttachments] = useState([
    { _id: 1, file: null, filename: "", filepath: "" }, // This should be replaced with data from the backend
  ]);

  // Set maxId based on the maximum _id from the fetched attachments, or use 1 if no attachments exist
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${backendUrl}/profile/userprofile`, {
          withCredentials: true,
        });
        const profileData = response.data;

        if (profileData) {
          // Fetch attachments from backend data and update the attachments state
          const fetchedAttachments = profileData.attachments || [];
          setAttachments(fetchedAttachments);

          // Update maxId based on the highest _id from the fetched attachments
          const highestId = fetchedAttachments.reduce(
            (max, attachment) => Math.max(max, attachment._id),
            1
          );
          setMaxId(highestId); // Set the maxId to the highest _id found
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfile();
  }, [backendUrl]);

  // Function to add a new attachment with a unique ID
  const addAttachment = () => {
    const newId = maxId + 1; // Calculate new ID based on the current max ID
    setAttachments((prev) => [
      ...prev,
      { _id: newId, file: null, filename: "", filepath: "" }, // New attachment with unique _id
    ]);
    setMaxId(newId); // Update the maxId state
  };

  // Function to handle file changes and replace an attachment while retaining its _id
  const handleFileChange = (e, index) => {
    const file = e.target.files[0]; // Get the selected file from input
    if (file) {
      console.log(`Selected input field: ${index + 1}`);

      setAttachments((prevAttachments) => {
        const updatedAttachments = [...prevAttachments];
        const existingAttachment = updatedAttachments[index];

        console.log("Existing attachment:", existingAttachment);

        // Only update if the file is different
        if (existingAttachment.file !== file) {
          console.log(`Replacing file: ${existingAttachment.filename}`);

          // Ensure the _id is retained from the existing attachment
          updatedAttachments[index] = {
            ...existingAttachment, // Keep the existing data, including _id
            file, // Set the new file object
            filename: file.name, // Update the filename
          };

          console.log(`Retained ID: ${existingAttachment._id}`);
          console.log(`New file: ${file.name}`);
        } else {
          console.log(`No change in file for input field: ${index + 1}`);
        }

        return updatedAttachments; // Return the updated attachments array with retained IDs
      });
    } else {
      console.log(`No file selected for input field: ${index + 1}`);
    }
  };

  const openConfirmationModal = (message, onConfirm) => {
    setConfirmationMessage(message);
    setConfirmCallback(() => onConfirm); // Store the confirm action to execute later
    setIsConfirmationModalOpen(true); // Open modal
  };

  // Get all elements with the class "tab"
  const tabs = document.querySelectorAll(".tab");

  // Loop through each tab and add the event listeners
  tabs.forEach((tab) => {
    tab.addEventListener("mouseenter", () => {
      // Change the aria-label on hover
      if (tab.getAttribute("aria-label") === "⚙︎") {
        tab.setAttribute("aria-label", "Settings");
      } else if (tab.getAttribute("aria-label") === "➤") {
        tab.setAttribute("aria-label", "Primary");
      } else if (tab.getAttribute("aria-label") === "✦") {
        tab.setAttribute("aria-label", "Secondary");
      } else if (tab.getAttribute("aria-label") === "☎︎") {
        tab.setAttribute("aria-label", "Contacts");
      } else if (tab.getAttribute("aria-label") === "✙") {
        tab.setAttribute("aria-label", "Attachments");
      } else if (tab.getAttribute("aria-label") === "✎") {
        tab.setAttribute("aria-label", "Education");
      } else if (tab.getAttribute("aria-label") === "★") {
        tab.setAttribute("aria-label", "Career");
      }
    });

    tab.addEventListener("mouseleave", () => {
      // Reset the aria-label to the original text when the mouse leaves
      if (tab.getAttribute("aria-label") === "Settings") {
        tab.setAttribute("aria-label", "⚙︎");
      } else if (tab.getAttribute("aria-label") === "Primary") {
        tab.setAttribute("aria-label", "➤");
      } else if (tab.getAttribute("aria-label") === "Secondary") {
        tab.setAttribute("aria-label", "✦");
      } else if (tab.getAttribute("aria-label") === "Contacts") {
        tab.setAttribute("aria-label", "☎︎");
      } else if (tab.getAttribute("aria-label") === "Attachments") {
        tab.setAttribute("aria-label", "✙");
      } else if (tab.getAttribute("aria-label") === "Education") {
        tab.setAttribute("aria-label", "✎");
      } else if (tab.getAttribute("aria-label") === "Career") {
        tab.setAttribute("aria-label", "★");
      }
    });
  });

  const addSecondaryEducationSection = async () => {
    if (hasUnsavedSecondaryChanges) {
      openConfirmationModal(
        "You have unsaved changes in the secondary education section. Do you want to proceed?",
        async () => {
          await handleSubmit(); // Handle any async submission
          setSecondaryEducationSections((prev) => [
            ...prev,
            { schoolName: "", yearStarted: "", yearEnded: "" },
          ]);
          setHasUnsavedSecondaryChanges(true); // Mark unsaved changes
        }
      );
      return; // Stop execution until user confirms
    }

    setSecondaryEducationSections((prev) => [
      ...prev,
      { schoolName: "", yearStarted: "", yearEnded: "" },
    ]);
    setHasUnsavedSecondaryChanges(true); // Set unsaved changes
  };

  // Function to add a new tertiary education section
  const addTertiaryEducationSection = async () => {
    if (hasUnsavedTertiaryChanges) {
      openConfirmationModal(
        "You have unsaved changes in the tertiary education section. Do you want to proceed?",
        async () => {
          await handleSubmit(); // Handle any async submission
          setTertiaryEducationSections((prev) => [
            ...prev,
            { schoolName: "", program: "", yearStarted: "", yearEnded: "" },
          ]);
          setHasUnsavedTertiaryChanges(true);
        }
      );
      return;
    }

    setTertiaryEducationSections((prev) => [
      ...prev,
      { schoolName: "", program: "", yearStarted: "", yearEnded: "" },
    ]);
    setHasUnsavedTertiaryChanges(true);
  };

  // Function to add a new company section
  const addCompanySection = async () => {
    if (hasUnsavedCompanyChanges) {
      openConfirmationModal(
        "You have unsaved changes in the company section. Do you want to proceed?",
        async () => {
          await handleSubmit();
          setCompanySections((prev) => [
            ...prev,
            {
              id: uniqueId(),
              companyName: "",
              position: "",
              yearStarted: "",
              yearEnded: "",
              remarks: "",
            },
          ]);
          setHasUnsavedCompanyChanges(true);
        }
      );
      return;
    }

    setCompanySections((prev) => [
      ...prev,
      {
        id: uniqueId(),
        companyName: "",
        position: "",
        yearStarted: "",
        yearEnded: "",
        remarks: "",
      },
    ]);
    setHasUnsavedCompanyChanges(true);
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

  const initiateDeleteAttachment = (attachmentId) => {
    setIsDeleteAttachmentModalOpen(true);
    setAttachmentToDelete({ attachmentId });
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

  const handleDeleteAttachment = async () => {
    if (!attachmentToDelete) {
      console.log("No attachment to delete.");
      return;
    }

    const { attachmentId } = attachmentToDelete;

    console.log("Delete button clicked for attachment");
    console.log("Attachment ID in function:", attachmentId);

    if (!profileId || !attachmentId) {
      console.log("Profile ID or Attachment ID is missing.");
      return;
    }

    try {
      // Call the DELETE endpoint to remove the attachment from the database
      const deleteAttachmentResponse = await axios.delete(
        `${backendUrl}/profile/${profileId}/${attachmentId}`,
        { withCredentials: true }
      );

      console.log("Delete response:", deleteAttachmentResponse);

      if (deleteAttachmentResponse.status === 200) {
        // Update the frontend state after successful deletion
        setAttachments((prevAttachments) =>
          prevAttachments.filter(
            (attachment) => attachment._id !== attachmentId
          )
        );

        // Set validation message for successful deletion
        setValidationMessage("Attachment deleted successfully!");
        setShowValidationMessage(true); // Show the validation message

        setTimeout(() => {
          setShowValidationMessage(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error deleting attachment:", error);
      alert(`Failed to delete attachment. Please try again.`);
    }

    // Close the modal and clear the attachmentToDelete
    setIsDeleteAttachmentModalOpen(false);
    setAttachmentToDelete(null);
  };

  const handleSave = async (e) => {
    e.preventDefault(); // Prevent default form submission
    console.log("saved");

    await handleSubmit(e); // Call the handleSubmit function to save the form data

    setHasUnsavedSecondaryChanges(false);
    setHasUnsavedTertiaryChanges(false);
    setHasUnsavedCompanyChanges(false);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault(); // Prevent default form submission

    // Validate required fields
    if (!firstName || !lastName) {
      setErrorMessage("First Name and Last Name are required.");
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
      return; // Prevent submission
    }

    // Reset error messages when inputs are valid
    setShowErrorMessage(false);

    const userData = {
      firstName,
      lastName,
      birthday,
      gender,
      region,
      profession,
      college,
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
      if (attachment.file) {
        formData.append("attachments", attachment.file);
        formData.append("attachmentIds", attachment._id || "");
        console.log("Appending attachment ID:", attachment._id); // Add the ID or empty string
      }
    });

    if (profileImage) {
      formData.append("profileImage", profileImage);
      console.log("Appending profile image:", profileImage.name); // Log profile image name
    }

    try {
      // Check if the profile exists
      await axios.get(`${backendUrl}/profile/userprofile`, {
        withCredentials: true,
      });

      await axios.put(`${backendUrl}/profile/updateprofile`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update the existing profile
      await axios.put(`${backendUrl}/profile/updateprofile`, userData, {
        withCredentials: true,
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

      setAttachments(
        updatedProfile.data.attachments.map((attachment) => ({
          _id: attachment._id, // The unique ID from the backend
          filename: attachment.filename,
          filepath: attachment.filepath,
        }))
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
        setErrorMessage(
          error.response.data.msg || "Error saving profile. Please try again."
        );
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 3000);
      }
    }

    // Validation message for successful save (if email has not changed)
    if (accountEmail === initialAccountEmail && showErrorMessage) {
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
          setGender(profileData.gender || "");
          setRegion(profileData.region || "");
          setProfession(profileData.profession || "");
          setCollege(profileData.college || "");
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
    setErrorMessage2("");

    const validatePassword = (password) => {
      const minLength = /.{8,}/; // At least 8 characters
      const upperCase = /[A-Z]/; // At least one uppercase letter
      const digit = /[0-9]/; // At least one digit
      const specialChar = /[_!@#$%^&*(),.?":{}|<>]/; // At least one special character

      if (!minLength.test(password)) {
        return "Password must be at least 8 characters long.";
      }
      if (!upperCase.test(password)) {
        return "Password must contain at least one uppercase letter.";
      }
      if (!digit.test(password)) {
        return "Password must contain at least one digit.";
      }
      if (!specialChar.test(password)) {
        return "Password must contain at least one special character.";
      }
      return null; // No validation error
    };

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage2("All fields are required.");
      setShowErrorMessage2(true);
      setTimeout(() => setShowErrorMessage2(false), 3000);
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setErrorMessage2(passwordError);
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
        setValidationMessage(
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

  return (
    <>
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
                onClick={closePassModal}
                className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-[#3D3C3C] text-white px-4 py-2 md:px-6 md:py-3"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSub}
                className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-green text-white px-4 py-2 md:px-6 md:py-3"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Preview Modal */}
      {isPreviewModalOpen && previewAttachment && previewFileUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
        >
          <div
            ref={modalRef}
            className="bg-white p-4 sm:p-6 md:p-8 lg:p-12 rounded-lg w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl h-auto overflow-y-auto max-h-full relative"
          >
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-center">
              {previewAttachment.filename}
            </h2>

            {/* Conditional rendering of Viewer or Image */}
            {previewAttachment.filename.endsWith(".pdf") ? (
              <Worker workerUrl={pdfWorker}>
                <div className="w-full h-[40vh] overflow-auto mb-4 flex items-center justify-center">
                  <Viewer
                    fileUrl={previewFileUrl}
                    renderTextLayer={false}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              </Worker>
            ) : (
              <img
                src={previewFileUrl}
                alt={previewAttachment.filename}
                className="mb-4 w-full h-64 object-cover rounded"
              />
            )}

            <div className="flex justify-end space-x-2 sm:space-x-4 mt-4">
              <button
                onClick={closePreviewModal}
                className="px-3 py-2 bg-gray-300 rounded-md text-sm sm:text-base hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isDeleteModalPicOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-64 sm:w-96">
            <h2 className="text-2xl mb-4">Delete Profile Image</h2>
            <p>Are you sure you want to delete your Profile Image?</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="btn btn-sm w-24 bg-[#3D3C3C] text-white px-4 py-2"
                onClick={() => setIsDeleteModalPicOpen(false)} // Close the modal on cancel
              >
                Cancel
              </button>
              <button
                className="btn btn-sm w-24 bg-red text-white px-4 py-2"
                onClick={handleDeleteProfileImage} // Trigger the delete function
              >
                Delete
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
                onClick={closeEmailModal}
                className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-[#3D3C3C] text-white px-4 py-2 md:px-6 md:py-3"
              >
                Cancel
              </button>
              <button
                onClick={verifyOTPAndUpdateEmail}
                className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-green text-white px-4 py-2 md:px-6 md:py-3"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

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

      {isConfirmationModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-64 sm:w-96">
            <h2 className="text-2xl mb-4">Confirm Action</h2>
            <p>{confirmationMessage}</p>
            <div className="flex justify-end mt-4">
              <button
                className="btn btn-sm w-24 bg-red text-white mr-2"
                onClick={() => {
                  if (confirmCallback) confirmCallback(); // Execute the stored callback
                  setIsConfirmationModalOpen(false); // Close the modal
                }}
              >
                Yes
              </button>
              <button
                className="btn btn-sm w-24 bg-gray-500 text-white"
                onClick={() => setIsConfirmationModalOpen(false)} // Close modal on cancel
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-64 sm:w-96">
            <h2 className="text-2xl mb-4">Delete Section</h2>
            <p>Are you sure you want to delete this section?</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="btn btn-sm w-24 bg-[#3D3C3C] text-white px-4 py-2"
                onClick={() => setIsDeleteModalOpen(false)} // Close the modal on cancel
              >
                Cancel
              </button>
              <button
                className="btn btn-sm w-24 bg-red text-white px-4 py-2"
                onClick={handleDeleteSection} // Call the actual delete function on confirm
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteAttachmentModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-64 sm:w-96">
            <h2 className="text-2xl mb-4">Delete Attachment</h2>
            <p>Are you sure you want to delete this attachment?</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="btn btn-sm w-24 bg-[#3D3C3C] text-white px-4 py-2"
                onClick={() => setIsDeleteAttachmentModalOpen(false)} // Close the modal on cancel
              >
                Cancel
              </button>
              <button
                className="btn btn-sm w-24 bg-red text-white px-4 py-2"
                onClick={handleDeleteAttachment} // Call the delete function for attachments on confirm
              >
                Delete
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
          <div role="tablist" className="tabs tabs-lifted sm:tabs-lg tabs-sm">
            <input
              type="radio"
              name="my_tabs_2"
              role="tab"
              className="tab"
              aria-label="➤"
              defaultChecked
              title="Primary Information"
            />
            <div
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 rounded-box p-6 tab-active w-full"
            >
              <div>
                <div className="text-black font-light">
                  {/* PRIMARY INFORMATION */}
                  <div className="text-xl py-4">Primary Information</div>

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
                      <label className="text-sm">
                        Profile Picture{" "}
                        <span className="text-xs font-light italic">
                          (Allowed formats: JPG, JPEG, PNG, Max size: 5MB)
                        </span>{" "}
                      </label>
                      <button
                        type="button"
                        title="Delete Profile Picture"
                        onClick={() => setIsDeleteModalPicOpen(true)}
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
                    <label className="pt-4 pb-2 text-sm">Gender</label>
                    <select
                      name="gender"
                      className="select select-bordered select-sm  w-full h-10"
                      onChange={(e) => setGender(e.target.value)}
                      value={gender}
                    >
                      <option value="" disabled hidden>Choose</option>
                      <option value="">-</option>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>

                  <div className="py-1">
                    <label className="pt-4 pb-2 text-sm">Region</label>
                    <select
                      name="region"
                      className="select select-bordered select-sm  w-full h-10"
                      onChange={(e) => setRegion(e.target.value)}
                      value={region}
                    >
                      <option value="" disabled hidden>Choose</option>
                      <option value="">-</option>
                      <option>NCR</option>
                      <option>CAR</option>
                      <option>Region I</option>
                      <option>Region II</option>
                      <option>Region III</option>
                      <option>Region IV-A </option>
                      <option>Region IV-B </option>
                      <option>Region V</option>
                      <option>Region VI</option>
                      <option>NIR</option>
                      <option>Region VII</option>
                      <option>Region VIII</option>
                      <option>Region IX</option>
                      <option>Region X</option>
                      <option>Region XI</option>
                      <option>Region XII</option>
                      <option>Region XIII</option>
                      <option>BARMM</option>
                      <option>N/A</option>
                    </select>
                  </div>

                  <div className="py-1">
                    <label className="pt-4 pb-2 text-sm">Profession</label>
                    <input
                      type="text"
                      placeholder="e.g. Web Developer"
                      className="input input-sm input-bordered w-full h-10"
                      name="profession"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                    />
                  </div>

                  <div className="py-1">
                    <label className="pt-4 pb-2 text-sm">College</label>
                    <select
                      className="select select-bordered select-sm w-full h-10"
                      onChange={handleCollegeChange}
                      name="college"
                      value={college}
                    >
                      <option value="" disabled hidden>Choose</option>
                      <option value="">-</option>
                      {/* Dynamically render colleges */}
                      {Object.keys(collegePrograms).map((collegeName) => (
                        <option key={collegeName} value={collegeName}>
                          {collegeName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="py-1">
                    <label className="pt-4 pb-2 text-sm">College Program</label>
                    <select
                      className="select select-bordered select-sm w-full h-10"
                      onChange={(e) => setCollegeProgram(e.target.value)}
                      name="collegeProgram"
                      value={collegeProgram}
                      disabled={!college}
                    >
                      <option value="" disabled hidden>Choose</option>
                      <option value="">-</option>
                      {/* Dynamically render college programs based on selected college */}
                      {college &&
                        collegePrograms[college].map((program) => (
                          <option key={program} value={program}>
                            {program}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="py-1">
                    <label className="pt-4 pb-2 text-sm">Specialization</label>
                    <input
                      type="text"
                      placeholder="e.g. Web and Mobile Application Development"
                      className="input input-sm input-bordered w-full h-10"
                      onChange={(e) => setSpecialization(e.target.value)}
                      name="specialization"
                      value={specialization}
                    />
                  </div>

                  <div className="py-1">
                    <label className="pt-4 pb-2 text-sm">
                      Year Started on College Program{" "}
                        <span className="text-xs font-light italic">
                          (1611 - current year)
                        </span>{" "}
                    </label>
                    <input
                      type="number"
                      step="1" // Allow only whole numbers (no decimals)
                      placeholder="YYYY"
                      className="input input-sm input-bordered w-full h-10"
                      name="yearStartedCollege"
                      value={yearStartedCollege}
                      min="1611"
                      max={new Date().getFullYear()} // Maximum year as the current year
                      onChange={(e) => setYearStartedCollege(e.target.value)}
                    />
                  </div>

                  <div className="py-1">
                    <label className="pt-4 pb-2 text-sm">
                      Year Graduated on College Program {" "}
                        <span className="text-xs font-light italic">
                          (1611 - current year)
                        </span>{" "}
                    </label>
                    <input
                      type="number"
                      step="1" // Allow only whole numbers (no decimals)
                      placeholder="YYYY"
                      className="input input-sm input-bordered w-full h-10"
                      name="yearGraduatedCollege"
                      value={yearGraduatedCollege}
                      min="1611"
                      max={new Date().getFullYear()} // Maximum year as the current year
                      onChange={(e) => setYearGraduatedCollege(e.target.value)}
                    />
                  </div>

                  <div className="py-1">
                    <label className="pt-4 pb-2 text-sm">
                      Time it took to land a job after graduation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2 months"
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
              aria-label="✦"
              title="Secondary Information"
            />
            <div
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 rounded-box p-6 w-full"
            >
              <div>
                <div className="text-xl py-4">Secondary Information</div>

                <div className="py-1">
                  <label className="pt-4 pb-2 text-sm">Employment Status</label>
                  <select
                    name="employmentStatus"
                    className="select select-bordered select-sm  w-full h-10"
                    onChange={(e) => setEmploymentStatus(e.target.value)}
                    value={employmentStatus}
                  >
                    <option value="" disabled hidden>Choose</option>
                    <option value="">-</option>
                    <option>Employed</option>
                    <option>Self-employed</option>
                    <option>Unemployed</option>
                    <option>Underemployed</option>
                    <option>Freelancing</option>
                  </select>
                </div>

                <div className="py-1">
                  <label className="pt-4 pb-2 text-sm">Work Industry</label>
                  <select
                    name="workIndustry"
                    className="select select-bordered select-sm  w-full h-10"
                    onChange={(e) => setWorkIndustry(e.target.value)}
                    value={workIndustry}
                  >
                    <option value="" disabled hidden>Choose</option>
                    <option value="">-</option>
                    <option>Public</option>
                    <option>Private</option>
                  </select>
                </div>

                <div className="py-1">
                  <label className="pt-4 pb-2 text-sm">
                    Is current profession in line with college degree?
                  </label>
                  <select
                    name="professionAlignment"
                    className="select select-bordered select-sm  w-full h-10"
                    onChange={(e) => setProfessionAlignment(e.target.value)}
                    value={professionAlignment}
                  >
                    <option value="" disabled hidden>Choose</option>
                    <option value="">-</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>

                <div className="py-1">
                  <label className="pt-4 pb-2 text-sm">Marital Status</label>
                  <select
                    name="maritalStatus"
                    className="select select-bordered select-sm  w-full h-10"
                    onChange={(e) => setMaritalStatus(e.target.value)}
                    value={maritalStatus}
                  >
                    <option value="" disabled hidden>Choose</option>
                    <option value="">-</option>
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
                    className="select select-bordered select-sm  w-full h-10"
                    onChange={(e) => setSalaryRange(e.target.value)}
                    value={salaryRange}
                  >
                    <option value="" disabled hidden>Choose</option>
                    <option value="">-</option>
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
                    className="select select-bordered select-sm  w-full h-10"
                    onChange={(e) => setPlaceOfEmployment(e.target.value)}
                    value={placeOfEmployment}
                  >
                    <option value="" disabled hidden>Choose</option>
                    <option value="">-</option>
                    <option>Local</option>
                    <option>International</option>
                  </select>
                </div>
              </div>
              <label className="pt-4 text-sm text-white opacity-0">
                Mobile Number{" "}
                <span className="text-xs font-light italic">
                  {" "}
                  ( include country code before your number, e.g.,{" "}
                  <span className="font-medium">63</span> 9125559207 for
                  PHAAAAAAAAAAAAAAAAAAAAAAAAAAAA )
                </span>
              </label>
            </div>
            {/* CONTACT INFORMATION */}
            <input
              type="radio"
              name="my_tabs_2"
              role="tab"
              className="tab"
              aria-label="☎︎"
              title="Contact Information"
            />
            <div
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 rounded-box p-6 w-full"
            >
              <div>
                <div className="text-xl py-4">Contact Information</div>

                <div className="py-1">
                  <label className="pt-4 pb-2 text-sm">LinkedIn</label>
                  <input
                    type="text"
                    placeholder="e.g. https://www.linkedin.com/in/example-sample-48a636207"
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
                    placeholder="e.g. https://www.facebook.com/example101/"
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
                    placeholder="e.g. https://www.instagram.com/example101"
                    className="input input-sm input-bordered w-full h-10"
                    name="instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                  />
                </div>

                <div className="py-1">
                  <label className="pt-4 pb-2 text-sm">
                    Alternative Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. example@email.com"
                    className="input input-sm input-bordered w-full h-10"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="py-1">
                  <label className="pt-4 pb-2 text-sm">
                    Mobile Number{" "}
                    <span className="text-xs font-light italic">
                      {" "}
                      ( include country code before your number, e.g.,{" "}
                      <span className="font-medium">63</span> 9125559207 for PH
                      )
                    </span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 639991112399"
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
                    placeholder="e.g. example@email.com"
                    className="input input-sm input-bordered w-full h-10"
                    name="otherContact"
                    value={otherContact}
                    onChange={(e) => setOtherContact(e.target.value)}
                  />
                </div>
              </div>
              <label className="pt-4 text-sm text-white opacity-0">
                Mobile Number{" "}
                <span className="text-xs font-light italic">
                  {" "}
                  ( include country code before your number, e.g.,{" "}
                  <span className="font-medium">63</span> 9125559207 for
                  PHAAAAAAAAAAAAAAAAAAAAAAAAAAA )
                </span>
              </label>
            </div>
            <input
              type="radio"
              name="my_tabs_2"
              role="tab"
              className="tab"
              aria-label="✙"
              title="Attachments"
            />
            <div
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 rounded-box p-6 w-full"
            >
              <div>
                {/* ATTACHMENTS */}
                <div className="flex items-center w-full">
                  <div className="text-xl py-4 w-1/2">Attachments</div>
                  <div className="text-xl py-4 w-1/2 text-end">
                    <button
                      type="button" // Prevent form submission
                      title="Add Attachment"
                      className="btn btn-sm w-36 bg-green text-white"
                      onClick={addAttachment}
                    >
                      + Add Attachment
                    </button>
                  </div>
                </div>
                <div className="mb-4 text-sm">
                  Upload documents that highlight your qualifications, such as
                  your resume, CV, or other career-related files. <br />
                  <span className="text-xs font-light italic">
                    (Allowed formats: PDF, JPG, JPEG, PNG, Max size: 5MB)
                  </span>
                </div>

                {/* Horizontal rule after Attachments header */}
                {attachments.map((attachment, index) => (
                  <div key={attachment.id || index}>
                    <div className="flex flex-row justify-between items-center w-full">
                      <div className="left">
                        <label className="pt-4 pb-2 text-sm">
                          Attachment {index + 1}{" "}
                          {/* Display the attachment number */}
                        </label>
                        <div className="text-sm text-gray-600">
                          {attachment.filename || "No file uploaded."}
                        </div>
                      </div>
                      {/* Check if attachment is saved by verifying both the filename and the database ID */}
                      {attachment.filename &&
                        attachment._id &&
                        attachment.filepath && (
                          <div className="right flex space-x-2">
                            <button
                              type="button"
                              title="Preview Attachment"
                              className="w-4 h-4 rounded-full bg-blue flex justify-center items-center cursor-pointer mr-2"
                              onClick={() => openPreviewModal(attachment)}
                            ></button>
                            <button
                              type="button"
                              title="Delete Attachment"
                              className="w-4 h-4 rounded-full bg-red flex justify-center items-center cursor-pointer mr-2"
                              onClick={() =>
                                initiateDeleteAttachment(attachment._id)
                              }
                            ></button>
                          </div>
                        )}
                    </div>
                    <input
                      type="file"
                      name={`attachment-${index}`}
                      accept="image/*,application/pdf"
                      className="file-input file-input-sm file-input-bordered text-xs w-full h-10 mb-2"
                      onChange={(e) => handleFileChange(e, index)} // Handle file change for each attachment
                    />
                  </div>
                ))}

                <label className="pt-4 text-sm text-white opacity-0">
                  Mobile Number{" "}
                  <span className="text-xs font-light italic">
                    {" "}
                    ( include country code before your number, e.g.,{" "}
                    <span className="font-medium">63</span> 9125559207 for
                    PHAAAAAAAAAAAAAAAAAAAAAAAAA )
                  </span>
                </label>
              </div>
            </div>
            <input
              type="radio"
              name="my_tabs_2"
              role="tab"
              className="tab"
              aria-label="✎"
              title="Educational Background"
            />
            <div
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 rounded-box p-6 w-full"
            >
              <div>
                {/* EDUCATIONAL BACKGROUND */}
                <div className="text-xl py-4 w-full">
                  Educational Background
                </div>

                {/* SECONDARY EDUCATION */}
                <div className="flex items-center w-full">
                  <div className="text-lg w-2/3">Secondary Education</div>
                  <div className="text-lg w-1/2 text-end">
                    <button
                      type="button"
                      title="Add Section"
                      className="btn btn-sm w-36 bg-green text-white"
                      onClick={addSecondaryEducationSection}
                    >
                      + Add Section
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
                        placeholder="e.g. University of Santo Tomas"
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
                        step="1" // Allow only whole numbers (no decimals)
                        placeholder="YYYY"
                      />
                    </div>

                    {/* Delete Button */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        title="Delete Section"
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
                <div className="flex items-center mt-8 w-full">
                  <div className="text-lg w-2/3">Tertiary Education</div>
                  <div className="text-lg w-1/2 text-end">
                    <button
                      type="button"
                      title="Add Section"
                      className="btn btn-sm w-36 bg-green text-white"
                      onClick={addTertiaryEducationSection}
                    >
                      + Add Section
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
                        placeholder="e.g. University of Santo Tomas"
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
                        placeholder="e.g. Information Technology"
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
                        step="1" // Allow only whole numbers (no decimals)
                        placeholder="YYYY"
                      />
                    </div>
                    {/* Delete Button */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        title="Delete Section"
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
              <label className="pt-4 text-sm text-white opacity-0 break-words">
                Mobile Number{" "}
                <span className="text-xs font-light italic">
                  {" "}
                  ( include country code before your number, e.g.,{" "}
                  <span className="font-medium">63</span> 9125559207 for PH )
                </span>
              </label>
            </div>
            <input
              type="radio"
              name="my_tabs_2"
              role="tab"
              className="tab"
              aria-label="★"
              title="Career"
            />
            <div
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 rounded-box p-6 w-full"
            >
              <div>
                {/* CAREER */}
                <div className="flex items-center w-full">
                  <div className="text-xl py-4 w-2/3">Career Background</div>
                  <div className="text-xl py-4 w-1/2 text-end">
                    <button
                      type="button"
                      title="Add Section"
                      className="btn btn-sm w-36 bg-green text-white"
                      onClick={addCompanySection}
                    >
                      + Add Section
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
                        placeholder="e.g. Google"
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
                        placeholder="e.g. Web Developer"
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
                        step="1" // Allow only whole numbers (no decimals)
                        placeholder="YYYY"
                      />
                    </div>
                    {/* Year Ended */}
                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">
                        Year Ended{" "}
                        <span className="text-xs font-light italic">
                          {" "}
                          (Leave blank if still employed)
                        </span>
                      </label>
                      <input
                        type="number"
                        name="yearEnded"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.yearEnded}
                        onChange={(e) =>
                          handleSectionChange("company", section._id, e)
                        }
                        step="1" // Allow only whole numbers (no decimals)
                        placeholder="YYYY"
                      />
                    </div>
                    {/* Remarks */}
                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">
                        Remarks{" "}
                        <span className="text-xs font-light italic">
                          {" "}
                          (e.g., reason for leaving, current
                          role/responsibilities, achievements)
                        </span>
                      </label>
                      <input
                        type="text"
                        name="remarks"
                        placeholder="Type remarks here"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.remarks}
                        onChange={(e) =>
                          handleSectionChange("company", section._id, e)
                        }
                      />
                    </div>
                    {/* Delete Button */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        title="Delete Section"
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
                <label className="pt-4 text-sm text-white opacity-0">
                  Mobile Number{" "}
                  <span className="text-xs font-light italic">
                    {" "}
                    ( include country code before your number, e.g.,{" "}
                    <span className="font-medium">63</span> 9125559207 for
                    PH---------------------------------- )
                  </span>
                </label>
              </div>
            </div>
            <input
              type="radio"
              name="my_tabs_2"
              role="tab"
              className="tab"
              aria-label="⚙︎"
              title="Settings"
            />
            <div
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 rounded-box p-6 w-full"
            >
              <div className="w-full">
                {/* SETTINGS */}
                <div className="text-xl py-4 w-full">Settings</div>

                <div className="py-1 w-full">
                  <label className="pt-4 pb-2 text-sm w-full">
                    Account Email{" "}
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

                <div className="py-1 w-full">
                  <button
                    type="button"
                    className="btn btn-sm w-30 md:btn-md md:w-52 lg:w-60 bg-orange text-white px-4 py-2 md:px-6 md:py-3"
                    onClick={openEmailModal}
                    aria-label="Save" // Added aria-label for accessibility
                  >
                    Change Account Email
                  </button>
                </div>

                <label className="pt-4 text-sm text-white opacity-0">
                  Mobile Number{" "}
                  <span className="text-xs font-light italic">
                    {" "}
                    ( include country code before your number, e.g.,{" "}
                    <span className="font-medium">63</span> 9125559207 for
                    PH--------------------------------------- )
                  </span>
                </label>
              </div>
              {/* END OF SETTINGS */}
            </div>
          </div>
          {/* END OF TABS */}
        </div>
      </form>
      <div>
        {/* BOTTOM BUTTONS */}
        <div className="flex justify-center gap-2 mt-4 mb-12">
          <button
            className="btn btn-sm w-28 md:btn-md md:w-52 lg:w-60 bg-green text-white px-4 py-2 md:px-6 md:py-3"
            onClick={handleSave} // Add a function to handle saving
            aria-label="Save" // Added aria-label for accessibility
          >
            Save
          </button>
          <button
            onClick={openPassModal}
            className="btn btn-sm w-30 md:btn-md md:w-52 lg:w-60 bg-fgray text-white px-4 py-2 md:px-6 md:py-3"
          >
            Reset Password
          </button>
        </div>

        {/* END OF BOTTOM BUTTONS */}
      </div>
    </>
  );
}

export default UserProfile;
