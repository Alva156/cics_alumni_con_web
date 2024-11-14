import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import axios from "axios";
import forgotpasswordImage from "../../assets/forgotpassword_image.jpg";

function ForgotPassword() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpType, setOtpType] = useState(null);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modal2Visible, setModal2Visible] = useState(false);
  const [modal3Visible, setModal3Visible] = useState(false);
  const [otpSentForEmail, setOtpSentForEmail] = useState(false);
  const [otpSentForSMS, setOtpSentForSMS] = useState(false);

  const navigate = useNavigate();

  const clearErrorAfterDelay = () => {
    setTimeout(() => setError(""), 5000); // 5 seconds
  };

  const clearSuccessAfterDelay = () => {
    setTimeout(() => setSuccess(""), 5000); // 5 seconds
  };

  useEffect(() => {
    if (timer > 0 && (otpSentForEmail || otpSentForSMS)) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else if (timer === 0) {
      setOtpSentForEmail(false);
      setOtpSentForSMS(false);
    }
  }, [timer, otpSentForEmail, otpSentForSMS]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSendEmailOTP = async () => {
    setLoading(true);
    if (!email) {
      setError("Please enter your email");
      clearErrorAfterDelay();
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(`${backendUrl}/users/forget`, {
        email,
      });
      if (response.data.msg) {
        setOtpType("email");
        setOtpSentForEmail(true);
        setOtpSentForSMS(false); // Ensure SMS state remains unchanged
        setShowOTPForm(true);
        setTimer(300); // 5 minutes timer
        setSuccess("OTP sent to your email successfully");
        clearSuccessAfterDelay();
      } else {
        setError("Failed to send OTP");
        clearErrorAfterDelay();
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while sending OTP");
      clearErrorAfterDelay();
    }
    setLoading(false);
  };
  const handleSendSMSOTP = async () => {
    setLoading(true);
    if (!mobileNumber) {
      setError("Please enter your mobile number");
      clearErrorAfterDelay();
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(`${backendUrl}/users/forget`, {
        mobileNumber,
      });
      if (response.data.msg) {
        setOtpType("sms");
        setOtpSentForSMS(true);
        setOtpSentForEmail(false); // Ensure email state remains unchanged
        setShowOTPForm(true);
        setTimer(300);
        setSuccess(
          "OTP sent to your mobile number successfully. Expect the OTP to be sent by 'PhilSMS'"
        );
        clearSuccessAfterDelay();
      } else {
        setError("Failed to send OTP");
        clearErrorAfterDelay();
      }
    } catch (err) {
      setError("An error occurred while sending OTP");
      clearErrorAfterDelay();
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    if (!otp) {
      setError("No OTP input");
      clearErrorAfterDelay();
      setLoading(false);
      return;
    }
    const dataToSend =
      otpType === "email" ? { email, otp } : { mobileNumber, otp };
    try {
      const response = await axios.post(
        `${backendUrl}/users/verifypassword`,
        dataToSend,
        { withCredentials: true }
      );
      if (response.data.msg === "OTP verified successfully") {
        setSuccess("OTP verified successfully");
        clearSuccessAfterDelay();
        setTimeout(() => navigate("/resetpassword"), 3000);
      } else {
        setError("An unexpected error occurred");
        clearErrorAfterDelay();
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError("Invalid OTP");
      } else {
        setError("An error occurred while verifying OTP");
      }
      clearErrorAfterDelay();
    }
    setLoading(false);
  };

  const handleCancelModal = async () => {
    navigate("/login");
  };

  useEffect(() => {
    const handlePopState = (event) => {
      // Prevent default back behavior if modal is visible and OTP form is shown
      if (showOTPForm) {
        event.preventDefault();
        setModal3Visible(true);
        // Push a new state to prevent the default back behavior
        window.history.pushState(null, null, window.location.href);
      }
    };

    // Push an initial state when component mounts
    window.history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [showOTPForm]);

  return (
    <>
      <Header />
      <div className="flex flex-col md:flex-row h-screen overflow-hidden">
        {/* Left Form */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-start bg-white">
          <div className="flex flex-col justify-start h-full">
            <div className="mb-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-6 mt-1 text-left">
                Welcome, CICS Alumni!
              </h1>
              <p className="text-left font-bold text-sm mb-3 md:text-base">
                Reset your password using the available options.
              </p>
              <p className="text-left text-sm md:text-base">
                Choose preferred platform to send OTP
              </p>
              <div className="h-4 mt-4 mb-1">
                {error && <p className="text-red text-xs">{error}</p>}
                {success && <p className="text-green text-xs">{success}</p>}
              </div>
            </div>

            <label className="block mb-4 text-sm font-medium">
              Mobile Number{" "}
              <span className="text-xs font-light italic">
                {" "}
                ( include country code before your number, e.g.,{" "}
                <span className="font-medium">63</span> 9125559207 for PH )
              </span>
            </label>
            <div className="flex items-center mb-4">
              <input
                type="tel"
                className="p-2 border border-black bg-[#D9D9D9] w-full"
                onChange={(e) => setMobileNumber(e.target.value)}
                style={{ height: "40px" }}
              />
              <button
                onClick={handleSendSMSOTP}
                className="btn w-auto ml-2 bg-black text-white hover:bg-black hover:text-white"
                disabled={loading}
              >
                {otpSentForSMS && timer > 0
                  ? "Resend OTP (SMS)"
                  : "Send OTP (SMS)"}
              </button>
            </div>

            <label className="block mb-2 mt-6 text-sm font-medium">Email</label>
            <div className="flex items-center mb-4">
              <input
                type="email"
                className="p-2 border border-black bg-[#D9D9D9] w-full"
                onChange={(e) => setEmail(e.target.value)}
                style={{ height: "40px" }}
              />
              <button
                onClick={handleSendEmailOTP}
                className="btn w-auto ml-2 bg-black text-white hover:bg-black hover:text-white"
                disabled={loading}
              >
                {otpSentForEmail && timer > 0
                  ? "Resend OTP (Email)"
                  : "Send OTP (Email)"}
              </button>
            </div>

            {!otpSentForEmail && !otpSentForSMS && (
              <button
                onClick={() => navigate("/login")}
                className="btn md:w-64 w-52 bg-[#C5C5C5] text-black hover:bg-[#C5C5C5] hover:text-black mt-2"
              >
                Cancel
              </button>
            )}

            {showOTPForm && (
              <>
                <label className="block mb-2 mt-6 text-sm font-medium">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleVerifyOTP();
                    }
                  }}
                  className="mb-3 p-2 border border-black bg-[#D9D9D9] w-full"
                  style={{ height: "40px" }}
                />
                {timer > 0 && (
                  <div className="mb-4 mt-4">
                    <p className="text-left text-sm md:text-base">
                      OTP valid for: {formatTime(timer)}
                    </p>
                  </div>
                )}
                <button
                  onClick={handleVerifyOTP}
                  className="btn md:w-64 w-52 bg-green text-white mt-2 hover:bg-green hover:text-white"
                  disabled={loading}
                >
                  Confirm
                </button>
                <button
                  onClick={() => setModal2Visible(true)}
                  className="btn md:w-64 w-52 bg-[#C5C5C5] text-black hover:bg-[#C5C5C5] hover:text-black mt-2"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Image */}
        <div className="relative w-full md:w-1/2 h-full flex-shrink-0 hidden md:block">
          <div className="absolute inset-0 bg-[#5D0000] opacity-30"></div>
          <img
            src={forgotpasswordImage}
            alt="Forgot Password illustration"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Modal 2 */}
        {modal2Visible && (
          <dialog id="my_modal_5" className="modal modal-middle " open>
            <div className="modal-box">
              <h3 className="font-bold text-lg">Warning!</h3>
              <p className="py-4">
                Canceling the reset password process will prevent the completion
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

        {/* Modal 3 */}
        {modal3Visible && (
          <dialog id="my_modal_5" className="modal modal-middle " open>
            <div className="modal-box">
              <h3 className="font-bold text-lg">Warning!</h3>
              <p className="py-4">
                Are you sure you want to go back to the Login Page? Doing so
                will cancel the process of resetting your password.
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

export default ForgotPassword;
