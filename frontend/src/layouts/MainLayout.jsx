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

    const isAuthPage =
        location.pathname === "/login" || location.pathname === "/signup";
    const isLogin = location.pathname === "/login";
    const headerText = isLogin ? "WELCOME BACK!" : "JOIN BITEFUL!";
    const subText = isLogin
        ? "Ready to continue your journey?"
        : "Start your adventure with us today!";
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
                        <div className="brand-side">
                            <img
                                src={logoImg}
                                alt="Biteful Logo"
                                className="brand-logo"
                            />
                            <h1>Biteful</h1>
                            {/* i cant think of a slogan */}
                            <div className="slogan-badge">
                                FIND FOOD AND BE HAPPY!
                            </div>
                            {/* Feature Boxes */}
                            <div className="features-container">
                                <div className="feature-box">
                                <div className="feature-icon">⚲</div>
                                <div className="feature-text">
                                    <strong>Find Food Spots</strong>
                                    <p>Discover local food pantries and restaurants</p>
                                </div>
                                </div>

                                <div className="feature-box">
                                <div className="feature-icon">𐂐𓇋</div>
                                <div className="feature-text">
                                    <strong>Be Healthy</strong>
                                    <p>Get warned if a restaurant tends to be unhealthy</p>
                                </div>
                                </div>

                                <div className="feature-box">
                                <div className="feature-icon">🕊</div>
                                <div className="feature-text">
                                    <strong>Grow and Learn</strong>
                                    <p>Your pigeon friend changes alongside your decisions</p>
                                </div>
                                </div>
                            </div>
                        </div>
                        <div className="form-side">
                            <div className="auth-card">
                                <div className="form-header-section">
                                    <h2 className="auth-header">
                                        {headerText}
                                    </h2>
                                    <p className="auth-subtitle">{subText}</p>
                                </div>
                                {children}
                            </div>
                        </div>
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
