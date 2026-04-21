import { useEffect, useState } from "react";
import { userService } from "../services/userService";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const nav = useNavigate();
    const userId = localStorage.getItem("userId");

    // only runs if we have a userId
    useEffect(() => {
        if (!userId) {
            nav("/login");
            return;
        }

        userService
            .getProfile(userId)
            .then((data) => setUser(data))
            .catch((err) => {
                console.error("Failed to load profile:", err);
            });
    }, [userId, nav]);

    // apparently makes sure it doesnt show that its working b4 switching out (ui flickering)
    if (!userId) {
        return null;
    }

    return (
        <div className="dashboard">
            <h1>Welcome back!</h1>
            {user ? (
                <div className="profile-info">
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                </div>
            ) : (
                <p>Loading profile...</p>
            )}
        </div>
    );
};

export default Dashboard;