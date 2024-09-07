import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import signinImage from "../../assets/signin_image.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Header />
      <div className="flex flex-col md:flex-row h-screen overflow-hidden">
        {/* Left Form */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-start bg-white">
          <div className="flex flex-col justify-start h-full px-4 md:px-8">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-left">
                Welcome back!
              </h1>
              <p className="text-left text-sm md:text-base">
                Enter user credentials and continue connecting with us.
              </p>
            </div>

            <label className="block mb-2 mt-6 text-sm font-medium">
              Email *
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="mb-6 p-2 border border-black bg-[#D9D9D9] w-full"
              style={{ height: "40px" }}
            />

            <label className="block mb-2 text-sm font-medium">Password *</label>
            <div className="relative mb-6">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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

            <a
              href="/forgotpassword"
              className="text-sm underline mb-8 block text-left"
            >
              Forgot Password?
            </a>

            <button
              className="bg-[#BE142E] text-white font-bold text-lg py-3 px-6 w-full mb-6 transition duration-300 ease-in-out hover:bg-[#a10c2b]"
              onClick={() => navigate("/")}
            >
              SIGN IN
            </button>

            <p className="text-left mb-4 mt-8 text-sm">
              Don&apos;t have an account?
            </p>
            <button
              className="bg-[#2D2B2B] text-white font-bold text-lg py-3 px-6 w-full transition duration-300 ease-in-out hover:bg-[#1a1a1a]"
              onClick={() => navigate("/register")}
            >
              SIGN UP
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative w-full md:w-1/2 h-full flex-shrink-0 hidden md:block">
          <div className="absolute inset-0 bg-[#5D0000] opacity-30"></div>
          <img
            src={signinImage}
            alt="Login illustration"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </>
  );
}

export default Login;
