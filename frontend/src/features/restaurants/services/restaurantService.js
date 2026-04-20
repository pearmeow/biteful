import { drogonClient } from "../../../api/client";

export const restaurantService = {
    getByZipcode: async (zipcode) => {
        return await drogonClient(`restaurants?zipcode=${encodeURIComponent(zipcode)}`, {
            method: "GET",
        });
    },
};