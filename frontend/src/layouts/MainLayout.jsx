import { useNavigate, useLocation } from "react-router-dom";
import auth from "../features/auth/services/auth";
import Navbar from "../components/layout/Navbar";
import BrandSide from "../features/auth/components/BrandSide.jsx";
import AuthFormSide from "../features/auth/components/AuthFormSide.jsx";
import React, { useState, useEffect } from "react";
import "../index.css";
import "../features/auth/components/auth.css";
import "../features/pantries/components/pantries.css";

const MainLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const session = localStorage.getItem("sessionId");
    const isAuthenticated = session !== null;
    const isAuthPage = ["/login", "/signup"].includes(location.pathname);
    const handleLogout = async () => {
        try {
            await auth.logout();
        } catch (err) {
            console.warn("Logout failed, cleaning up local storage anyway.");
        }
        localStorage.removeItem("sessionId");
        localStorage.removeItem("userId");
        navigate("/login");    };


    return (
        <div className="layout-container">
            {!isAuthPage && (
                <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
            )}
            <main className="content-area">
                {isAuthPage ? (
                    <>
                        <BrandSide />
                        <AuthFormSide pathname={location.pathname}>
                            {children}
                        </AuthFormSide>
                    </>
                ) : (
                    <div className="standard-view">
                        {children}
                    </div>
                )}
            </main>
            {!isAuthPage && (
                <footer className="footer">
                    <p>© 2026 Modular React + Drogon C++</p>
                </footer>
            )}
        </div>
    );
};

export default MainLayout;
