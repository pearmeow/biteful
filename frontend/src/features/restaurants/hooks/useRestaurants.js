import { useState, useCallback } from 'react';
import { restaurantService } from '../services/restaurantService';

const transformRestaurants = (rawData) =>
    rawData
        .filter(item => {
            const lat = parseFloat(item.latitude);
            const lng = parseFloat(item.longitude);
            return !isNaN(lat) && !isNaN(lng);
        })
        .map(item => {
            const parts = [item.building, item.street, item.boro, item.zipcode ? `NY ${item.zipcode}` : null];
            const address = parts.filter(Boolean).join(', ');
            return {
                id: item.camis,
                name: item.name?.trim() || "Unknown Restaurant",
                address,
                latitude: parseFloat(item.latitude),
                longitude: parseFloat(item.longitude),
                boro: item.boro?.trim() || "",
                cuisine: item.cuisine?.trim() || "",
                phone: item.phone?.trim() || "",
                grade: item.grade?.trim() || "",
                inspection_date: item.inspection_date || null,
            };
        });

export const useRestaurants = () => {
    const [state, setState] = useState({
        restaurants: [],
        loading: false,
        error: null
    });

    const fetchByZipcode = useCallback(async (zipcode) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const rawData = await restaurantService.getByZipcode(zipcode);
            setState({ restaurants: transformRestaurants(rawData), loading: false, error: null });
        } catch (err) {
            console.error("Failed to load restaurants:", err);
            setState({
                restaurants: [],
                loading: false,
                error: err.message || "Failed to fetch restaurant data"
            });
        }
    }, []);

    return { ...state, fetchByZipcode };
};