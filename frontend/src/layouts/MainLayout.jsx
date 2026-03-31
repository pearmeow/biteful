import { useNavigate, useLocation } from "react-router-dom";
import auth from "../features/auth/services/auth";
import Navbar from "../components/layout/Navbar";
import { useState } from "react";
import logoImg from "../assets/biteful_logo.png";
import "../index.css";
import "../Auth.css";

const MainLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation(); // to know which page we r on
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    if (
        localStorage.getItem("sessionId") !== null &&
        isAuthenticated == false
    ) {
        setIsAuthenticated(true);
    }

    const handleLogout = async () => {
        await auth.logout();
        setIsAuthenticated(false);
        navigate("/login");
    };

    const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
    const isLogin = location.pathname === "/login";
    const headerText = isLogin ? "WELCOME BACK!" : "JOIN BITEFUL!";
    const subText = isLogin ? "Ready to continue your journey?" : "Start your adventure with us today!";
    return (
        <div className="layout-container">
            {!isAuthPage && <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />}

            <main className="content-area">
                {isAuthPage ? (
                    <>
                        <div className="brand-side">
                            <img src={logoImg} alt="Biteful Logo" className="brand-logo" />
                            <h1>Biteful</h1>
                        </div>
                        <div className="form-side">
                            <div className="auth-card">
                                <div className="form-header-section">
                                    <h2 className="auth-header">{headerText}</h2>
                                    <p className="auth-subtitle">{subText}</p>
                                </div>
                                {children}
                            </div>
                        </div>
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
