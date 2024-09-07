import React, { useState, useEffect, useRef } from "react";
import sampleidpic from "../../assets/sampleidpic.jpg";

function Alumni() {
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const modalRef = useRef(null);

  const alumni = [
    {
      name: "Andrei Cimoune Alvarico",
      profession: "Top 1 Programmer PH",
      image: sampleidpic,
      collegeprogram: "Information Technology",
      specialization: "Web and Mobile App Development",
      yearstarted: "2021",
      yeargraduated: "2025",
      joblanding: "2",
      employmentstatus: "Employed",
      workindustry: "Telecommunications",
      currentprofession: "Yes",
      maritalstatus: "Single",
      salaryrange: "500,000 - 999,000 PHP",
      employmentplace: "Local",
      secondaryeducation: "Far Eastern University - Diliman",
      secondaryeducationyear: "2019-2021",
      tertiaryeducation: "University of Santo Tomas",
      tertiaryeducationdegree: "Bachelor of Science in Information Technology",
      tertiaryeducationyear: "2021-2025",
      career: "Google LLC",
      careerposition: "Software Engineer",
      careeryear: "2025-2030",
      linkedin: "andrei@linkedin",
      facebook: "andrei@facebook",
      instagram: "andrei@insta",
      email: "andrei@gmail",
      mobilenumber: "09223334444",
    },
    {
      name: "Alessandra Claire Cruz",
      profession: "Software Developer",
      image: sampleidpic,
      collegeprogram: "Information Technology",
      specialization: "Web and Mobile App Development",
      yearstarted: "2021",
      yeargraduated: "2025",
      joblanding: "2",
      employmentstatus: "Employed",
      workindustry: "Telecommunications",
      currentprofession: "Yes",
      maritalstatus: "Single",
      salaryrange: "500,000 - 999,000 PHP",
      employmentplace: "Local",
      secondaryeducation: "Far Eastern University - Diliman",
      secondaryeducationyear: "2019-2021",
      tertiaryeducation: "University of Santo Tomas",
      tertiaryeducationdegree: "Bachelor of Science in Information Technology",
      tertiaryeducationyear: "2021-2025",
      career: "Google LLC",
      careerposition: "Software Engineer",
      careeryear: "2025-2030",
      linkedin: "claire@linkedin",
      facebook: "claire@facebook",
      instagram: "claire@insta",
      email: "claire@gmail",
      mobilenumber: "09223334444",
    },
    {
      name: "James Lorenz Santos",
      profession: "Software Engineering Specialist",
      image: sampleidpic,
      collegeprogram: "Information Technology",
      specialization: "Web and Mobile App Development",
      yearstarted: "2021",
      yeargraduated: "2025",
      joblanding: "2",
      employmentstatus: "Employed",
      workindustry: "Telecommunications",
      currentprofession: "Yes",
      maritalstatus: "Single",
      salaryrange: "500,000 - 999,000 PHP",
      employmentplace: "Local",
      secondaryeducation: "Far Eastern University - Diliman",
      secondaryeducationyear: "2019-2021",
      tertiaryeducation: "University of Santo Tomas",
      tertiaryeducationdegree: "Bachelor of Science in Information Technology",
      tertiaryeducationyear: "2021-2025",
      career: "Google LLC",
      careerposition: "Software Engineer",
      careeryear: "2025-2030",
      linkedin: "james@linkedin",
      facebook: "james@facebook",
      instagram: "james@insta",
      email: "james@gmail",
      mobilenumber: "09223334444",
    },
    {
      name: "Denise Anne Valdivieso",
      profession: "Multi-awarded Software Engineer",
      image: sampleidpic,
      collegeprogram: "Information Technology",
      specialization: "Web and Mobile App Development",
      yearstarted: "2021",
      yeargraduated: "2025",
      joblanding: "2",
      employmentstatus: "Employed",
      workindustry: "Telecommunications",
      currentprofession: "Yes",
      maritalstatus: "Single",
      salaryrange: "500,000 - 999,000 PHP",
      employmentplace: "Local",
      secondaryeducation: "Far Eastern University - Diliman",
      secondaryeducationyear: "2019-2021",
      tertiaryeducation: "University of Santo Tomas",
      tertiaryeducationdegree: "Bachelor of Science in Information Technology",
      tertiaryeducationyear: "2021-2025",
      career: "Google LLC",
      careerposition: "Software Engineer",
      careeryear: "2025-2030",
      linkedin: "denval@linkedin",
      facebook: "denval@facebook",
      instagram: "denval@insta",
      email: "denval@gmail",
      mobilenumber: "09223334444",
    },
  ];

  const openModal = (alumni) => {
    setSelectedAlumni(alumni);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAlumni(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isModalOpen]);

  const filteredAlumni = alumni.filter((alumni) =>
    alumni.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
      <h1 className="text-xl mb-4">Alumni</h1>

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search Alumni"
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

      <div className="flex md:flex-row">
        <div className="mb-6">
          <span className="text-sm">Sort by:</span>
          <select className="ml-2 border border-black rounded px-3 py-1 text-sm mr-10">
            <option>Name (A-Z)</option>
            <option>Name (Z-A)</option>
          </select>
        </div>
        <div className="mb-6">
          <span className="text-sm">Filter:</span>
          <select className="ml-2 border border-black rounded px-3 py-1 text-sm">
            <option>Computer Science</option>
            <option>Information Systems</option>
            <option>Information Technology</option>
          </select>
        </div>
      </div>

      <div className="text-lg mb-4">All Alumni</div>

      <hr className="mb-6 border-black" />

      {filteredAlumni.map((alumni, index) => (
        <div
          key={index}
          className="mb-4 p-4 border border-black rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => openModal(alumni)}
        >
          <div className="text-md font-medium mb-1">{alumni.name}</div>
          <div className="text-sm text-black-600">{alumni.profession}</div>
        </div>
      ))}

      {/* Modal */}
      {isModalOpen && selectedAlumni && (
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

            <div className="">
              {selectedAlumni.image && (
                <div className="mb-4">
                  <img
                    src={selectedAlumni.image}
                    alt="Alumni"
                    className="w-32 h-32"
                  />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 justify-between">
                <div className="order-1 sm:order-1">
                  <h1 className="text-xl mb-4">Primary Information</h1>
                  <p className="text-xs mb-1/2">Name</p>
                  <p className="text-s mb-2 font-bold">{selectedAlumni.name}</p>
                  <p className="text-xs mb-1/2">Profession</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.profession}
                  </p>
                  <p className="text-xs mb-1/2">College Program</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.collegeprogram}
                  </p>
                  <p className="text-xs mb-1/2">Specialization</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.specialization}
                  </p>
                  <p className="text-xs mb-1/2">
                    Year Started on College Program
                  </p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.yearstarted}
                  </p>
                  <p className="text-xs mb-1/2">
                    Year Graduated on College Program
                  </p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.yeargraduated}
                  </p>
                  <p className="text-xs mb-1/2">
                    Time it took to land a job after graduation (Months)
                  </p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.joblanding}
                  </p>
                </div>
                <div className="order-3 sm:order-2">
                  <h1 className="text-xl mb-4">Contact Information</h1>
                  <p className="text-xs mb-1/2">LinkedIn</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.linkedin}
                  </p>
                  <p className="text-xs mb-1/2">Facebook</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.facebook}
                  </p>
                  <p className="text-xs mb-1/2">Instagram</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.instagram}
                  </p>
                  <p className="text-xs mb-1/2">Email Address</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.email}
                  </p>
                  <p className="text-xs mb-1/2">Mobile Number</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.mobilenumber}
                  </p>
                </div>
                <div className="order-2 sm:order-3">
                  <h1 className="text-xl mb-4 mt-6">Secondary Information</h1>
                  <p className="text-xs mb-1/2">Employment Status</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.employmentstatus}
                  </p>
                  <p className="text-xs mb-1/2">Work Industry</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.workindustry}
                  </p>
                  <p className="text-xs mb-1/2">
                    Is current profession in line with college degree
                  </p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.currentprofession}
                  </p>
                  <p className="text-xs mb-1/2">Marital Status</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.maritalstatus}
                  </p>
                  <p className="text-xs mb-1/2">Salary range (PHP)</p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.salaryrange}
                  </p>
                  <p className="text-xs mb-1/2">
                    Place of employment (Local or International)
                  </p>
                  <p className="text-s mb-2 font-bold">
                    {selectedAlumni.employmentplace}
                  </p>
                </div>
                <div className="order-4 sm:order-4">
                  <h1 className="text-xl mb-4 mt-6">Attachments</h1>
                </div>
              </div>

              <div className="block md:flex-row md:flex justify-between"></div>

              <h1 className="text-xl mb-4 mt-6">Educational Background</h1>
              <p className="text-xs mb-1">Secondary Education</p>
              <p className="text-s font-bold">
                {selectedAlumni.secondaryeducation}
              </p>
              <p className="text-xs mb-2">
                {selectedAlumni.secondaryeducationyear}
              </p>
              <p className="text-xs mb-1 mt-3">Tertiary Education</p>
              <p className="text-s font-bold">
                {selectedAlumni.tertiaryeducation}
              </p>
              <p className="text-xs mb-1 italic">
                {selectedAlumni.tertiaryeducationdegree}
              </p>
              <p className="text-xs mb-2">
                {selectedAlumni.tertiaryeducationyear}
              </p>

              <h1 className="text-xl mb-4 mt-6">Career Background</h1>
              <p className="text-s font-bold">{selectedAlumni.career}</p>
              <p className="text-xs mb-1 italic">
                {selectedAlumni.careerposition}
              </p>
              <p className="text-xs mb-2">{selectedAlumni.careeryear}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Alumni;
