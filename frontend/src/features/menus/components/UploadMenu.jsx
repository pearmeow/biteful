import { useState } from "react";
import NewMenu from "./NewMenu";

const UploadMenu = ({ restaurantId }) => {
    const [items, setItems] = useState(null);
    const onSubmit = async (e) => {
        e.preventDefault(); // prevents form default submission behavior
        const menu = document.getElementById("menu");
        const file = menu.files[0];
        // 5 megabytes, but a little smaller
        if (file.size > 5 * 1000000) {
            throw new Error("File too large");
        }
        let data = new FormData();
        data.append("data", file);
        // no headers because stuff will break if we try to include
        // the multipart/form-data header
        // js/fetch api automatically includes it
        const headers = {};

        const config = {
            mode: "cors", // Explicitly set CORS mode
            headers,
            body: data,
            method: "POST",
        };
        try {
            const resp = await fetch(
                import.meta.env.VITE_API_BASE_URL + "ocr/",
                config,
            );
            if (resp.ok) {
                console.log("ok");
                data = await resp.json();
                setItems(data["menu_items"]);
            }
            if (!resp.ok) {
                const errorData = await resp.json().catch(() => ({}));
                throw new Error(
                    errorData.error || `Server returned ${resp.status}`,
                );
            }
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    if (items) {
        console.log("result is");
        console.log(items);
    } else {
        console.log("no result");
    }
    return (
        <>
            <form action="POST" onSubmit={onSubmit}>
                <div className="input-group">
                    <label htmlFor="menu">MENU FILE</label>
                    <div className="input-wrapper">
                        <span className="input-icon">☺︎</span>{" "}
                        {/*need a better icon...*/}
                        <input type="file" id="menu" required />
                    </div>
                </div>
                <button type="submit">Submit</button>
            </form>
            {/* some form that has all the stuff*/}
            {items && (
                <NewMenu
                    restaurantId={restaurantId}
                    items={items}
                    setItems={setItems}
                />
            )}
        </>
    );
};

export default UploadMenu;