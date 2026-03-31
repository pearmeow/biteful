import { useNavigate, useLocation } from "react-router-dom";
import auth from "../features/auth/services/auth";
import Navbar from "../components/layout/Navbar";
import { useState } from "react";

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
    return (
        <div className="layout-container">
            {!isAuthPage && <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />}

            <main className="content-area">
                {isAuthPage ? (
                    <>
                        <div className="brand-side">
                            <div className="brand-icon">🍴</div> 
                            <h1>Biteful</h1>
                        </div>
                        <div className="form-side">
                            {children}
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
