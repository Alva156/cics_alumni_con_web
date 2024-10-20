import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import signinImage from "../../assets/signin_image.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

function Login() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-8 border-red border-solid border-opacity-75"></div>
    </div>
  );

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

    // Initialize loading state to false at the beginning
    setLoading(false);

    // Validate email and password inputs
    if (!formData.email || !formData.password) {
      setErrorMessage("Please enter your email and password.");
      setTimeout(() => {
        setErrorMessage("");
      }, 8000);
      return; // Exit the function if validation fails
    }

    // Start loading immediately when the form is submitted
    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/users/login`, formData, {
        withCredentials: true,
      });

      // Set a 2-second loading time before handling the response
      setTimeout(() => {
        if (response.data.success) {
          // Successful login
          localStorage.setItem("isLoggedIn", "true");
          sessionStorage.setItem("logoutMessageShown", "false");
          sessionStorage.setItem("loginMessageShown", "false");

          if (response.data.role === "admin") {
            navigate("/admin/homepage");
          } else {
            navigate("/");
          }
        } else {
          // Handle failed response if needed
          const message =
            response.data.msg || "An error occurred. Please try again.";
          setErrorMessage(message);
        }
        // Hide loading after processing
        setLoading(false);
      }, 2000); // Wait for 2 seconds
    } catch (error) {
      console.error("Error during login:", error);

      // Ensure loading is set to false after 2 seconds
      setTimeout(() => {
        setLoading(false);

        // Determine the error message
        const message =
          error.response?.data?.msg || "An error occurred. Please try again.";
        setErrorMessage(message);

        setTimeout(() => {
          setErrorMessage("");
        }, 8000);
      }, 2000); // Wait for 2 seconds before handling the error
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
        {loading && <LoadingSpinner />} {/* Show loading spinner */}
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

            <div className="h-4">
              {errorMessage && (
                <p className="text-red text-xs">{errorMessage}</p>
              )}
            </div>

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

            <div className="text-sm underline mb-8 block text-left">
              <a href="/forgotpassword">Forgot Password?</a>
            </div>

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
          <div
            className="absolute bottom-4 right-4 bg-black text-white text-sm p-2 rounded"
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              color: "white",
              padding: "10px",
              borderRadius: "5px",
              fontSize: "14px",
              zIndex: "20",
              textAlign: "right",
            }}
          >
            Photo Courtesy of UST SITE
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
