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

    console.group(`Requesting: ${endpoint}`);
    console.log("Options:", config);
    console.groupEnd();

    try {
        // clears cookie
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
        for (const val of response.headers) {
            console.log(val);
        }
        if (contentType && contentType.includes("application/json")) {
            const resp = await response.json();
            console.log("json resp");
            console.log(resp);
            return resp;
        } else {
            const resp = await response.text();
            console.log("test resp");
            console.log(resp);
            return resp;
        }
    } catch (error) {
        console.error("Fetch Check:", error);
        throw error;
    }
};
