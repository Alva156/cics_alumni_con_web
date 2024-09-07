import React, { useState } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import signupImage from "../../assets/signup_image.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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

            {/* Form Fields */}
            <label className="block mb-1 mt-2 text-xs font-medium">
              Student ID Number
            </label>
            <input
              type="text"
              placeholder="Enter your Student ID Number"
              className="mb-2 p-2 border border-black bg-[#D9D9D9] w-full"
              style={{ height: "28px" }}
            />

            <label className="block mb-1 text-xs font-medium">
              First Name *
            </label>
            <input
              type="text"
              placeholder="Enter your First Name"
              className="mb-2 p-2 border border-black bg-[#D9D9D9] w-full"
              style={{ height: "28px" }}
            />

            <label className="block mb-1 text-xs font-medium">
              Last Name *
            </label>
            <input
              type="text"
              placeholder="Enter your Last Name"
              className="mb-2 p-2 border border-black bg-[#D9D9D9] w-full"
              style={{ height: "28px" }}
            />

            <label className="block mb-1 text-xs font-medium">Birthday *</label>
            <input
              type="date"
              placeholder="Enter your Birthday"
              className="mb-2 p-2 border border-black bg-[#D9D9D9] w-full"
              style={{ height: "28px" }}
            />

            <label className="block mb-1 text-xs font-medium">Email *</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="mb-2 p-2 border border-black bg-[#D9D9D9] w-full"
              style={{ height: "28px" }}
            />

            <label className="block mb-1 text-xs font-medium">
              Contact Number *
            </label>
            <input
              type="tel"
              placeholder="Enter your Contact Number"
              className="mb-2 p-2 border border-black bg-[#D9D9D9] w-full"
              style={{ height: "28px" }}
            />

            <label className="block mb-1 text-xs font-medium">Password *</label>
            <div className="relative mb-2">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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
                placeholder="Confirm your password"
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

            <button className="bg-[#BE142E] text-white font-bold text-l py-2 px-3 w-full mb-3 transition duration-300 ease-in-out hover:bg-[#a10c2b]">
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
        <div className="relative w-full md:w-1/2 h-full flex-shrink-0 hidden md:block">
          <div className="absolute inset-0 bg-[#5D0000] opacity-30"></div>
          <img
            src={signupImage}
            alt="Sign up illustration"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </>
  );
}

export default Register;
