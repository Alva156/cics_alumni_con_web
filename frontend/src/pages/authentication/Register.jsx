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
    mobileNumber: "",
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
  const validatePassword = (password) => {
    const minLength = /.{8,}/; // At least 8 characters
    const upperCase = /[A-Z]/; // At least one uppercase letter
    const digit = /[0-9]/; // At least one digit
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/; // At least one special character

    if (!minLength.test(password)) {
      return "Password must be at least 8 characters long";
    }
    if (!upperCase.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!digit.test(password)) {
      return "Password must contain at least one digit";
    }
    if (!specialChar.test(password)) {
      return "Password must contain at least one special character";
    }
    return null; // No validation error
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      firstName,
      lastName,
      birthday,
      email,
      mobileNumber,
      password,
      confirmPassword,
    } = formData;

    if (
      !firstName ||
      !lastName ||
      !birthday ||
      !email ||
      !mobileNumber ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all required fields");
      setTimeout(() => setError(""), 5000);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setTimeout(() => setError(""), 5000);
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setTimeout(() => setError(""), 5000);
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:6001/users/register",
        formData,
        { withCredentials: true } // Ensure credentials are sent for cookie setting
      );

      if (response.status === 200) {
        setError(response.data.msg);
        setTimeout(() => {
          navigate("/verifyaccount");
        }, 3000);
      } else {
        setError(response.data.msg || "An error occurred during registration");
        setTimeout(() => setError(""), 5000);
      }
    } catch (error) {
      setError(
        error.response?.data?.msg || "An error occurred during registration"
      );
      setTimeout(() => setError(""), 5000);
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
            <label className="block mb-1 text-xs font-medium">
              Mobile Number *
            </label>
            <input
              type="number"
              name="mobileNumber"
              placeholder="Enter your mobile number"
              value={formData.mobileNumber}
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

            <label className="block mb-1 mt-4 text-xs font-medium">
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
