import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/Header";
import verifyaccountImage from "../../assets/verifyaccount_image.jpg";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

function VerifyAccount() {
  const [otpType, setOtpType] = useState(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modal2Visible, setModal2Visible] = useState(false);
  const [modal3Visible, setModal3Visible] = useState(false);
  const navigate = useNavigate();

  const clearErrorAfterDelay = () => {
    setTimeout(() => setError(""), 5000);
  };
  const clearSuccessAfterDelay = () => {
    setTimeout(() => setSuccess(""), 10000);
  };

  useEffect(() => {
    const storedEmail = Cookies.get("userEmail"); // Get email from cookies
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setError("Session expired. Register again");
      setTimeout(() => navigate("/register"), 3000); // Redirect after 3 seconds
    }
  }, [navigate]);

  useEffect(() => {
    if (timer > 0 && otpSent) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer, otpSent]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleOtpTypeSelection = (type) => {
    setOtpType(type);
    sendOtp(type);
  };

  const sendOtp = async (type) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await axios.post("http://localhost:6001/users/sendotp", {
        email: email,
        otpType: type,
      });

      if (response.data.msg === "OTP sent successfully") {
        setOtpSent(true);
        setSuccess("OTP sent successfully");
        setTimer(300); // Set timer for 5 minutes (300 seconds)
        clearSuccessAfterDelay();
      } else {
        setError("Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError("An error occurred while sending OTP");
      clearErrorAfterDelay();
    }

    setLoading(false);
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (!otpType) {
      setError("Please select an OTP type");
      clearErrorAfterDelay();
      return;
    }

    if (!otp) {
      setError("No OTP input");
      clearErrorAfterDelay();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:6001/users/verify", {
        email,
        otp,
      });

      if (response.status === 200) {
        setSuccess("OTP verified successfully.");
        setModalVisible(true); // Show modal on success
      }
    } catch (error) {
      setError("Invalid OTP");
      clearErrorAfterDelay();
    }

    setLoading(false);
  };

  const handleResendOtp = async () => {
    try {
      const response = await axios.post("http://localhost:6001/users/sendotp", {
        email: email,
        otpType,
      });

      if (response.data.msg === "OTP sent successfully") {
        setSuccess("OTP sent successfully");
        setTimer(300);
        clearSuccessAfterDelay();
      } else {
        setError("Failed to resend OTP");
        clearErrorAfterDelay();
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      setError("Choose OTP");
      clearErrorAfterDelay();
    }

    setLoading(false);
  };

  const handleCloseModal = async () => {
    setModalVisible(false);
    try {
      // Make a request to the backend to remove the cookie
      const response = await axios.post("http://localhost:6001/users/cancel");

      if (response.status === 200) {
        // Remove the cookie on the client side
        Cookies.remove("userEmail");

        // Redirect to the desired page
        navigate("/login");
      }
    } catch (error) {
      console.error("Error cancelling:", error);
    }
  };
  const handleCancelModal = async () => {
    try {
      // Make a request to the backend to remove the cookie
      const response = await axios.post("http://localhost:6001/users/cancel");

      if (response.status === 200) {
        // Immediately remove the cookie on the client side
        Cookies.remove("userEmail");

        // Redirect to the login page
        navigate("/login");
      }
    } catch (error) {
      console.error("Error cancelling:", error);
    }
  };
  const handleReturnModal = async () => {
    try {
      // Make a request to the backend to remove the cookie
      const response = await axios.post("http://localhost:6001/users/cancel");

      if (response.status === 200) {
        // Remove the cookie on the client side
        Cookies.remove("userEmail");

        // Redirect to the desired page
        navigate("/register");
      }
    } catch (error) {
      console.error("Error cancelling:", error);
    }
  };
  useEffect(() => {
    const handlePopState = (event) => {
      // Prevent default back behavior if modal is visible
      event.preventDefault();

      // Show the modal first
      setModal3Visible(true);

      // Push a new state to prevent the default back behavior
      window.history.pushState(null, null, window.location.href);
    };

    // Push an initial state when component mounts
    window.history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [modal3Visible]);
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
              <div className="text-red mb-4">
                <p>{error}</p>
              </div>

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
            <div className="text-green mb-4">
              <p>{success}</p>
            </div>
            {otpSent && (
              <div className="mb-4">
                <p className="text-left text-sm md:text-base">
                  OTP valid for: {formatTime(timer)}
                </p>
              </div>
            )}
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
              onClick={() => setModal2Visible(true)}
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

        {/* Modal */}
        {modalVisible && (
          <dialog id="my_modal_5" className="modal modal-middle " open>
            <div className="modal-box">
              <h3 className="font-bold text-lg">Verification Successful</h3>
              <p className="py-4">
                Your account has been verified successfully. You can now log in.
              </p>
              <div className="modal-action">
                <button
                  onClick={handleCloseModal}
                  className=" bg-green text-white py-2 px-4 rounded hover:bg-green"
                >
                  OK
                </button>
              </div>
            </div>
          </dialog>
        )}
        {modal2Visible && (
          <dialog id="my_modal_5" className="modal modal-middle " open>
            <div className="modal-box">
              <h3 className="font-bold text-lg">Warning!</h3>
              <p className="py-4">
                Canceling the verification process will prevent the completion
                of your account.
              </p>
              <div className="modal-action">
                <button
                  className="btn bg-green text-white w-20"
                  onClick={handleCancelModal}
                >
                  Yes
                </button>

                <button
                  className="btn bg-red text-white w-20"
                  onClick={() => setModal2Visible(false)}
                >
                  No
                </button>
              </div>
            </div>
          </dialog>
        )}
        {modal3Visible && (
          <dialog id="my_modal_5" className="modal modal-middle " open>
            <div className="modal-box">
              <h3 className="font-bold text-lg">Warning!</h3>
              <p className="py-4">
                Are you sure you want to go back to the Registration Page? Doing
                so will cancel the process of completing your account.
              </p>
              <div className="modal-action">
                <button
                  className="btn bg-green text-white w-20"
                  onClick={handleReturnModal}
                >
                  Yes
                </button>

                <button
                  className="btn bg-red text-white w-20"
                  onClick={() => setModal3Visible(false)}
                >
                  No
                </button>
              </div>
            </div>
          </dialog>
        )}
      </div>
    </>
  );
}

export default VerifyAccount;
