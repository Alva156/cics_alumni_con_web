import React, { useState } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";

function DataPrivacy() {
  const navigate = useNavigate();
  const [isChecked1, setIsChecked1] = useState(false);
  const [isChecked2, setIsChecked2] = useState(false);

  const handleCheckboxChange = (checkbox) => {
    if (checkbox === 1) {
      setIsChecked1(!isChecked1);
    } else if (checkbox === 2) {
      setIsChecked2(!isChecked2);
    }
  };

  const isFormValid = isChecked1 && isChecked2;

  return (
    <>
      <Header />
      <div className="text-black mx-4 md:mx-8 lg:mx-16 mt-8 mb-12 h-screen flex flex-col">
        <h1 className="text-2xl mb-4 mt-4 font-bold">Data Privacy Agreement</h1>

        {/* Scrollable container */}
        <div className="flex-grow bg-[#D9D9D9] p-6 leading-loose overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
          <h1 className="text-2xl mb-4 mt-4 font-bold">Steps to Access the Website</h1>
          <ol className="list-decimal pl-5">
            <li className="font-bold">Register an Account</li>
            <ul className="list-disc pl-5">
              <li>Navigate to the registration page on our website.</li>
              <li>Provide the required personal information to create your account.</li>
              <li>Ensure that all details are accurate and complete before submitting your registration.</li>
            </ul>

            <li className="font-bold mt-4">Complete the Verification Process</li>
            <ul className="list-disc pl-5">
              <li>After registering, you will receive a verification email or SMS with a unique code.</li>
              <li>Enter the verification code on the website to confirm your account.</li>
            </ul>

            <li className="font-bold mt-4">Log In</li>
            <ul className="list-disc pl-5">
              <li>Visit the login page of the website.</li>
              <li>Enter your registered email address and password.</li>
              <li>Click the “Log In” button to access your account. If you forget your password, use the "Forgot Password" link to reset it.</li>
            </ul>

            <li className="font-bold mt-4">Explore and Browse</li>
            <ul className="list-disc pl-5">
              <li>Once logged in, you can navigate through the various sections of the website.</li>
              <li>Browse through available features, connect with other users, and access content relevant to your interests and needs.</li>
            </ul>

            <li className="font-bold mt-4">Customize Your Experience</li>
            <ul className="list-disc pl-5">
              <li>Update your user profile with additional information.</li>
            </ul>

            <li className="font-bold mt-4">Inquire</li>
            <ul className="list-disc pl-5">
              <li>If you have questions, visit the FAQ page for assistance.</li>
            </ul>
          </ol>

          <h1 className="text-2xl mb-4 mt-4 font-bold">Terms and Conditions</h1>
          <ul className="pl-5">
            <li className="font-bold">Acceptance of Terms</li>
            <p>By registering for and using the CICS Alumni App, you agree to be bound by these terms and conditions. If you do not agree, please do not use the platform.</p>
            <li className="font-bold mt-3">User Accounts</li>
            <p>You are responsible for maintaining the confidentiality of your account information, including your password and other login credentials. Alumni are the primary users of the platform.</p>
            <li className="font-bold mt-3">User Data</li>
            <p>You agree to provide accurate and complete information during the registration process. You also agree to update your information as necessary to keep it accurate and complete.</p>
            <li className="font-bold mt-3">Privacy</li>
            <p>Your use of the platform is also governed by our Data Policy, which is incorporated by reference into these Terms and Conditions. Please review our Data Policy to understand our practices.</p>
            <li className="font-bold mt-3">Use of the Platform</li>
            <p>You agree to use the platform in accordance with all applicable laws and regulations. You agree not to use the platform for any unlawful or prohibited activities.</p>
            <li className="font-bold mt-3">Intellectual Property</li>
            <p>All content, trademarks, and data on the platform are the property of CICS and are protected by applicable intellectual property laws. You agree not to infringe upon these rights.</p>
            <li className="font-bold mt-3">Limitation of Liability</li>
            <p>CICS shall not be liable for any direct, indirect, incidental, special, or consequential damages arising out of your use of the platform.</p>
            <li className="font-bold mt-3">Code of Conduct</li>
            <p>The use of bad conduct, foul language, or any form of abusive, offensive, or inappropriate content in posts, comments, or any other interactions on the platform is strictly prohibited.</p>
            <li className="font-bold mt-3">Termination</li>
            <p>We reserve the right to terminate or suspend your account and access to the platform at our sole discretion, without notice and without liability, for conduct that we believe violates these terms.</p>
          </ul>

          <h1 className="text-2xl mb-4 mt-4 font-bold">Data Policy Agreement</h1>
          <h2 className="font-bold mb-2">Personal Information Collected</h2>
          <ul className="list-disc pl-5">
            <li>Name</li>
            <li>Student ID</li>
            <li>Birthday</li>
            <li>Account Email</li>
            <li>Profile Picture</li>
            <li>Profession</li>
            <li>College Program</li>
            <li>Specialization</li>
            <li>Year Started and Graduated College</li>
            <li>Time it Took to Land a Job After Graduation (Months)</li>
            <li>Employment Status</li>
            <li>Work Industry</li>
            <li>Is Current Profession in Line with College Degree</li>
            <li>Marital Status</li>
            <li>Salary Range (PHP)</li>
            <li>Place of Employment (Local or International)</li>
            <li>Contact Information (LinkedIn, Facebook, Instagram, Email, Mobile Number, and Other)</li>
            <li>Tertiary and Secondary Education Background</li>
            <li>Career Background</li>
            <li>Attachments for Profile Boost</li>
            <li>Answers to the surveys made by the system</li>
            <li>Discussions and interactions within the threads section</li>
          </ul>

          <h2 className="font-bold mt-4 mb-2">Use of Data</h2>
          <ul className="list-disc pl-5">
            <li>To verify alumni identity during registration for exclusive UST CICS alumni access.</li>
            <li>To facilitate networking and professional connections by allowing alumni and admins to view each other’s profiles and contact details for further communication.</li>
            <li>To allow admins to view all aspects or fields of alumni data.</li>
            <li>To generate comprehensive reports and data dashboards on registered alumni’s user profile information to support administrative analysis and decision-making.</li>
            <li>To support open discussions in threads, enabling alumni and admin to share insights and engage with one another.</li>
            <li>To analyze discussions from the threads to improve community engagement and refine our services.</li>
            <li>To review and analyze survey responses for administrative purposes.</li>
          </ul>

          <h2 className="font-bold mt-4 mb-2">Data Sharing</h2>
          <p>Your data will be visible to other registered alumni within the platform and to the admin as well. We will not share your personal information with third parties without your consent, except as required by law.</p>

          <h2 className="font-bold mt-4 mb-2">Data Security</h2>
          <p>We are committed to protecting your personal information. During registration, we use two-factor authentication by sending an OTP via email or SMS for verification.</p>

          <h2 className="font-bold mt-4 mb-2">User Rights</h2>
          <p>You have the right to access, correct, or delete your personal data stored on our platform. You may also withdraw your consent for data processing at any time by contacting us.</p>

          <h2 className="font-bold mt-4 mb-2">Data Retention</h2>
          <p>We will retain your personal information as long as your account is active or as needed to provide you services. When your information is no longer required, we will delete it securely.</p>

          <h2 className="font-bold mt-4 mb-2">Changes to the Data Policy</h2>
          <p>We may update this Data Policy from time to time. We will notify you of any changes by posting the new Data Policy on our platform.</p>
        </div>

        {/* Checkboxes */}
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="check1"
              className="mr-2"
              checked={isChecked1}
              onChange={() => handleCheckboxChange(1)}
              style={{ width: "1rem", height: "1rem" }}
            />
            <label htmlFor="check1" className="text-base font-normal">
              I have read, understood, and agree to the Privacy Policy of Alumni Connect.
            </label>
          </div>

          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="check2"
              checked={isChecked2}
              onChange={() => handleCheckboxChange(2)}
              className="mr-2"
              style={{ width: "1rem", height: "1rem" }}
            />
            <label htmlFor="check2" className="text-base font-normal">
              I agree to the use of my personal information for educational purposes of the University.
            </label>
          </div>
        </div>

        <div className="flex justify-center mt-8 space-x-3">
          <button
            onClick={() => navigate("/login")}
            className="btn md:w-44 w-52 bg-[#D9D9D9] text-black rounded-none transition duration-300 ease-in-out hover:bg-[#A8A8A8]"
          >
            Cancel
          </button>
          <button
            onClick={() => navigate("/register")}
            disabled={!isFormValid}
            className="btn md:w-44 w-52 bg-[#056E34] text-white rounded-none transition duration-300 ease-in-out hover:bg-[#004A1C]"
          >
            Agree
          </button>
        </div>
      </div>
    </>
  );
}

export default DataPrivacy;
