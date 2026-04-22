export const drogonClient = async (endpoint, options = {}) => {
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    const config = {
        mode: "cors", // Explicitly set CORS mode
        ...options,
        headers,
    };

    try {
        const response = await fetch(
            import.meta.env.VITE_API_BASE_URL + endpoint,
            config,
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.error || `Server returned ${response.status}`,
            );
        }

        // handle json vs non json
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            return await response.text();
        }
    } catch (error) {
        console.error("Fetch Check:", error);
        throw error;
    }
};
