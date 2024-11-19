import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import resetpasswordImage from "../../assets/resetpassword_image.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

function ResetPassword() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [modal2Visible, setModal2Visible] = useState(false);
  const [modal3Visible, setModal3Visible] = useState(false);
  const { newPassword, confirmPassword } = formData;

  const clearErrorAfterDelay = () => {
    setTimeout(() => setError(""), 5000);
  };

  const clearSuccessAfterDelay = () => {
    setTimeout(() => setSuccess(""), 5000);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all password fields");
      clearErrorAfterDelay();
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*_])[A-Za-z\d!@#$%^&*_]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      setError("Password must meet the complexity requirements.");
      clearErrorAfterDelay();
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      clearErrorAfterDelay();
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/users/resetpassword`,
        { newPassword },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setModalVisible(true); // Show modal on success
      } else {
        setError("Failed to reset password");
        clearErrorAfterDelay();
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      setError("Server error occurred");
      clearErrorAfterDelay();
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    navigate("/login"); // Redirect to login after closing the modal
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
        navigate("/forgotpassword");
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
            <form
              onSubmit={handleSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
            >
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold mb-6 mt-10 text-left">
                  Welcome back!
                </h1>
                <p className="text-left font-bold text-sm mb-3 md:text-base">
                  Please provide a new password for your account.
                </p>
                <div className="h-4 mt-4 mb-1">
                  {error && <p className="text-red text-xs">{error}</p>}
                  {success && <p className="text-green text-xs">{success}</p>}
                </div>
              </div>

              <label className="block mb-2 text-sm font-medium">
                New Password *
              </label>
              <div className="relative mb-6">
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="Enter your new password"
                  className="p-2 border border-black bg-[#D9D9D9] w-full pr-10"
                  value={formData.newPassword}
                  onChange={handleChange}
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
              <p className="text-[0.6rem] mb-1 ml-2 sm:text-xs">
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

              <label className="block mb-1 mt-6 text-sm font-medium">
                Confirm New Password *
              </label>
              <div className="relative mb-6">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your new password"
                  className="p-2 border border-black bg-[#D9D9D9] w-full pr-10"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{ height: "40px" }}
                />
                <span
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEye : faEyeSlash}
                    className="text-black"
                  />
                </span>
              </div>

              <button
                type="submit"
                className="btn md:w-64 w-52 bg-green text-white mt-2 hover:bg-green hover:text-white"
              >
                Confirm
              </button>
            </form>

            <button
              onClick={() => setModal2Visible(true)}
              className="btn md:w-64 w-52 bg-[#C5C5C5] text-black hover:bg-[#C5C5C5] hover:text-black mt-2"
            >
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

        {modalVisible && (
          <dialog id="my_modal_5" className="modal modal-middle" open>
            <div className="modal-box">
              <h3 className="font-bold text-lg">Reset Password Successful</h3>
              <p className="py-4">You can now log in with your new password.</p>
              <div className="modal-action">
                <button
                  onClick={handleCloseModal}
                  className="bg-green text-white py-2 px-4 rounded hover:bg-green"
                >
                  OK
                </button>
              </div>
            </div>
          </dialog>
        )}

        {modal2Visible && (
          <dialog id="my_modal_5" className="modal modal-middle" open>
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
        {modal3Visible && (
          <dialog id="my_modal_5" className="modal modal-middle " open>
            <div className="modal-box">
              <h3 className="font-bold text-lg">Warning!</h3>
              <p className="py-4">
                Are you sure you want to go back to the OTP page? Doing so will
                cancel the process of completing your account.
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

export default ResetPassword;
