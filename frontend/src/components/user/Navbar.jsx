import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import { MdOutlineLogout } from "react-icons/md";
import axios from "axios";

const Navbar = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-8 border-red border-solid border-opacity-75"></div>
    </div>
  );

  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogoutClick = () => {
    setModalVisible(true);
  };
  const logout = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/users/logout`,
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        setLoading(true);

        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userRole");
        sessionStorage.setItem("logoutMessageShown", "true");

        console.log("User has been logged out.");

        // Add a 3-second delay before redirecting
        setTimeout(() => {
          setLoading(false);
          navigate("/login?logout=success");
        }, 2000); // 2000ms = 2 seconds
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <div>
      <div className="navbar bg-white text-black font-light ">
        <div className="navbar-start">
          <div className="dropdown">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost lg:hidden"
              onClick={toggleDropdown}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </div>
            {isDropdownOpen && (
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-white z-20 mt-3 w-72 p-2 shadow"
              >
                <li className="p-2.5 border-b border-hgray last:border-b-0">
                  <button onClick={() => navigate("/")}>Home</button>
                </li>
                <li className="p-2.5 border-b border-hgray last:border-b-0">
                  <button onClick={() => navigate("/user-userprofile")}>
                    User Profile
                  </button>
                </li>
                <li className="p-2.5 border-b border-hgray last:border-b-0">
                  <button onClick={() => navigate("/user-survey")}>
                    Survey
                  </button>
                </li>
                <li className="p-2.5 border-b border-hgray last:border-b-0">
                  <button onClick={() => navigate("/user-threads")}>
                    Threads
                  </button>
                </li>
                <li className="p-2.5 border-b border-hgray last:border-b-0">
                  <details>
                    <summary>Contents</summary>
                    <ul className="p-2.5 z-50">
                      <li className="p-1">
                        <button onClick={() => navigate("/user-companies")}>
                          Companies
                        </button>
                      </li>
                      <li className="p-1">
                        <button onClick={() => navigate("/user-news")}>
                          News
                        </button>
                      </li>
                      <li className="p-1">
                        <button onClick={() => navigate("/user-events")}>
                          Events
                        </button>
                      </li>
                      <li className="p-1">
                        <button
                          onClick={() => navigate("/user-certifications")}
                        >
                          Certifications
                        </button>
                      </li>
                      <li className="p-1">
                        <button
                          onClick={() => navigate("/user-documentrequest")}
                        >
                          Document Request Steps
                        </button>
                      </li>
                      <li className="p-1">
                        <button onClick={() => navigate("/user-job")}>
                          Job/Internship Referrals
                        </button>
                      </li>
                    </ul>
                  </details>
                </li>
                <li className="p-2.5 border-b border-hgray last:border-b-0">
                  <button onClick={() => navigate("/user-alumni")}>
                    Alumni
                  </button>
                </li>
                <li className="p-2.5 ">
                  <button onClick={() => navigate("/user-chatbot")}>
                    Chatbot
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
        <div className="navbar-center hidden lg:flex py-1">
          <ul className="menu menu-horizontal px-1">
            <li className="px-2.5 pr-8">
              <button
                className="font-bold text-gray-700"
                onClick={() => navigate("/")}
              >
                Home
              </button>
            </li>
            <li className="px-2.5 pr-8">
              <button
                className="font-bold text-gray-700"
                onClick={() => navigate("/user-userprofile")}
              >
                User Profile
              </button>
            </li>
            <li className="px-2.5 pr-8">
              <button
                className="font-bold text-gray-700"
                onClick={() => navigate("/user-survey")}
              >
                Survey
              </button>
            </li>
            <li className="px-2.5 pr-8">
              <button
                className="font-bold text-gray-700"
                onClick={() => navigate("/user-threads")}
              >
                Threads
              </button>
            </li>
            <li className="px-2.5 pr-8">
              <details>
                <summary className="font-bold text-gray-700">Contents</summary>
                <ul className="px-2.5 bg-white pr-8 z-20">
                  <li className="p-1 border-b border-hgray last:border-b-0">
                    <button
                      className="font-bold text-gray-700"
                      onClick={() => navigate("/user-companies")}
                    >
                      Companies
                    </button>
                  </li>
                  <li className="px-1 border-b border-hgray last:border-b-0">
                    <button
                      className="font-bold text-gray-700"
                      onClick={() => navigate("/user-news")}
                    >
                      News
                    </button>
                  </li>
                  <li className="px-1 border-b border-hgray last:border-b-0">
                    <button
                      className="font-bold text-gray-700"
                      onClick={() => navigate("/user-events")}
                    >
                      Events
                    </button>
                  </li>
                  <li className="px-1 border-b border-hgray last:border-b-0">
                    <button
                      className="font-bold text-gray-700"
                      onClick={() => navigate("/user-certifications")}
                    >
                      Certifications
                    </button>
                  </li>
                  <li className="px-1 border-b border-hgray last:border-b-0">
                    <button
                      className="font-bold text-gray-700"
                      onClick={() => navigate("/user-documentrequest")}
                    >
                      Document Request Steps
                    </button>
                  </li>
                  <li className="px-1 border-b border-hgray last:border-b-0">
                    <button
                      className="font-bold text-gray-700"
                      onClick={() => navigate("/user-job")}
                    >
                      Job/Internship Referrals
                    </button>
                  </li>
                </ul>
              </details>
            </li>
            <li className="px-2.5 pr-8">
              <button
                className="font-bold text-gray-700"
                onClick={() => navigate("/user-alumni")}
              >
                Alumni
              </button>
            </li>
            <li className="px-2.5">
              <button
                className="font-bold text-gray-700"
                onClick={() => navigate("/user-chatbot")}
              >
                Chatbot
              </button>
            </li>
          </ul>
        </div>
        <div className="navbar-end relative">
          <a
            className="btn btn-ghost px-3 flex items-center gap-2 mr-1.5 md:mr-7"
            onMouseEnter={() => setIsTooltipVisible(true)}
            onMouseLeave={() => setIsTooltipVisible(false)}
            onClick={handleLogoutClick}
          >
            <MdOutlineLogout size={24} />
          </a>

          {isTooltipVisible && (
            <div className="absolute top-full mt-1 mr-3.5 md:mr-7 bg-gray-800 text-white text-xxs md:text-xs rounded py-1 px-1.5 z-10">
              Logout
            </div>
          )}

          {isModalVisible && (
            <dialog id="my_modal_5" className="modal modal-middle " open>
              {loading && <LoadingSpinner />} {/* Show loading spinner */}
              <div className="modal-box">
                <h3 className="font-bold text-lg">Logout</h3>
                <p className="py-4">Are you sure you want to log out?</p>
                <div className="modal-action">
                  <button
                    className="btn bg-green text-white w-20"
                    onClick={logout}
                  >
                    Yes
                  </button>

                  <button
                    className="btn bg-red text-white w-20"
                    onClick={closeModal}
                  >
                    No
                  </button>
                </div>
              </div>
            </dialog>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
