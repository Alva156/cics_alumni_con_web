import React from "react";
import NavbarAdmin from "../components/admin/NavbarAdmin";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../App.css";
import { Outlet } from "react-router-dom";

const Admin = () => {
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
