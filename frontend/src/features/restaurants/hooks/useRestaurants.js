import { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import { restaurantService } from '../services/restaurantService';

const TRANSFORM_CHUNK_SIZE = 500;
const yieldToBrowser = () => new Promise(resolve => window.setTimeout(resolve, 0));

const transformRestaurants = async (rawData, shouldCancel = () => false) => {
    const restaurants = [];

    for (let index = 0; index < rawData.length; index += 1) {
        if (shouldCancel()) {
            throw new DOMException("Request cancelled", "AbortError");
        }

        const item = rawData[index];
        const lat = parseFloat(item.latitude);
        const lng = parseFloat(item.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
            const parts = [item.building, item.street, item.boro, item.zipcode ? `NY ${item.zipcode}` : null];
            const address = parts.filter(Boolean).join(', ');

            restaurants.push({
                id: item.camis,
                name: item.name?.trim() || "Unknown Restaurant",
                address,
                latitude: lat,
                longitude: lng,
                zipcode: item.zipcode?.trim() || "",
                boro: item.boro?.trim() || "",
                cuisine: item.cuisine?.trim() || "",
                phone: item.phone?.trim() || "",
                grade: item.grade?.trim() || "",
                inspection_date: item.inspection_date || null,
            });
        }

        if ((index + 1) % TRANSFORM_CHUNK_SIZE === 0) {
            await yieldToBrowser();
        }
    }

    return restaurants;
};

let allRestaurantsCache = null;
let allRestaurantsRawCache = null;
let allRestaurantsPromise = null;
const restaurantsByZipcodeCache = new Map();

const cacheRestaurants = (restaurants) => {
    allRestaurantsCache = restaurants;
    restaurantsByZipcodeCache.clear();

    for (const restaurant of restaurants) {
        const zipcode = restaurant.zipcode;
        if (!zipcode) continue;

        const cachedList = restaurantsByZipcodeCache.get(zipcode);
        if (cachedList) {
            cachedList.push(restaurant);
        } else {
            restaurantsByZipcodeCache.set(zipcode, [restaurant]);
        }
    }

    return restaurants;
};

const getAllRestaurantsRaw = async () => {
    if (allRestaurantsRawCache) return allRestaurantsRawCache;

    if (!allRestaurantsPromise) {
        allRestaurantsPromise = restaurantService
            .getAll()
            .finally(() => {
                allRestaurantsPromise = null;
            });
    }

    return allRestaurantsPromise;
};

export const useRestaurants = () => {
    const abortControllerRef = useRef(null);
    const isMountedRef = useRef(true);
    const [state, setState] = useState({
        restaurants: [],
        loading: false,
        error: null
    });

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            abortControllerRef.current?.abort();
        };
    }, []);

    const fetchAll = useCallback(async () => {
        if (allRestaurantsCache) {
            startTransition(() => {
                setState({
                    restaurants: allRestaurantsCache,
                    loading: false,
                    error: null
                });
            });
            return;
        }

        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const rawData = await getAllRestaurantsRaw();
            if (!isMountedRef.current) return;

            const restaurants = allRestaurantsCache || await transformRestaurants(rawData, () => !isMountedRef.current);
            if (!isMountedRef.current) return;

            allRestaurantsRawCache = rawData;
            cacheRestaurants(restaurants);

            startTransition(() => {
                setState({
                    restaurants,
                    loading: false,
                    error: null
                });
            });
        } catch (err) {
            if (err?.name === "AbortError") {
                if (isMountedRef.current) {
                    setState(prev => ({ ...prev, loading: false }));
                }
                return;
            }
            console.error("Failed to load all restaurants:", err);
            setState(prev => ({
                ...prev,
                loading: false,
                error: "Failed to load the full restaurant map."
            }));
        }
    }, []);

    return { ...state, fetchAll };
};
