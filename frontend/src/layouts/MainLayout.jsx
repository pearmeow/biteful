import { useNavigate, useLocation } from "react-router-dom";
import auth from "../features/auth/services/auth";
import Navbar from "../components/layout/Navbar";
import BrandSide from "../features/auth/components/BrandSide.jsx";
import AuthFormSide from "../features/auth/components/AuthFormSide.jsx";
import { useState, useEffect } from "react";
import "../index.css";
import "../features/auth/components/auth.css";

const MainLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation(); // to know which page we r on
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem("sessionId") !== null;
    });

    useEffect(() => {
        const session = localStorage.getItem("sessionId");
        setIsAuthenticated(session !== null);
    }, [location.pathname]);

    /* for some reason, when i tried it today it didnt work 
    and it auto defaulted to the dashboard screen and said
    i was unauthorized to logout? it was working yesterday so 
    i was a bit confused as to why but it lowk refused to work so
    that is why it kinda force logouts regardless lololol? */

    const handleLogout = async () => { 
        try {
            // Try to tell the server we are leaving
            await auth.logout();
        } catch (err) {
            // Even if the server rejects us (401), we continue anyway
            console.warn("Backend logout failed, but clearing local session.");
        }
        // ALWAYS clear this, regardless of what the backend says
        localStorage.removeItem("sessionId"); 
        setIsAuthenticated(false);
        navigate("/login");
    };

    const isAuthPage = ["/login", "/signup"].includes(location.pathname);
    return (
        <div className="layout-container">
            {!isAuthPage && (
                <Navbar
                    isAuthenticated={isAuthenticated}
                    onLogout={handleLogout}
                />
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
                    <div className="standard-view">{children}</div>
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
