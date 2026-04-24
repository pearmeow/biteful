import { useState, useEffect } from 'react';
import { pantryService } from '../services/pantryService';

const buildFullAddress = (group) => {
    const streetAddress = [group.building, group.street, group.boro].filter(Boolean).join(', ');
    return streetAddress
        ? `${streetAddress} ${group.zipcode || ''}`.trim()
        : (group.zipcode || '');
};

const normalizePrograms = (programs = []) =>
    programs.map((program) => ({
        ...program,
        cleanType: (program.program || '').trim(),
        day: program.day_of_week,
    }));

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
                            building: item.building?.trim() || "",
                            street: item.street?.trim() || "",
                            boro: item.boro?.trim() || "",
                            zipcode: item.zipcode?.trim() || "",
                            phone: item.phone?.trim() || "No phone listed",
                            latitude: lat,
                            longitude: lng,
                            programs: []
                        };
                    }
                    acc[key].programs.push(item);
                    return acc;
                }, {});

                const normalizedGroups = Object.values(grouped).map((group) => {
                    const programs = normalizePrograms(group.programs);

                    return {
                        ...group,
                        fullAddress: buildFullAddress(group),
                        programs,
                        programTypes: [...new Set(programs.map((program) => program.cleanType).filter(Boolean))],
                    };
                });

                setState({
                    groups: normalizedGroups,
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
