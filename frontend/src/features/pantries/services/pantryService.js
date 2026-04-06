import { drogonClient } from "../../../api/client";

export const pantryService = {
    getAll: async () => {
        return await drogonClient("pantries", {
            method: "GET",
        });
    },
};