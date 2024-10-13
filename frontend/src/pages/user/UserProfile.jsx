import React, { useState, useEffect } from "react";
import "../../App.css";
import axios from "axios";
import { uniqueId } from "lodash"; // Make sure you import uniqueId
import imageCompression from "browser-image-compression";

function UserProfile() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    const newAttachments = [...attachments]; // Copy the current attachments array
  
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
  
      axios
        .post(`${backendUrl}/profile/uploadfile`, formData, {
          withCredentials: true,
        })
        .then((response) => {
          // Assuming the backend responds with the correct file path and filename
          newAttachments[index] = {
            ...newAttachments[index],
            id: newAttachments[index].id, // Keep the same ID
            filename: file.name,          // Filename from the uploaded file
            filepath: response.data.filepath, // File path from the server response
          };
          setAttachments(newAttachments); // Update the state with the new attachment data
        })
        .catch((error) => console.error("Error uploading file:", error));
    }
  };
  

  // Function to add a new attachment field
  const addAttachment = () => {
    setAttachments((prev) => [
      ...prev,
      { id: uniqueId(), file: null, fileName: "" }, // Initialize with a unique ID and empty values
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

  const handleSave = (e) => {
    console.log("saved");
    e.preventDefault(); // Prevent default form submission
    handleSubmit(e); // Call the handleSubmit function to save the form data
  };

  // Handle form submission
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
      await axios.get(`${backendUrl}/profile/userprofile`, { withCredentials: true });

      // Update the existing profile
      await axios.put(`${backendUrl}/profile/updateprofile`, userData, {
        withCredentials: true,
      });
      console.log("Profile updated successfully!");
      setValidationMessage("Profile saved successfully!");
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
        console.error("Error saving profile:", error.response ? error.response.data : error.message);
        setErrorMessage("Error saving profile. Please try again.");
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 3000);
      }
    }

    // Show validation message for successful save
    setShowValidationMessage(true);
    setTimeout(() => setShowValidationMessage(false), 3000);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("Sending request to fetch profile...");
        const response = await axios.get(`${backendUrl}/profile/userprofile`, {
          withCredentials: true,
        });

        console.log("Profile fetched:", response.data);

        const profileData = response.data;

        // Check if profile data is populated and set the form values
        if (profileData) {
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
          // Set secondary education, tertiary education, company sections, and attachments
          setSecondaryEducationSections(
            profileData.secondaryEducationSections || []
          );
          setTertiaryEducationSections(
            profileData.tertiaryEducationSections || []
          );
          setCompanySections(profileData.companySections || []);
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
        console.error(
          "Error fetching profile:",
          error.response ? error.response.data : error.message
        );
      }
    };

    fetchProfile();
  }, []);

  return (
    <>
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

                {attachments.length > 0 ? (
                  attachments.map((attachment) => (
                    <div key={attachment.id}>
                      <label className="pt-4 pb-2 text-sm">
                        Attachment {attachment.id}
                      </label>
                      <div className="text-sm text-gray-600">
                        {attachment.fileName || "No file uploaded."}
                      </div>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="file-input file-input-sm file-input-bordered text-xs w-full h-10 mb-2"
                        onChange={(e) => handleFileChange(e, index)} // Handle file change
                      />
                    </div>
                  ))
                ) : (
                  <p>No attachments available.</p>
                )}
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
                      />
                    </div>

                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Year Started</label>
                      <input
                        type="date"
                        placeholder="Type here"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.yearStarted}
                        onChange={(e) =>
                          handleSecondaryEducationChange(index, e)
                        }
                      />
                    </div>

                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Year Ended</label>
                      <input
                        type="date"
                        placeholder="Type here"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.yearEnded}
                        onChange={(e) =>
                          handleSecondaryEducationChange(index, e)
                        }
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
                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">School Name</label>
                      <input
                        type="text"
                        placeholder="Type here"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.schoolName}
                        onChange={(e) =>
                          handleTertiaryEducationChange(index, e)
                        }
                      />
                    </div>

                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Program</label>
                      <input
                        type="text"
                        placeholder="Type here"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.program}
                        onChange={(e) =>
                          handleTertiaryEducationChange(index, e)
                        }
                      />
                    </div>

                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Year Started</label>
                      <input
                        type="date"
                        placeholder="Type here"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.yearStarted}
                        onChange={(e) =>
                          handleTertiaryEducationChange(index, e)
                        }
                      />
                    </div>

                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Year Ended</label>
                      <input
                        type="date"
                        placeholder="Type here"
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
                    key={section.id}
                    className="w-full border-2 rounded py-2 px-4 mt-2"
                  >
                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Company Name</label>
                      <input
                        type="text"
                        placeholder="Type here"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.companyName}
                        onChange={(e) => handleCompanyChange(index, e)}
                      />
                    </div>

                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Position</label>
                      <input
                        type="text"
                        placeholder="Type here"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.position}
                        onChange={(e) => handleCompanyChange(index, e)}
                      />
                    </div>

                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Year Started</label>
                      <input
                        type="date"
                        placeholder="Type here"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.yearStarted}
                        onChange={(e) => handleCompanyChange(index, e)}
                      />
                    </div>

                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Year Ended</label>
                      <input
                        type="date"
                        placeholder="Type here"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.yearEnded}
                        onChange={(e) => handleCompanyChange(index, e)}
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

                <div className="mt-4">
                  <button className="btn md:w-64 w-full bg-fgray text-white">
                    Reset Password
                  </button>
                </div>
              </div>
              {/* END OF SETTINGS */}
            </div>
          </div>
          {/* END OF TABS */}

          {/* BOTTOM BUTTONS */}
          <div className="flex justify-center mt-16 space-x-3">
            <div>
              <button
                className="btn md:w-64 w-52 bg-green text-white"
                onClick={handleSave} // Add a function to handle saving
                aria-label="Save" // Added aria-label for accessibility
              >
                Save
              </button>
            </div>
          </div>
          {/* END OF BOTTOM BUTTONS */}
        </div>
      </form>
    </>
  );
}

export default UserProfile;
