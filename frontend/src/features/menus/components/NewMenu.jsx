import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { drogonClient } from "../../../api/client";

const NewMenu = ({ restaurantId, items, setItems, restaurantState }) => {
    const [submitStatus, setSubmitStatus] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const navigate = useNavigate();

    let itemNum = 0;
    let displayedContent = [];
    for (const item of items) {
        let currInd = itemNum;
        let onChange = (event) => {
            let name = event.target.name;
            let newItems = items.map((value, index) => {
                if (index === currInd) {
                    value[name] = event.target.value;
                }
                return value;
            });
            setItems(newItems);
        };
        displayedContent.push(
            // make each of these an input with default inputs as the text
            // put that stuff in fooditem
            <div key={itemNum} className="new-menu-item-card">
                <div className="new-menu-field">
                    <label>
                        Menu Section
                        <input
                            name={"menu_section"}
                            defaultValue={item["menu_section"]}
                            onChange={onChange}
                        />
                    </label>
                </div>
                <div className="new-menu-field">
                    <label>
                        Dish Name
                        <input
                            name={"dish_name"}
                            defaultValue={item["dish_name"]}
                            onChange={onChange}
                        />
                    </label>
                </div>
                <div className="new-menu-field">
                    <label>
                        Dish Description
                        <input
                            name={"dish_desc"}
                            defaultValue={item["dish_desc"]}
                            onChange={onChange}
                        />
                    </label>
                </div>
                <div className="new-menu-field">
                    <label>
                        Price
                        <input
                            name={"price"}
                            defaultValue={item["price"]}
                            onChange={onChange}
                        />
                    </label>
                </div>
            </div>,
        );
        ++itemNum;
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus('loading');
        setSubmitError(null);

        try {
            // make a new menu
            const menuResp = await drogonClient("menu", {
                method: "POST",
                body: JSON.stringify({ restaurantId }),
                credentials: "include",
            });
            console.log("menu resp", menuResp);

            if (!menuResp?.menuId) {
                throw new Error("Server did not return a menu ID. Check the console for the full response.");
            }

            // submit new items with the new menu
            for (const item of items) {
                const foodItemResp = await drogonClient("foodItems", {
                    method: "POST",
                    body: JSON.stringify({ ...item, menu_id: menuResp.menuId }),
                });
                console.log("food resp", foodItemResp);
            }

            setSubmitStatus('success');
            // navigate to menu viewer so the new menu is visible
            setTimeout(() => {
                navigate(`/${restaurantId}/menu`, { state: restaurantState });
            }, 1000);
        } catch (err) {
            console.error("Finalize menu error:", err);
            setSubmitError(err.message || "Something went wrong.");
            setSubmitStatus('error');
        }
    };

    return (
        <div className="new-menu-section">
            <p className="menu-page-meta">Restaurant ID: {restaurantId}</p>
            {items ? (
                <p className="menu-page-meta">{items.length} items detected</p>
            ) : (
                <p className="menu-empty">No items found...</p>
            )}
            {/* form with all detected menu items for review before submitting */}
            <form onSubmit={onSubmit}>
                {displayedContent}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <button
                        type="submit"
                        className="menu-primary-btn"
                        disabled={submitStatus === 'loading'}
                    >
                        {submitStatus === 'loading' ? 'Saving...' : 'Finalize Menu'}
                    </button>
                    {submitStatus === 'success' && (
                        <p style={{ color: '#6a2cc7', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
                            ✓ Menu saved! Redirecting...
                        </p>
                    )}
                    {submitStatus === 'error' && (
                        <p style={{ color: '#de4a4a', fontSize: '0.85rem', margin: 0 }}>
                            ✕ {submitError}
                        </p>
                    )}
                </div>
            </form>
            <p className="menu-page-meta">This is a work in progress</p>
        </div>
    );
};

export default NewMenu;