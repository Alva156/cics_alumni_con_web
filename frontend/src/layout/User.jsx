import React, { useEffect } from "react";
import Navbar from "../components/user/Navbar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../App.css";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";

const User = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenExpiration = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await axios.get("http://localhost:6001/users/protected", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (error) {
          if (
            error.response?.data?.msg ===
            "Token has expired, please log in again"
          ) {
            console.log("Token expired. Logging out...");
            logout(); // Call logout when token expires
          }
        }
      } else {
        navigate("/login"); // No token, redirect to login
      }
    };

    checkTokenExpiration();

    const intervalId = setInterval(checkTokenExpiration, 10000); // Check every 10 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [navigate]);

  const logout = () => {
    console.log("User has been logged out due to token expiration.");
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");

    navigate("/login");
  };
  return (
    <div>
      <Header />
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default User;
