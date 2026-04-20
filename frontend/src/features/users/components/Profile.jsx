import React, { useEffect, useState, useCallback } from 'react';
import { drogonClient } from '../../../api/client';
import './Profile.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    
    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        display_name: '',
        phone: '',
        dietary_preferences: ''
    });

    const rawId = localStorage.getItem("userId");
    const userId = (rawId === null || rawId === "undefined") ? null : rawId;

    if (!userId && !error) {
        setError("No user ID found. Please log in again.");
    }

    const fetchUserData = useCallback(() => {
        if (!userId) return;

        drogonClient(`users/${userId}`, { method: "GET", credentials: "include" })
            .then(data => {
                setUser(data);
                setFormData({
                    display_name: data.display_name || '',
                    phone: data.phone || '',
                    dietary_preferences: data.dietary_preferences || ''
                });
            })
            .catch(err => setError(err.message));
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchUserData();
        }
    }, [userId, fetchUserData]);

    const handleSave = () => {
        drogonClient(`users/${userId}`, {
            method: "PUT",
            body: JSON.stringify(formData)
        })
        .then(() => {
            setIsEditing(false);
            fetchUserData(); 
        })
        .catch(err => alert("Update failed: " + err.message));
    };

    const handleDeleteAccount = () => {
        if (window.confirm("Are you sure? This will delete all your food logs and profile data permanently.")) {
            drogonClient(`users/${userId}`, { method: "DELETE" })
                .then(() => {
                    localStorage.clear();
                    window.location.href = "/login";
                })
                .catch(err => alert("Delete failed: " + err.message));
        }
    };

    if (error) return <div className="error-msg">{error}</div>;
    if (!user) return <div className="loading">Loading Biteful Dashboard...</div>;

    const getPigeonMessage = () => {
        if (user.health_score < -20) return "pigeon: if score under -20 then pigeon is fat";
        if (user.health_score > 100) return "pigeon: your pigeon is becoming a god";
        return "pigeon: your pigeon is doing okay";
    };

    return (
        <div className="profile-container">
            <div className="profile-top-grid">
                <header className="identity-card">
                    <h1>{user.display_name?.toUpperCase() || user.username.toUpperCase()}</h1>
                    <p className="email-subtext">{user.email}</p>
                </header>
                <div className="pigeon-card">
                    <p className="pigeon-text">{getPigeonMessage()}</p>
                </div>
            </div>

            <div className="profile-main-grid">
                <div className="left-column">
                    <section className="personal-info-card">
                        <div className="card-header">
                            <h2 style={{ margin: 0, color: '#333', fontSize: '1.2rem' }}>PERSONAL INFO</h2>
                            <div className="header-actions">
                                {!isEditing ? (
                                    <button className="edit-icon" onClick={() => setIsEditing(true)}>
                                        ✎
                                    </button>
                                ) : (
                                    <div className="edit-actions">
                                        <button className="save-btn" onClick={handleSave}>Save</button>
                                        <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="info-grid">
                            <div className="info-item">
                                <label>FULL NAME</label>
                                {isEditing ? (
                                    <input 
                                        type="text"
                                        value={formData.display_name}
                                        onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                                    />
                                ) : <p>{user.display_name || "Not Set"}</p>}
                            </div>
                            
                            <div className="info-item">
                                <label>EMAIL</label>
                                <p>{user.email}</p>
                            </div>

                            <div className="info-item">
                                <label>PHONE</label>
                                {isEditing ? (
                                    <input 
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                ) : <p>{user.phone || "(---) --- ----"}</p>}
                            </div>
                        </div>

                        {isEditing && (
                            <button className="delete-account-btn" onClick={handleDeleteAccount}>
                                DELETE ACCOUNT PERMANENTLY
                            </button>
                        )}
                    </section>

                    <section className="recent-activity-card">
                        <h2>RECENT ACTIVITY</h2>
                        <div className="activity-list">
                            {(user.food_logs || []).map((log, index) => (
                                <div key={index} className="activity-row">
                                    <div className={`icon-circle ${log.health_score >= 0 ? 'pos' : 'neg'}`}>
                                        {log.health_score >= 0 ? '✓' : '!'}
                                    </div>
                                    <div style={{flex: 1}}>
                                        <p style={{margin: 0}}><strong>{log.item_name}</strong></p>
                                        <small style={{color: '#888'}}>{new Date(log.logged_at).toLocaleDateString()}</small>
                                    </div>
                                    <div className={`activity-points ${log.health_score >= 0 ? 'text-green' : 'text-red'}`}>
                                        {log.health_score >= 0 ? `+${log.health_score}` : log.health_score}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="right-column">
                    <section className="stats-card">
                        <h2>POINTS & STATS</h2>
                        <div className="total-points-box">
                            <span className="big-number">{user.health_score || 0}</span>
                            <p>Total Points</p>
                        </div>
                        <div className="stat-row healthy">
                            <span className="stat-label">healthy</span>
                            <span className="stat-value">{user.stats?.healthy || 0}</span>
                        </div>
                        <div className="stat-row unhealthy">
                            <span className="stat-label">unhealthy</span>
                            <span className="stat-value">{user.stats?.unhealthy || 0}</span>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Profile;