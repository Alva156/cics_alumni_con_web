import React from "react";
import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";

const isAuthenticated = () => {
  return localStorage.getItem("isLoggedIn") === "true";
};

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

PrivateRoute.propTypes = {
  children: PropTypes.element.isRequired,
};

export default PrivateRoute;
