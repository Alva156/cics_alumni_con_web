import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

const PrivateRoute = ({ children, requiredRole, onAuthError }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:6001/users/check-auth", {
          credentials: "include",
        });

        const data = await response.json();
        if (data.success) {
          setIsAuthenticated(true);
          const userRole = data.role;
          setHasPermission(!requiredRole || userRole === requiredRole);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [requiredRole]);

  if (isAuthenticated === null || hasPermission === null) {
    return null;
  }

  if (!isAuthenticated || !hasPermission) {
    return onAuthError();
  }

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.element.isRequired,
  requiredRole: PropTypes.string,
  onAuthError: PropTypes.func.isRequired,
};

export default PrivateRoute;
