import { useState, useEffect } from 'react';
import { pantryService } from '../services/pantryService';

export const usePantries = () => {
    const [state, setState] = useState({
        groups: [], // Initialized as empty array to prevent .map() undefined errors
        loading: true,
        error: null
    });

    useEffect(() => {
        const fetchPantries = async () => {
            try {
                const rawData = await pantryService.getAll();
                
                // Grouping Logic: Coordinates as the unique key
                const grouped = rawData.reduce((acc, item) => {
                    const lat = parseFloat(item.latitude);
                    const lng = parseFloat(item.longitude);
                    
                    if (isNaN(lat) || isNaN(lng)) return acc;

                    const key = `${lat}_${lng}`;
                    
                    if (!acc[key]) {
                        acc[key] = {
                            id: key, // Unique ID for React keys
                            agency: item.agency?.trim() || "Unknown Agency",
                            address: item.address?.trim() || "",
                            phone: item.phone?.trim() || "No phone listed",
                            latitude: lat,
                            longitude: lng,
                            programs: []
                        };
                    }
                    acc[key].programs.push(item);
                    return acc;
                }, {});

                setState({
                    groups: Object.values(grouped),
                    loading: false,
                    error: null
                });
            } catch (err) {
                console.error("Failed to load pantries:", err);
                setState({
                    groups: [],
                    loading: false,
                    error: err.message || "Failed to fetch pantry data"
                });
            }
        };

        fetchPantries();
    }, []);

    return state;
};