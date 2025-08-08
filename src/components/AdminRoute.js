// AdminRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log("👀 AdminRoute Rendered");
  console.log("🔐 loading:", loading);
  console.log("🔐 user:", user);
  console.log("🔐 user?.role:", user?.role);

  if (loading) return <div>Loading...</div>;

  if (!user || user.role !== "admin") {
    console.log("⛔ Redirecting: Not an admin or user missing");
    return <Navigate to="/" replace />;
  }

  console.log("✅ Admin access granted");
  return children;
};

export default AdminRoute;
