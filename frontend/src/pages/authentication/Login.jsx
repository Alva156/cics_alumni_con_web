import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import signinImage from "../../assets/signin_image.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

function Login() {
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:6001/users/login",
        formData,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", response.data.role);
        sessionStorage.setItem("logoutMessageShown", "false");
        sessionStorage.setItem("loginMessageShown", "false");

        if (response.data.role === "admin") {
          navigate("/admin/homepage");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage(
        error.response?.data?.msg || "An error occurred. Please try again."
      );
      setTimeout(() => {
        setErrorMessage("");
      }, 5000);
    }
  };
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (
      query.get("logout") === "success" &&
      sessionStorage.getItem("logoutMessageShown") === "true"
    ) {
      setShowLogoutMessage(true);

      sessionStorage.removeItem("logoutMessageShown");
      sessionStorage.removeItem("loginMessageShown");

      setTimeout(() => {
        setShowLogoutMessage(false);
      }, 5000);
    }
  }, []);

  return (
    <>
      <Header />
      <div className="flex flex-col md:flex-row h-screen overflow-hidden">
        {showLogoutMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green text-white p-4 rounded-lg shadow-lg z-50">
            <p> Logout success!</p>
          </div>
        )}
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
            {/* Display error message */}
            {errorMessage && (
              <div className="text-red text-sm">{errorMessage}</div>
            )}

            <label className="block mb-2 mt-6 text-sm font-medium">
              Email *
            </label>
            <input
              type="email"
              name="email" // Ensure name is set
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="mb-6 p-2 border border-black bg-[#D9D9D9] w-full"
              style={{ height: "40px" }}
            />

            <label className="block mb-2 text-sm font-medium">Password *</label>
            <div className="relative mb-6">
              <input
                type={showPassword ? "text" : "password"}
                name="password" // Ensure name is set
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
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
              onClick={handleSubmit}
            >
              SIGN IN
            </button>

            <p className="text-left mb-4 mt-8 text-sm">
              Don&apos;t have an account?
            </p>
            <button
              className="bg-[#2D2B2B] text-white font-bold text-lg py-3 px-6 w-full transition duration-300 ease-in-out hover:bg-[#1a1a1a]"
              onClick={() => navigate("/dataprivacy")}
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
