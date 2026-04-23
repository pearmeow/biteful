import { useParams, useLocation, Link } from "react-router-dom";
import { drogonClient } from "../../../api/client.js";
import { useState } from "react";

const MenuViewer = () => {
    const { camis } = useParams();
    const { state } = useLocation();
    const { name, address, phone } = state || {};
    const [menus, setMenus] = useState(null);
    let isLoading = false;

    const upvote = async (menuId) => {
        await drogonClient("menu/" + menuId, {
            method: "PUT",
            body: JSON.stringify({
                up: true,
            }),
        });
        getMenus();
    };

    const downvote = async (menuId) => {
        await drogonClient("menu/" + menuId, {
            method: "PUT",
        });
        getMenus();
    };

    const getMenus = async () => {
        // submit new items with the new menu
        const restaurantMenus = await drogonClient("foodItems/" + camis);
        console.log("getMenusResp");
        console.log(restaurantMenus);
        if (restaurantMenus == null) {
            setMenus([]);
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
                    <div key={currInd} className="menuItem">
                        <p>Dish Name: {item.dish_name}</p>
                        <p>
                            Dish Description:{" "}
                            {item.dish_desc !== "NULL" || "N/A"}
                        </p>
                        <p>Price: {Number.parseFloat(item.price).toFixed(2)}</p>
                        <p>Health Points: {item.health_points}</p>
                    </div>,
                );
                ++currInd;
            }
            const currMenuId = menuId;
            newMenus.push(
                <div key={menuId} className="menu">
                    <p>Menu Rating: {currMenuRating}</p>
                    <button onClick={() => upvote(currMenuId)}>
                        Upvote Menu
                    </button>
                    <p>
                        <button onClick={() => downvote(currMenuId)}>
                            Downvote Menu
                        </button>
                    </p>
                    {currMenu}
                </div>,
            );
        }
        setMenus(newMenus);
    };

    if (menus === null) {
        getMenus();
        isLoading = true;
    }

    return (
        <div>
            <div>
                <h2>{name || "Restaurant Menu"}</h2>
                {address && <p>{address}</p>}
                {phone && <p>{phone}</p>}
                <Link to={`/${camis}/menu/upload`} state={state}>
                    Upload Menu
                </Link>
            </div>
            <div>{isLoading ? <p>Loading...</p> : <div>{menus}</div>}</div>
        </div>
    );
};

export default MenuViewer;
