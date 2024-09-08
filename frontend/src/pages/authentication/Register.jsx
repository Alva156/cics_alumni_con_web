import React, { useState } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import signupImage from "../../assets/signup_image.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

function Register() {
  const [formData, setFormData] = useState({
    studentNum: "",
    firstName: "",
    lastName: "",
    birthday: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(""); // State for error messages
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all required fields are filled
    const { firstName, lastName, birthday, email, password, confirmPassword } =
      formData;
    if (
      !firstName ||
      !lastName ||
      !birthday ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Send registration data to the backend
      await axios.post("http://localhost:6001/users/register", formData);

      // Save email to session storage
      sessionStorage.setItem("userEmail", formData.email);

      // Redirect to the OTP verification page
      navigate("/verifyaccount");
    } catch (error) {
      if (error.response) {
        setError(
          error.response.data.msg || "An error occurred during registration"
        );
      } else if (error.request) {
        setError("No response from server");
      } else {
        setError("Error in request setup");
      }
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col md:flex-row min-h-screen md:h-screen overflow-hidden">
        {/* Left Form */}
        <div className="w-full md:w-1/2 p-2 md:p-4 flex flex-col justify-start bg-white">
          <div className="flex flex-col px-2 md:px-4 pb-2">
            <div className="mb-2">
              <h1 className="text-md md:text-lg lg:text-2xl font-bold mb-1 text-left">
                Welcome, CICS Alumni!
              </h1>
              <p className="text-left text-xs md:text-sm">
                Enter required user information and start connecting with us.
              </p>
            </div>
            {/* Error Message */}
            {error && <p className="text-red text-xs mb-2">{error}</p>}

            {/* Form Fields */}
            <label className="block mb-1 mt-2 text-xs font-medium">
              Student ID Number
            </label>
            <input
              type="text"
              name="studentNum"
              placeholder="Enter your Student ID Number"
              value={formData.studentNum}
              onChange={handleChange}
              className="mb-2 p-2 border border-black bg-[#D9D9D9] w-full"
              style={{ height: "28px" }}
            />
            <label className="block mb-1 text-xs font-medium">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              placeholder="Enter your First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="mb-2 p-2 border border-black bg-[#D9D9D9] w-full"
              style={{ height: "28px" }}
            />

            <label className="block mb-1 text-xs font-medium">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              placeholder="Enter your Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="mb-2 p-2 border border-black bg-[#D9D9D9] w-full"
              style={{ height: "28px" }}
            />

            <label className="block mb-1 text-xs font-medium">Birthday *</label>
            <input
              type="date"
              name="birthday"
              placeholder="Enter your Birthday"
              value={formData.birthday}
              onChange={handleChange}
              className="mb-2 p-2 border border-black bg-[#D9D9D9] w-full"
              style={{ height: "28px" }}
            />

            <label className="block mb-1 text-xs font-medium">Email *</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="mb-2 p-2 border border-black bg-[#D9D9D9] w-full"
              style={{ height: "28px" }}
            />

            <label className="block mb-1 text-xs font-medium">Password *</label>
            <div className="relative mb-2">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="p-2 border border-black bg-[#D9D9D9] w-full pr-10"
                style={{ height: "28px" }}
              />
              <span
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-500 cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                <FontAwesomeIcon
                  icon={showPassword ? faEye : faEyeSlash}
                  className="text-black"
                />
              </span>
            </div>

            <label className="block mb-1 text-xs font-medium">
              Confirm Password *
            </label>
            <div className="relative mb-5">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="p-2 border border-black bg-[#D9D9D9] w-full pr-10"
                style={{ height: "28px" }}
              />
              <span
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-500 cursor-pointer"
                onClick={toggleConfirmPasswordVisibility}
              >
                <FontAwesomeIcon
                  icon={showConfirmPassword ? faEye : faEyeSlash}
                  className="text-black"
                />
              </span>
            </div>

            <button
              type="submit"
              onClick={handleSubmit}
              className="bg-[#BE142E] text-white font-bold text-l py-2 px-3 w-full mb-3 transition duration-300 ease-in-out hover:bg-[#a10c2b]"
            >
              SIGN UP
            </button>

            <p className="text-left mb-1 mt-1 text-xs">
              Already have an account?
            </p>
            <button
              className="bg-[#2D2B2B] text-white font-bold text-l py-2 px-3 w-full transition duration-300 ease-in-out hover:bg-[#1a1a1a]"
              onClick={() => navigate("/login")}
            >
              SIGN IN
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative w-full md:w-1/2 bg-gray-200 flex items-center justify-center">
          <img
            src={signupImage}
            alt="Sign Up"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </>
  );
}

export default Register;
