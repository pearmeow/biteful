import React, { useEffect, useState } from 'react';
import { drogonClient } from '../../../api/client';
import './Profile.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);

    const rawId = localStorage.getItem("userId");
    const userId = (rawId === null || rawId === "undefined") ? null : rawId;

    useEffect(() => {
    console.log("userId:", userId);

    if (!userId) {
        setError("No user ID found. Please log in again.");
        return;
    }

    drogonClient(`users/${userId}`, { method: "GET", credentials: "include" })
        .then(data => {
            console.log("profile data:", data);
            setUser(data);
            setLogs(data.food_logs || []);
        })
        .catch(err => {
            console.error("fetch error:", err);
            setError(err.message);
        });
}, [userId]);

    if (error) return <div className="error-msg">{error}</div>;
    if (!user) return <div>Loading Profile...</div>;

    return (
        <div className="profile-container">
            <header className="profile-header">
                <h1>{user.display_name || user.username}'s Profile</h1>
                <div className="score-badge">
                    <span>Health Score:</span>
                    <strong>{user.health_score}</strong>
                </div>
            </header>

            <section className="food-history">
                <h2>Recent Food Logs</h2>
                {logs.length === 0 ? (
                    <p>No food logged yet. Start eating healthy!</p>
                ) : (
                    <ul>
                        {logs.map((log, index) => (
                            <li key={index} className="log-item">
                                <span>{log.item_name}</span>
                                <span className="points">+{log.health_points} pts</span>
                                <small>{new Date(log.logged_at).toLocaleDateString()}</small>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default Profile;