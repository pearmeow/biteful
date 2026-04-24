import { drogonClient } from "../../../api/client";

export const restaurantService = {
    getAll: async (options = {}) => {
        return await drogonClient(`restaurants?limit=8000`, {
            method: "GET",
            ...options,
        });
    },
};
