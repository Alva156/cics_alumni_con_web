import React from "react";
import Navbar from "../components/user/Navbar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../App.css";
import { Outlet } from "react-router-dom";

const User = () => {
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
