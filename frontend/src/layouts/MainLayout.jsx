import { useNavigate } from "react-router-dom";
import auth from "../features/auth/services/auth";
import Navbar from "../components/layout/Navbar";
import { useState } from "react";

const MainLayout = ({ children }) => {
    const navigate = useNavigate();
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

    return (
        <div className="layout-container">
            <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />

            <main className="content-area">{children}</main>

            <footer className="footer">
                <p>© 2026 Modular React + Drogon C++</p>
            </footer>
        </div>
    );
};

export default MainLayout;
