import React, { useState } from "react";
import Header from "../../components/Header";
import resetpasswordImage from "../../assets/resetpassword_image.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Header />
      <div className="flex flex-col md:flex-row h-screen overflow-hidden">
        {/* Left Form */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-start bg-white">
          <div className="flex flex-col justify-start h-full">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-6 mt-10 text-left">
                Welcome back!
              </h1>
              <p className="text-left font-bold text-sm mb-3 md:text-base">
                Please provide a new password for your account.
              </p>
            </div>

            <label className="block mb-2 text-sm font-medium">
              New Password *
            </label>
            <div className="relative mb-6">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
                className="p-2 border border-black bg-[#D9D9D9] w-full pr-10"
                style={{ height: "40px" }}
              />
              <span
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                <FontAwesomeIcon
                  icon={showPassword ? faEye : faEyeSlash}
                  className="text-black"
                />
              </span>
            </div>

            <label className="block mb-2 text-sm font-medium">
              Confirm New Password *
            </label>
            <div className="relative mb-6">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                className="p-2 border border-black bg-[#D9D9D9] w-full pr-10"
                style={{ height: "40px" }}
              />
              <span
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                <FontAwesomeIcon
                  icon={showPassword ? faEye : faEyeSlash}
                  className="text-black"
                />
              </span>
            </div>

            <button className="bg-[#056E34] text-white text-lg py-2 px-6 w-64 mb-2 mt-0 transition duration-300 ease-in-out hover:bg-[#004A1C]">
              Confirm
            </button>

            <button className="bg-[#C5C5C5] text-black text-lg py-2 px-6 w-64 transition duration-300 ease-in-out hover:bg-[#A8A8A8]">
              Cancel
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative w-full md:w-1/2 h-full flex-shrink-0 hidden md:block">
          <div className="absolute inset-0 bg-[#5D0000] opacity-30"></div>
          <img
            src={resetpasswordImage}
            alt="Reset Password illustration"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </>
  );
}

export default ResetPassword;
