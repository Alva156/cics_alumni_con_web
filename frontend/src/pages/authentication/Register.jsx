import React, { useState } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import signupImage from "../../assets/signup_image.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

function Register() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
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
  const [modal2Visible, setModal2Visible] = useState(false);
  const [modal3Visible, setModal3Visible] = useState(false);
  const [error, setError] = useState(""); // State for error messages
  const [success, setSuccess] = useState("");
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
  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };
  const validatePassword = (password) => {
    const minLength = /.{8,}/; // At least 8 characters
    const upperCase = /[A-Z]/; // At least one uppercase letter
    const digit = /[0-9]/; // At least one digit
    const specialChar = /[_!@#$%^&*(),.?":{}|<>]/; // At least one special character

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

    // Email validation
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      setTimeout(() => setError(""), 5000);
      return;
    }

    if (email.endsWith("@ust.edu.ph")) {
      setError("UST email is not allowed");
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
        `${backendUrl}/users/register`,
        formData,
        { withCredentials: true } // Ensure credentials are sent for cookie setting
      );

      if (response.status === 200) {
        setSuccess(response.data.msg);
        setTimeout(() => {
          setSuccess("");
          navigate("/verifyaccount");
        }, 3000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.msg;

      // Check if it's a duplicate account error
      if (
        error.response?.status === 400 &&
        errorMsg === "Duplicate accounts are not allowed."
      ) {
        setModal3Visible(true);
      } else if (
        error.response?.status === 400 &&
        errorMsg === "User already exists"
      ) {
        setModal2Visible(true);
      } else {
        // For other errors, display them for 8 seconds
        setError(errorMsg || "An error occurred during registration");
        setTimeout(() => {
          setError("");
        }, 8000); // 8 seconds timeout
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
            <form
              onSubmit={handleSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
            >
              <div className="mb-2">
                <h1 className="text-md md:text-lg lg:text-2xl font-bold mb-1 text-left">
                  Welcome, CICS Alumni!
                </h1>
                <p className="text-left text-xs md:text-sm">
                  Enter required user information and start connecting with us.
                </p>
              </div>
              <div className="h-4">
                {error && <p className="text-red text-xs">{error}</p>}
                {success && <p className="text-green text-xs">{success}</p>}
              </div>
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
                style={{ height: "30px" }}
              />

              <div className="flex mb-2">
                <div className="w-1/2 pr-1">
                  <label className="block mb-1 text-xs font-medium">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Enter your First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="p-2 border border-black bg-[#D9D9D9] w-full"
                    style={{ height: "30px" }}
                  />
                </div>
                <div className="w-1/2 pl-1">
                  <label className="block mb-1 text-xs font-medium">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Enter your Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="p-2 border border-black bg-[#D9D9D9] w-full"
                    style={{ height: "30px" }}
                  />
                </div>
              </div>

              <label className="block mb-1 text-xs font-medium">
                Birthday *
              </label>
              <input
                type="date"
                name="birthday"
                placeholder="Enter your Birthday"
                value={formData.birthday}
                onChange={handleChange}
                className="mb-2 p-2 border border-black bg-[#D9D9D9] w-full"
                style={{ height: "30px" }}
              />

              <label className="block mb-1 text-xs font-medium">Email *</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="mb-2 p-2 border border-black bg-[#D9D9D9] w-full"
                style={{ height: "30px" }}
              />
              <label className="block mb-1 text-xs font-medium">
                Mobile Number *
                <span className="text-xs font-light italic">
                  {" "}
                  ( include country code before your number, e.g.,{" "}
                  <span className="font-medium">63</span> 9125559207 for PH )
                </span>
              </label>
              <input
                type="number"
                name="mobileNumber"
                placeholder="Enter your mobile number"
                value={formData.mobileNumber}
                onChange={handleChange}
                className="mb-2 p-2 border border-black bg-[#D9D9D9] w-full"
                style={{ height: "30px" }}
              />

              <div className="flex mb-2">
                <div className="flex-1 pr-2">
                  <label className="block mb-1 text-xs font-medium">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className="p-2 border border-black bg-[#D9D9D9] w-full pr-10"
                      style={{ height: "30px" }}
                    />
                    {formData.password && (
                      <span
                        className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-500 cursor-pointer"
                        onClick={togglePasswordVisibility}
                      >
                        <FontAwesomeIcon
                          icon={showPassword ? faEye : faEyeSlash}
                          className="text-black"
                        />
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1 pl-2">
                  <label className="block mb-1 text-xs font-medium">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="p-2 border border-black bg-[#D9D9D9] w-full pr-10"
                      style={{ height: "30px" }}
                    />
                    {formData.confirmPassword && (
                      <span
                        className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-500 cursor-pointer"
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        <FontAwesomeIcon
                          icon={showConfirmPassword ? faEye : faEyeSlash}
                          className="text-black"
                        />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-[0.6rem] mt-2 mb-1 ml-2 sm:text-xs">
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
                Must include at least one special character (e.g., !, @, #, $,
                %, ^, &, *)
              </p>

              <button
                type="submit"
                className="btn bg-[#BE142E] text-white font-bold text-l py-2 px-3 w-full mb-3 mt-4 transition duration-300 ease-in-out hover:bg-[#a10c2b]"
              >
                SIGN UP
              </button>
            </form>

            <p className="text-left mb-1 mt-1 text-xs">
              Already have an account?
            </p>
            <button
              className=" btn bg-[#2D2B2B] text-white font-bold text-l py-2 px-3 w-full mb-3  transition duration-300 ease-in-out hover:bg-[#1a1a1a]"
              onClick={() => navigate("/login")}
            >
              SIGN IN
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative w-full md:w-1/2 h-full flex-shrink-0 hidden md:block">
          <img
            src={signupImage}
            alt="Sign Up"
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
      {modal2Visible && (
        <dialog id="my_modal_5" className="modal modal-middle " open>
          <div className="modal-box">
            <h3 className="font-bold text-lg">Oops!</h3>
            <p className="py-4">User already exists</p>
            <div className="modal-action">
              <button
                onClick={() => navigate("/login")}
                className="btn bg-blue text-white w-20"
              >
                Login
              </button>

              <button
                className="btn bg-green text-white w-20"
                onClick={() => setModal2Visible(false)}
              >
                Ok
              </button>
            </div>
          </div>
        </dialog>
      )}
      {modal3Visible && (
        <dialog id="my_modal_5" className="modal modal-middle " open>
          <div className="modal-box">
            <h3 className="font-bold text-lg">Oops!</h3>
            <p className="py-4">Duplicate accounts are not allowed.</p>
            <div className="modal-action">
              <button
                className="btn bg-green text-white w-20"
                onClick={() => setModal3Visible(false)}
              >
                Ok
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}

export default Register;
