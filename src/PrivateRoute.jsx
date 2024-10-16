import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "./AuthContext"; // Assuming you have an AuthContext set up

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuthContext();

  console.log("PrivateRoute: currentUser =", currentUser); // Log current user state

  if (!currentUser) {
    console.log("No user found, redirecting to login"); // Log when redirecting
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
