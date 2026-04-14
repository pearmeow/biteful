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
};