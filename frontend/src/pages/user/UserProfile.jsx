import React, { useState, useEffect, useRef } from "react";
import "../../App.css";
import axios from "axios";
import { uniqueId } from "lodash"; // Ensure lodash is imported

function UserProfile() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]); // Assuming you want to manage multiple user profiles
  const modalRef = useRef(null);

  // States for form data
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
  const [linkedIn, setLinkedIn] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otherContact, setOtherContact] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [accountEmail, setAccountEmail] = useState("");

  const [secondaryEducationSections, setSecondaryEducationSections] = useState([{ schoolName: "", yearStarted: "", yearEnded: "" }]);
  const [tertiaryEducationSections, setTertiaryEducationSections] = useState([{ schoolName: "", program: "", yearStarted: "", yearEnded: "" }]);
  const [companySections, setCompanySections] = useState([{ id: uniqueId(), companyName: "", position: "", yearStarted: "", yearEnded: "" }]);

  // Fetch all users from the server
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:6001/users", {
        withCredentials: true,
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setSelectedUser(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
    // Populate form fields for editing
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setBirthday(user.birthday);
    setProfession(user.profession);
    setCollegeProgram(user.collegeProgram);
    setSpecialization(user.specialization);
    setYearStartedCollege(user.yearStartedCollege);
    setYearGraduatedCollege(user.yearGraduatedCollege);
    setTimeToJob(user.timeToJob);
    setEmploymentStatus(user.employmentStatus);
    setWorkIndustry(user.workIndustry);
    setProfessionAlignment(user.professionAlignment);
    setMaritalStatus(user.maritalStatus);
    setSalaryRange(user.salaryRange);
    setPlaceOfEmployment(user.placeOfEmployment);
    setLinkedIn(user.linkedIn);
    setFacebook(user.facebook);
    setInstagram(user.instagram);
    setEmail(user.email);
    setMobileNumber(user.mobileNumber);
    setOtherContact(user.otherContact);
    setProfileImage(user.profileImage);
    setSecondaryEducationSections(user.secondaryEducation || []);
    setTertiaryEducationSections(user.tertiaryEducation || []);
    setCompanySections(user.careerBackground || []);
  };

  const closeModal = () => {
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setSelectedUser(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "accountEmail": setAccountEmail(value); break;
      case "firstName": setFirstName(value); break;
      case "lastName": setLastName(value); break;
      case "birthday": setBirthday(value); break;
      case "profession": setProfession(value); break;
      case "collegeProgram": setCollegeProgram(value); break;
      case "specialization": setSpecialization(value); break;
      case "yearStartedCollege": setYearStartedCollege(value); break;
      case "yearGraduatedCollege": setYearGraduatedCollege(value); break;
      case "timeToJob": setTimeToJob(value); break;
      case "employmentStatus": setEmploymentStatus(value); break;
      case "professionAlignment": setProfessionAlignment(value); break;
      case "workIndustry": setWorkIndustry(value); break;
      case "maritalStatus": setMaritalStatus(value); break;
      case "salaryRange": setSalaryRange(value); break;
      case "placeOfEmployment": setPlaceOfEmployment(value); break;
      case "linkedIn": setLinkedIn(value); break;
      case "facebook": setFacebook(value); break;
      case "instagram": setInstagram(value); break;
      case "email": setEmail(value); break;
      case "mobileNumber": setMobileNumber(value); break;
      case "otherContact": setOtherContact(value); break;
      default: break;
    }
  };

  const addSecondaryEducationSection = () => {
    setSecondaryEducationSections([...secondaryEducationSections, { schoolName: "", yearStarted: "", yearEnded: "" }]);
  };

  const addTertiaryEducationSection = () => {
    setTertiaryEducationSections([...tertiaryEducationSections, { schoolName: "", program: "", yearStarted: "", yearEnded: "" }]);
  };

  const addCompanySection = () => {
    setCompanySections([...companySections, { id: uniqueId(), companyName: "", position: "", yearStarted: "", yearEnded: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = {
      firstName,
      lastName,
      birthday,
      profession,
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
      secondaryEducation: secondaryEducationSections,
      tertiaryEducation: tertiaryEducationSections,
      careerBackground: companySections,
      contactInformation: {
        linkedIn,
        facebook,
        instagram,
        emailAddress: email,
        mobileNumber,
        other: otherContact,
      },
    };

    try {
      if (!accountEmail) {
        await registerUser(userData); // Assuming this function exists for registration
      } else {
        await updateUserProfile(userData); // Assuming this function exists for updating
      }
      fetchUsers(); // Refresh user list after add/update
      closeModal();
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };
  

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
          <div className="page-title">User Profile</div>

          {/* TABS */}
          <div role="tablist" className="tabs tabs-lifted tabs-xs sm:tabs-sm md:tabs-md lg:tabs-lg">
            <input type="radio" name="my_tabs_2" role="tab" className="tab" aria-label="Primary" defaultChecked />
            <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6 tab-active">
              <div>
                <div className="text-black font-light">
                  {/* PRIMARY INFORMATION */}
                  <div className="text-xl py-4">Primary Information</div>

                  <img src={profileImage} alt="Profile" className="h-40 w-40 border-2" />

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
                    <label className="pt-4 pb-2 text-sm">Birthday *</label>
                    <input
                      type="date"
                      placeholder="Type here"
                      className="input input-sm input-bordered w-full h-10"
                      required
                      name="birthday"
                      value={birthday}
                      onChange={handleChange}
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
                      onChange={handleChange}
                    />
                  </div>

                  <div className="py-1">
                    <label className="pt-4 pb-2 text-sm">College Program</label>
                    <select
                      className="select select-bordered select-sm border-2 w-full h-10"
                      onChange={handleChange}
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
                      onChange={handleChange}
                    />
                  </div>

                  <div className="py-1">
                    <label className="pt-4 pb-2 text-sm">Year Started on College Program</label>
                    <input
                      type="date"
                      placeholder="Type here"
                      className="input input-sm input-bordered w-full h-10"
                      name="yearStartedCollege"
                      value={yearStartedCollege}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="py-1">
                    <label className="pt-4 pb-2 text-sm">Year Graduated on College Program</label>
                    <input
                      type="date"
                      placeholder="Type here"
                      className="input input-sm input-bordered w-full h-10"
                      name="yearGraduatedCollege"
                      value={yearGraduatedCollege}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="py-1">
                    <label className="pt-4 pb-2 text-sm">Time it took to land a job after graduation (Months)</label>
                    <input
                      type="text"
                      placeholder="Type here"
                      className="input input-sm input-bordered w-full h-10"
                      name="timeToJob"
                      value={timeToJob}
                      onChange={handleChange}
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
            <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
              <div>
                <div className="text-xl py-4 mt-4">Secondary Information</div>

                <div className="py-1">
                  <label className="pt-4 pb-2 text-sm">Employment Status</label>
                  <select
                    name="employmentStatus"
                    className="select select-bordered select-sm border-2 w-full h-10"
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                  <label className="pt-4 pb-2 text-sm">Is current profession in line with college degree?</label>
                  <select
                    name="professionAlignment"
                    className="select select-bordered select-sm border-2 w-full h-10"
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                  <label className="pt-4 pb-2 text-sm">Salary Range (PHP)</label>
                  <select
                    name="salaryRange"
                    className="select select-bordered select-sm border-2 w-full h-10"
                    onChange={handleChange}
                    value={salaryRange}
                  >
                    <option value="" disabled>
                      Choose
                    </option>
                    <option>Local</option>
                    <option>International</option>
                  </select>
                </div>

                <div className="py-1">
                  <label className="pt-4 pb-2 text-sm">Place of Employment</label>
                  <select
                    name="placeOfEmployment"
                    className="select select-bordered select-sm border-2 w-full h-10"
                    onChange={handleChange}
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
            <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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

                {attachments.map((attachment) => (
                  <div key={attachment.id}>
                    <label className="pt-4 pb-2 text-sm">
                      Attachment {attachment.id}
                    </label>
                    <input
                      type="file"
                      className="file-input file-input-sm file-input-bordered text-xs w-full h-10 mb-2"
                      onChange={(e) => handleAttachmentChange(e, attachment.id)} // Handle file change
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
                <div className="text-xl py-4 mt-4 w-1/2">Educational Background</div>

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
                        onChange={(e) => handleSecondaryEducationChange(index, e)}
                      />
                    </div>

                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Year Started</label>
                      <input
                        type="date"
                        placeholder="Type here"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.yearStarted}
                        onChange={(e) => handleSecondaryEducationChange(index, e)}
                      />
                    </div>

                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Year Ended</label>
                      <input
                        type="date"
                        placeholder="Type here"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.yearEnded}
                        onChange={(e) => handleSecondaryEducationChange(index, e)}
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
                        onChange={(e) => handleTertiaryEducationChange(index, e)}
                      />
                    </div>

                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Program</label>
                      <input
                        type="text"
                        placeholder="Type here"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.program}
                        onChange={(e) => handleTertiaryEducationChange(index, e)}
                      />
                    </div>

                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Year Started</label>
                      <input
                        type="date"
                        placeholder="Type here"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.yearStarted}
                        onChange={(e) => handleTertiaryEducationChange(index, e)}
                      />
                    </div>

                    <div className="py-1">
                      <label className="pt-4 pb-2 text-sm">Year Ended</label>
                      <input
                        type="date"
                        placeholder="Type here"
                        className="input input-sm input-bordered w-full h-10"
                        value={section.yearEnded}
                        onChange={(e) => handleTertiaryEducationChange(index, e)}
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
                  <div className="text-xl py-4 mt-4 w-1/2">Career Background</div>
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
                    name="accountEmail" // Added name attribute
                    value={accountEmail} // Set the value to state
                    placeholder="Type here"
                    className="input input-sm input-bordered w-full h-10"
                    required
                    onChange={handleChange} // Ensure this updates the state
                  />
                </div>

                <div className="mt-4">
                  <button className="btn md:w-64 w-full bg-fgray text-white" >
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
                className="btn md:w-64 w-52 bg-fgray text-white"
                onClick={handleCancel} // Add a function to handle cancellation
                aria-label="Cancel" // Added aria-label for accessibility
              >
                Cancel
              </button>
            </div>
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
