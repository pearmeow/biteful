import { useParams, useLocation, Link } from "react-router-dom";
import { drogonClient } from "../../../api/client.js";
import { useState, useEffect, useCallback } from "react";

const MenuViewer = () => {
    const { camis } = useParams();
    const { state } = useLocation();
    const { name, address, phone } = state || {};
    const [menus, setMenus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const upvote = async (menuId) => {
        await drogonClient("menu/" + menuId, {
            method: "PUT",
            body: JSON.stringify({
                up: true,
            }),
        });
        fetchMenus();
    };

    const downvote = async (menuId) => {
        await drogonClient("menu/" + menuId, {
            method: "PUT",
        });
        fetchMenus();
    };

    const fetchMenus = useCallback(async () => {
        setIsLoading(true);
        // fetch all food items for this restaurant
        const restaurantMenus = await drogonClient("foodItems/" + camis);
        console.log("getMenusResp");
        console.log(restaurantMenus);

        if (restaurantMenus == null) {
            setMenus([]);
            setIsLoading(false);
            return;
        }

        const newMenus = [];
        let menuId = 0;
        let currMenuRating = 0;
        for (const menu of restaurantMenus) {
            const currMenu = [];
            let currInd = 0;
            for (const item of menu) {
                currMenuRating = item.rating;
                menuId = item.menu_id;
                currMenu.push(
                    <div key={currInd} className="menu-item-card">
                        <p className="menu-item-name">{item.dish_name}</p>
                        <p className="menu-item-desc">
                            {item.dish_desc !== "NULL" || "N/A"}
                        </p>
                        <div className="menu-item-footer">
                            <span className="menu-item-price">
                                ${Number.parseFloat(item.price).toFixed(2)}
                            </span>
                            <span className="menu-item-hp">
                                {item.health_points} HP
                            </span>
                        </div>
                    </div>,
                );
                ++currInd;
            }
            const currMenuId = menuId;
            newMenus.push(
                <div key={menuId} className="menu-card">
                    <div className="menu-card-header">
                        <span className="menu-card-rating">
                            Rating: {currMenuRating}
                        </span>
                        <div className="menu-vote-row">
                            <button
                                className="menu-vote-btn"
                                onClick={() => upvote(currMenuId)}
                            >
                                ▲ Upvote
                            </button>
                            <button
                                className="menu-vote-btn"
                                onClick={() => downvote(currMenuId)}
                            >
                                ▼ Downvote
                            </button>
                        </div>
                    </div>
                    <div className="menu-items-grid">
                        {currMenu}
                    </div>
                </div>,
            );
        }
        setMenus(newMenus);
        setIsLoading(false);
    }, [camis]);

    // fetch on mount and whenever camis changes
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
                <div style={{ display: 'flex', gap: '16px' }}>
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
                ) : menus?.length === 0 ? (
                    <p className="menu-empty">No menus uploaded yet.</p>
                ) : (
                    <div>{menus}</div>
                )}
            </div>
        </div>
    );
};

export default MenuViewer;