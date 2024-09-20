import React, { useEffect } from "react";
import NavbarAdmin from "../components/admin/NavbarAdmin";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../App.css";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";

const Admin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenExpiration = async () => {
      try {
        await axios.get("http://localhost:6001/users/protected", {
          withCredentials: true,
        });
      } catch (error) {
        if (
          error.response?.data?.msg === "Token has expired, please log in again"
        ) {
          console.log("Token expired. Logging out...");
          logout();
        } else {
          navigate("/login");
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("userRole");
          sessionStorage.removeItem("logoutMessageShown");
          sessionStorage.removeItem("loginMessageShown");
        }
      }
    };

    checkTokenExpiration();
    const intervalId = setInterval(checkTokenExpiration, 10000); // Check every 10 seconds

    return () => clearInterval(intervalId);
  }, [navigate]);

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
  return (
    <div>
      <Header />
      <NavbarAdmin />
      <Outlet />
      <Footer />
    </div>
  );
};

export default Admin;
