import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import { MdOutlineLogout } from "react-icons/md";
import axios from "axios";

const NavbarAdmin = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
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
        "http://localhost:6001/users/logout",
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
  
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userRole");
        sessionStorage.setItem("logoutMessageShown", "true");

        console.log("User has been logged out.");

       
        setTimeout(() => {
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
      <div className="navbar bg-white text-black font-light">
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
                <li className="p-2.5  border-b border-hgray last:border-b-0">
                  <a href="/admin/homepage">Home</a>
                </li>
                <li className="p-2.5  border-b border-hgray last:border-b-0">
                  <a href="/admin/dashboard">Dashboard</a>
                </li>
                <li className="p-2.5 border-b border-hgray last:border-b-0">
                  <a href="/admin/surveytool">Survey Tool</a>
                </li>
                <li className="p-2.5 border-b border-hgray last:border-b-0">
                  <a href="/admin/threads">Threads</a>
                </li>
                <li className="p-2.5 border-b border-hgray last:border-b-0">
                  <details>
                    <summary>Contents</summary>
                    <ul className="p-2.5 z-50">
                      <li className="p-1">
                        <a href="/admin/companies">Companies</a>
                      </li>
                      <li className="p-1">
                        <a href="/admin/news">News</a>
                      </li>
                      <li className="p-1">
                        <a href="/admin/events">Events</a>
                      </li>
                      <li className="p-1">
                        <a href="/admin/certifications">Certifications</a>
                      </li>
                      <li className="p-1">
                        <a href="/admin/documentrequest">
                          Document Request Steps
                        </a>
                      </li>
                      <li className="p-1">
                        <a href="/admin/job">Job/Internship Referrals</a>
                      </li>
                    </ul>
                  </details>
                </li>
                <li className="p-2.5 border-b border-hgray last:border-b-0">
                  <a href="/admin/alumni">Alumni</a>
                </li>
                <li className="p-2.5 ">
                  <a href="/admin/reports">Reports</a>
                </li>
                <li className="p-2.5 ">
                  <a href="/admin/account">Account</a>
                </li>
              </ul>
            )}
          </div>
        </div>
        <div className="navbar-center hidden lg:flex py-1 ">
          <ul className="menu menu-horizontal px-1 ">
            <li className="px-2.5 pr-1 xl:pr-8">
              <a href="/admin/homepage">Home</a>
            </li>
            <li className="px-2.5 pr-1 xl:pr-8">
              <a href="/admin/dashboard">Dashboard</a>
            </li>
            <li className="px-2.5 pr-1 xl:pr-8">
              <a href="/admin/surveytool">Survey Tool</a>
            </li>
            <li className="px-2.5 pr-1 xl:pr-8">
              <a href="/admin/threads">Threads</a>
            </li>
            <li className="px-2.5 pr-1 xl:pr-8">
              <details>
                <summary>Contents</summary>
                <ul className="px-2.5 bg-white pr-1 z-20">
                  <li className="p-1 border-b border-hgray last:border-b-0">
                    <a href="/admin/companies">Companies</a>
                  </li>
                  <li className="px-1 border-b border-hgray last:border-b-0">
                    <a href="/admin/news">News</a>
                  </li>
                  <li className="px-1 border-b border-hgray last:border-b-0">
                    <a href="/admin/events">Events</a>
                  </li>
                  <li className="px-1 border-b border-hgray last:border-b-0">
                    <a href="/admin/certifications">Certifications</a>
                  </li>
                  <li className="px-1 border-b border-hgray last:border-b-0">
                    <a href="/admin/documentrequest">Document Request Steps</a>
                  </li>
                  <li className="px-1 border-b border-hgray last:border-b-0">
                    <a href="/admin/job">Job/Internship Referrals</a>
                  </li>
                </ul>
              </details>
            </li>
            <li className="px-2.5 pr-1 xl:pr-8">
              <a href="/admin/alumni">Alumni</a>
            </li>
            <li className="px-2.5 pr-1 xl:pr-8 ">
              <a href="/admin/reports">Reports</a>
            </li>
            <li className="px-2.5 pr-16 xl:pr-20 ">
              <a href="/admin/account">Account</a>
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
            ADMIN
            <MdOutlineLogout size={24} />
          </a>

          {isTooltipVisible && (
            <div className="absolute top-full mt-1 mr-3.5 md:mr-7 bg-gray-800 text-white text-xxs md:text-xs rounded py-1 px-1.5 z-10">
              Logout
            </div>
          )}

          {isModalVisible && (
            <dialog id="my_modal_5" className="modal modal-middle " open>
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

export default NavbarAdmin;
