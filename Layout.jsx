import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./layout.css";

const Layout = () => {
  const location = useLocation();
  
  // Hide sidebar on /chat route
  const showSidebar = location.pathname !== "/chat";
  
  return (
    <>
      {showSidebar && <Sidebar />}
      <div className={showSidebar ? "main-content" : "main-content-full"}>
        <Outlet />
      </div>
    </>
  );
};

export default Layout;