import { useParams, useLocation, Link } from "react-router-dom";
import { drogonClient } from "../../../api/client.js";
import { useState, useEffect, useCallback } from "react";
import { userService } from "../../users/services/userService.js";
import "./menu.css";

const MenuViewer = () => {
    const { camis } = useParams();
    const { state } = useLocation();
    const { name, address, phone } = state || {};
    const [menus, setMenus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loggedItems, setLoggedItems] = useState(new Set());
    const userId = localStorage.getItem("userId");

    const upvote = async (menuId) => {
        await drogonClient("menu/" + menuId, {
            method: "PUT",
            body: JSON.stringify({ 
                up: true 
            }),
        });
        fetchMenus();
    };

    const downvote = async (menuId) => {
        await drogonClient("menu/" + menuId, { 
            method: "PUT" 
        });
        fetchMenus();
    };

    const handleLog = async (foodItemId) => {
        if (!userId) return;
        try {
            await userService.logFood(userId, foodItemId);
            setLoggedItems((prev) => new Set(prev).add(foodItemId));
            setTimeout(() => {
                setLoggedItems((prev) => {
                    const next = new Set(prev);
                    next.delete(foodItemId);
                    return next;
                });
            }, 2000);
        } catch (err) {
            console.error("Failed to log food:", err);
        }
    };

    const fetchMenus = useCallback(async () => {
        setIsLoading(true);
        const restaurantMenus = await drogonClient("foodItems/" + camis);
        setMenus(restaurantMenus ?? []);
        setIsLoading(false);
    }, [camis]);

    useEffect(() => {
        fetchMenus();
    }, [fetchMenus]);

    return (
        <div className="menu-page-container">
            <div className="menu-page-header">
                <span className="menu-page-label">Restaurant Menu</span>
                <h2 className="menu-page-title">{name || "Restaurant Menu"}</h2>
                {address && <p className="menu-page-meta">{address}</p>}
                {phone && <p className="menu-page-meta">{phone}</p>}
                <div style={{ display: "flex", gap: "16px" }}>
                    <Link to={`/${camis}/menu/upload`} state={state} className="menu-page-link">
                        Upload Menu →
                    </Link>
                    <Link to="/map/restaurant" className="menu-page-link">
                        ← Back to Restaurant Map
                    </Link>
                </div>
            </div>
            <div>
                {isLoading ? (
                    <p className="menu-loading">Loading...</p>
                ) : !menus?.length ? (
                    <p className="menu-empty">No menus uploaded yet.</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {menus.map((menu, menuIndex) => {
                            const menuId = menu[0]?.menu_id;
                            const rating = menu[0]?.rating;
                            return (
                                <div key={menuId ?? menuIndex} className="menu-card">
                                    <div className="menu-card-header">
                                        <span className="menu-card-rating">Rating: {rating}</span>
                                        <div className="menu-vote-row">
                                            <button className="menu-vote-btn" onClick={() => upvote(menuId)}>
                                                ▲ Upvote
                                            </button>
                                            <button className="menu-vote-btn" onClick={() => downvote(menuId)}>
                                                ▼ Downvote
                                            </button>
                                        </div>
                                    </div>
                                    <div className="menu-items-grid">
                                        {menu.map((item) => {
                                            const itemId = parseInt(item.id, 10);
                                            const hp = parseInt(item.health_points, 10);
                                            const isLogged = loggedItems.has(itemId);
                                            return (
                                                <div key={item.id} className="menu-item-card">
                                                    <p className="menu-item-name">{item.dish_name}</p>
                                                    <p className="menu-item-desc">
                                                        {item.dish_desc !== "NULL" ? item.dish_desc : ""}
                                                    </p>
                                                    <div className="menu-item-footer">
                                                        <span className="menu-item-price">
                                                            ${Number.parseFloat(item.price).toFixed(2)}
                                                        </span>
                                                        <span className={`menu-item-hp ${hp >= 0 ? "menu-item-hp-pos" : ""}`}>
                                                            {hp >= 0 ? `+${hp}` : hp} HP
                                                        </span>
                                                        {userId && (
                                                            <button
                                                                className={`menu-log-btn ${isLogged ? "menu-log-btn-done" : ""}`}
                                                                onClick={() => handleLog(itemId)}
                                                                disabled={isLogged}
                                                            >
                                                                {isLogged ? "Logged ✓" : "+ Log"}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuViewer;
