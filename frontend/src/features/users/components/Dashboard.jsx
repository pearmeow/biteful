import { useEffect, useState } from "react";
import { userService } from "../services/userService";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const nav = useNavigate();

    useEffect(() => {
        // this is wrong btw
        userService
            .getProfile()
            .then((data) => setUser(data))
            .catch((err) => {
                console.error("Failed to load profile:", err);
                // do this nav later when we are sure user isn't logged in
                // nav("/login");
            });
    }, [nav]);

    return (
        <div className="dashboard">
            <h1>Welcome back!</h1>
            {user ? (
                <div className="profile-info">
                    <p>
                        <strong>Username:</strong> {user.username}
                    </p>
                    <p>
                        <strong>Email:</strong> {user.email}
                    </p>
                </div>
            ) : (
                <p>Loading profile...</p>
            )}
        </div>
    );
};

export default Dashboard;

