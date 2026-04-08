import { Link, useLocation } from "react-router-dom";
import logoImg from "../../assets/biteful_logo.png"; 
import "./Navbar.css"; 

const Navbar = ({ isAuthenticated, onLogout }) => {
    const location = useLocation();

    return (
        <nav className="navbar">
            {/* left: logo + name */}
            <div className="nav-group left">
                <div className="logo-container">
                    <img src={logoImg} alt="Biteful Logo" className="navbar-logo-img" />
                </div>
                <Link to="/" className="brand-name">BITEFUL</Link>
            </div>

            {/* middle: tabs */}
            <div className="nav-group center">
                {isAuthenticated && (
                    <>
                        <Link 
                            to="/dashboard" 
                            className={`nav-link ${location.pathname === '/dashboard' ? 'active-red' : ''}`}
                        >
                            DASHBOARD
                        </Link>
                        <Link 
                            to="/map/pantry" 
                            className={`nav-link ${location.pathname === '/map/pantry' ? 'active-red' : ''}`}
                        >
                            PANTRY
                        </Link>
                    </>
                )}
            </div>

            {/* right: logout */}
            <div className="nav-group right">
                {isAuthenticated ? (
                    <button onClick={onLogout} className="logout-btn">LOGOUT</button>
                ) : (
                    <Link to="/login" className="nav-link">Login</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;