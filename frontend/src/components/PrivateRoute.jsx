import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import ErrorPage from "../components/ErrorPage";

const ErrorFallback = () => {
  return <ErrorPage />;
};

const PrivateRoute = ({ children, requiredRole }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${backendUrl}/users/check-auth`, {
          method: "GET",
          credentials: "include", // Ensures cookies are sent with the request
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setIsAuthenticated(true);
          setUserRole(data.role); // Set user role
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return null; // You can replace this with a loading spinner or skeleton
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <ErrorFallback />;
  }

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.element.isRequired,
  requiredRole: PropTypes.string, // Optional: specify the role needed for this route
};

export default PrivateRoute;
