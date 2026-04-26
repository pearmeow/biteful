import { useState } from "react";
import NewMenu from "./NewMenu";

const UploadMenu = ({ restaurantId, restaurantState }) => {
    const [items, setItems] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState(null); // shown immediately on file pick
    const [uploadedFileName, setUploadedFileName] = useState(null); // shown after successful OCR
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFileName(file.name);
            setUploadedFileName(null);
            setUploadError(null);
            setItems(null);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault(); // prevents form default submission behavior
        const menu = document.getElementById("menu");
        const file = menu.files[0];

        // 5 megabytes, but a little smaller
        if (file.size > 5 * 1000000) {
            setUploadError("File too large (max 5MB).");
            return;
        }

        setUploading(true);
        setUploadError(null);

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
                setUploadedFileName(file.name);
            }
            if (!resp.ok) {
                const errorData = await resp.json().catch(() => ({}));
                throw new Error(
                    errorData.error || `Server returned ${resp.status}`,
                );
            }
        } catch (err) {
            console.log(err);
            setUploadError(err.message || "Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            {/* file upload form — triggers OCR on submit */}
            <form onSubmit={onSubmit} className="menu-upload-section">
                <label className="menu-page-label">Menu File</label>
                <label className="menu-upload-dropzone" htmlFor="menu">
                    <span className="menu-upload-icon">📄</span>
                    {selectedFileName ? (
                        <>
                            <p className="menu-upload-filename">
                                {uploadedFileName ? '✓' : '📎'} {selectedFileName}
                            </p>
                            <p className="menu-upload-hint">Click to choose a different file</p>
                        </>
                    ) : (
                        <p className="menu-upload-hint">
                            Click to select a menu image or PDF (max 5MB)
                        </p>
                    )}
                    {/* need a better icon... */}
                    <input
                        type="file"
                        id="menu"
                        required
                        onChange={onFileChange}
                    />
                </label>
                {uploadError && (
                    <p style={{ color: '#de4a4a', fontSize: '0.85rem', margin: 0 }}>
                        ✕ {uploadError}
                    </p>
                )}
                {uploadedFileName && !uploading && (
                    <p style={{ color: '#6a2cc7', fontSize: '0.85rem', margin: 0, fontWeight: 600 }}>
                        ✓ "{uploadedFileName}" scanned successfully — review items below.
                    </p>
                )}
                <button type="submit" className="menu-primary-btn" disabled={uploading}>
                    {uploading ? 'Scanning...' : 'Submit'}
                </button>
            </form>
            {/* some form that has all the stuff */}
            {items && (
                <NewMenu
                    restaurantId={restaurantId}
                    items={items}
                    setItems={setItems}
                    restaurantState={restaurantState}
                />
            )}
        </>
    );
};

export default UploadMenu;