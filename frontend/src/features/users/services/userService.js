import { drogonClient } from "../../../api/client";

export const userService = {
    signup: async (username, email, password) => {
        return await drogonClient("users", {
            method: "POST",
            body: JSON.stringify({ username, email, password }),
        });
    },

    getProfile: async (userId) => {
        return await drogonClient(`users/${userId}`, {
            method: "GET",
            credentials: "include",
        });
    },

    updateProfile: async (userId, updates) => {
        return await drogonClient(`users/${userId}`, {
            method: "PUT",
            body: JSON.stringify(updates),
        });
    },

    deleteProfile: async (userId) => {
        return await drogonClient(`users/${userId}`, {
            method: "DELETE",
        });
    },

    logFood: async (userId, foodItemId) => {
        const result = await drogonClient(`users/${userId}/logs`, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({ food_item_id: foodItemId }),
        });

        window.dispatchEvent(
            new CustomEvent("biteful:food-log-saved", {
                detail: { userId, foodItemId },
            }),
        );

        return result;
    },
};
