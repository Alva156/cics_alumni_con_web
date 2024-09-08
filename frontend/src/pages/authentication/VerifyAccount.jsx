import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/Header";
import verifyaccountImage from "../../assets/verifyaccount_image.jpg";
import { useNavigate } from "react-router-dom";

function VerifyAccount() {
  const [otpType, setOtpType] = useState(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(""); // State for email
  const navigate = useNavigate();
  // Get email from local storage or any other source
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail"); // Retrieve email from local storage
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // Handle case where email is not found
      alert("No email address found. Please register again.");
    }
  }, []);

  const handleOtpTypeSelection = (type) => {
    setOtpType(type);
    sendOtp(type);
  };

  const sendOtp = async (type) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:6001/users/sendotp", {
        email: email,
        otpType: type,
      });

      if (response.data.msg === "OTP sent successfully") {
        alert("OTP sent successfully");
      } else {
        alert("Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("An error occurred while sending OTP");
    }
    setLoading(false);
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpType) {
      alert("Please select an OTP type");
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:6001/users/verify", {
        email: email, // Ensure email is sent to the backend for verification
        otp,
      });

      if (response.data.msg === "User verified successfully") {
        navigate("/login");
        alert("OTP verified successfully");
        // Redirect to appropriate page or show success message
      } else {
        alert("Invalid OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("An error occurred during OTP verification");
    }

    setLoading(false);
  };

  const handleResendOtp = async () => {
    if (!otpType) {
      alert("Please select an OTP type");
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:6001/users/sendotp", {
        email: email, // Pass email to backend
        otpType,
      });

      if (response.data.msg === "OTP sent successfully") {
        alert("OTP sent successfully");
      } else {
        alert("Failed to resend OTP");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      alert("An error occurred while resending OTP");
    }

    setLoading(false);
  };

  const handleCancel = () => {
    // Implement navigation or logic for canceling the OTP verification process
  };
  return (
    <>
      <Header />
      <div className="flex flex-col md:flex-row h-screen overflow-hidden">
        {/* Left Form */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-start bg-white">
          <div className="flex flex-col justify-start h-full">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-6 mt-1 text-left">
                Welcome, CICS Alumni!
              </h1>
              <p className="text-left font-bold text-sm mb-3 md:text-base">
                Verify your account using the OTP code to be sent to your mobile
                number or personal email.
              </p>
              <p className="text-left text-sm md:text-base">
                Choose preferred platform to send OTP
              </p>
            </div>

            <button className="bg-[#3D3C3C] text-white text-lg py-2 px-6 w-64 mb-2 mt-0 transition duration-300 ease-in-out hover:bg-[#2C2C2C]">
              SMS
            </button>

            <button
              onClick={() => handleOtpTypeSelection("Email")}
              className="bg-[#3D3C3C] text-white text-lg py-2 px-6 w-64 mb-0 mt-0 transition duration-300 ease-in-out hover:bg-[#2C2C2C]"
              disabled={loading}
            >
              Email
            </button>

            <label className="block mb-2 mt-6 text-sm font-medium">
              Enter OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={handleOtpChange}
              className="mb-3 p-2 border border-black bg-[#D9D9D9] w-full"
              style={{ height: "40px" }}
              disabled={loading}
            />
            <button
              onClick={handleOtpSubmit}
              className="bg-[#056E34] text-white text-lg py-2 px-6 w-64 mb-2 mt-0 transition duration-300 ease-in-out hover:bg-[#004A1C]"
              disabled={loading}
            >
              Confirm
            </button>

            <button
              onClick={handleResendOtp}
              className="bg-[#BE142E] text-white text-lg py-2 px-6 w-64 mb-2 transition duration-300 ease-in-out hover:bg-[#a10c2b]"
              disabled={loading}
            >
              Resend OTP
            </button>

            <button
              onClick={handleCancel}
              className="bg-[#C5C5C5] text-black text-lg py-2 px-6 w-64 transition duration-300 ease-in-out hover:bg-[#A8A8A8]"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative w-full md:w-1/2 h-full flex-shrink-0 hidden md:block">
          <div className="absolute inset-0 bg-[#5D0000] opacity-30"></div>
          <img
            src={verifyaccountImage}
            alt="Verify Account illustration"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </>
  );
}

export default VerifyAccount;
