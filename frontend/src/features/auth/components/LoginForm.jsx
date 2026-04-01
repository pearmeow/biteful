import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";

const LoginForm = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { login, loading, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(username, password);
        if (success) {
            navigate("/dashboard"); // Redirect after successful Drogon auth
        }
    };

    return (
        <div className="auth-card">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}> {/* each input field */}
                <div className="input-group"> 
                    <label>Username</label>
                    <div className="input-wrapper">
                        <span className="input-icon">☺︎</span> {/* username input */}
                        <input
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                </div>
                
                <div className="input-group">
                    <label>Password</label>
                    <div className="input-wrapper">
                        <span className="input-icon">🔒︎</span> {/* password input */}
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>
                {error && <p className="error-text">{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? "Authenticating..." : "Login"}
                </button>
            </form>
            {/* link to go to signup */}
            <div className="auth-switch">
                <span>Don't have an account? </span>
                <Link to="/signup">Sign Up</Link>
            </div>
        </div>
    );
};

export default LoginForm;

