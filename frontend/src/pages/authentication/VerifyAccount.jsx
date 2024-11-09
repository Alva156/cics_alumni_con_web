import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/Header";
import verifyaccountImage from "../../assets/verifyaccount_image.jpg";
import { useNavigate } from "react-router-dom";

function VerifyAccount() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [otpType, setOtpType] = useState(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
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
      const response = await axios.post(
        `${backendUrl}/users/sendotp`,
        { otpType: type },
        {
          withCredentials: true, // Ensure cookies are sent
        }
      );

      if (response.data.msg === "OTP sent successfully") {
        setOtpSent(true);
        setSuccess(
          `OTP sent successfully to your ${
            type === "Email" ? "email address" : "mobile number by PhilSMS"
          }`
        );
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
      const response = await axios.post(
        `${backendUrl}/users/verify`,
        { otp }, // Include password if needed
        { withCredentials: true }
      );

      if (response.status === 200) {
        const { firstName, lastName, email, mobileNumber, birthday } =
          response.data.user;

        // Optionally, store these details in state to use later for profile creation
        const formData = {
          firstName,
          lastName,
          email,
          mobileNumber,
          birthday,
          // Add any other fields required for profile creation
        };

        // Call the profile creation API
        const profileResponse = await axios.post(
          `${backendUrl}/profile/createuserprofile`,
          formData,
          { withCredentials: true }
        );

        if (profileResponse.status === 201) {
          setSuccess(response.data.msg); // Set success message
          console.log("Verification successful, showing modal");
          setModalVisible(true); // Show the modal
        }

        // Clear the OTP input after successful submission
        setOtp("");
      } else {
        setError("Failed to verify OTP");
        clearErrorAfterDelay();
      }
    } catch (error) {
      console.error("Error during OTP verification:", error);
      setError("Invalid OTP");
      clearErrorAfterDelay();
    }

    setLoading(false);
  };

  const handleCloseModal = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/users/cancel`,
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error cancelling:", error);
    }
  };

  const handleCancelModal = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/users/cancel`,
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error cancelling:", error);
    }
  };
  const handleReturnModal = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/users/cancel`,
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
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
              <div className="h-4">
                {error && <p className="text-red text-xs mb-4">{error}</p>}
              </div>

              <p className="text-left text-sm md:text-base mt-4">
                Choose preferred platform to send OTP
              </p>
            </div>

            <button
              onClick={() => handleOtpTypeSelection("SMS")}
              className="btn md:w-64 w-52 bg-black text-white mt-2 hover:bg-black hover:text-white"
              disabled={loading}
            >
              {otpSent && otpType === "SMS" && timer > 0
                ? "Resend OTP (SMS)"
                : "Send OTP (SMS)"}
            </button>

            <button
              onClick={() => handleOtpTypeSelection("Email")}
              className="btn md:w-64 w-52 bg-black text-white mt-2 hover:bg-black hover:text-white"
              disabled={loading}
            >
              {otpSent && otpType === "Email" && timer > 0
                ? "Resend OTP (Email)"
                : "Send OTP (Email)"}
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
            <div className="h-4">
              {success && <p className="text-green text-xs mb-4">{success}</p>}
            </div>

            {otpSent && (
              <div className="mb-4 mt-4">
                <p className="text-left text-sm md:text-base">
                  OTP valid for: {formatTime(timer)}
                </p>
              </div>
            )}
            <button
              onClick={handleOtpSubmit}
              className="btn md:w-64 w-52 bg-green text-white hover:bg-green hover:text-white"
              disabled={loading}
            >
              Confirm
            </button>

            <button
              onClick={() => setModal2Visible(true)}
              className=" btn md:w-64 w-52 bg-[#C5C5C5] text-black hover:bg-[#C5C5C5] hover:text-black mt-2"
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
