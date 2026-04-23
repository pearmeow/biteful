import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useRestaurants } from '../hooks/useRestaurants';
import { useLocationSearch } from '../../common/useLocationSearch';
import ZipSearchInput from '../../common/components/ZipSearchInput';
import '../../common/components/explorer.css';
import RestaurantMap from './RestaurantMap';
import './restaurants.css';

const DIRECT_PIN_RENDER_THRESHOLD = 1200;
const DEFERRED_CLUSTER_RENDER_THRESHOLD = 4000;
const CUISINE_GROUP_ORDER = [
    'American',
    'Italian & Pizza',
    'Chinese',
    'Japanese & Sushi',
    'Korean',
    'Mexican',
    'Latin American',
    'Caribbean',
    'Mediterranean & Middle Eastern',
    'South Asian',
    'Southeast Asian',
    'Bakery, Coffee & Desserts',
    'Fast Food',
    'Vegetarian & Healthy',
    'Seafood',
    'Other',
];

const CUISINE_GROUP_LABEL_BY_EXACT_VALUE = {
    American: 'American',
    Hamburgers: 'American',
    Hotdogs: 'American',
    'Steaks/Chops': 'American',
    Sandwiches: 'American',
    Continental: 'American',
    'Soups/Salads/Sandwiches': 'American',
    Pizza: 'Italian & Pizza',
    Italian: 'Italian & Pizza',
    'Pizza/Italian': 'Italian & Pizza',
    Chinese: 'Chinese',
    'Chinese/Cuban': 'Chinese',
    'Chinese/Japanese': 'Chinese',
    Cafeteria: 'American',
    Japanese: 'Japanese & Sushi',
    Sushi: 'Japanese & Sushi',
    Korean: 'Korean',
    Mexican: 'Mexican',
    'Tex-Mex': 'Mexican',
    'Latin American': 'Latin American',
    Spanish: 'Latin American',
    Tapas: 'Latin American',
    Caribbean: 'Caribbean',
    Haitian: 'Caribbean',
    Mediterranean: 'Mediterranean & Middle Eastern',
    Turkish: 'Mediterranean & Middle Eastern',
    Greek: 'Mediterranean & Middle Eastern',
    'Middle Eastern': 'Mediterranean & Middle Eastern',
    Egyptian: 'Mediterranean & Middle Eastern',
    Lebanese: 'Mediterranean & Middle Eastern',
    Moroccan: 'Mediterranean & Middle Eastern',
    Indian: 'South Asian',
    Pakistani: 'South Asian',
    Bangladeshi: 'South Asian',
    Afghan: 'South Asian',
    Thai: 'Southeast Asian',
    Vietnamese: 'Southeast Asian',
    Filipino: 'Southeast Asian',
    Indonesian: 'Southeast Asian',
    Malaysian: 'Southeast Asian',
    Asian: 'Southeast Asian',
    'Asian/Asian Fusion': 'Southeast Asian',
    'Coffee/Tea': 'Bakery, Coffee & Desserts',
    Donuts: 'Bakery, Coffee & Desserts',
    'Bakery Products/Desserts': 'Bakery, Coffee & Desserts',
    Bakery: 'Bakery, Coffee & Desserts',
    'Ice Cream, Gelato, Yogurt, Ices': 'Bakery, Coffee & Desserts',
    'Juice, Smoothies, Fruit Salads': 'Bakery, Coffee & Desserts',
    'Pancakes/Waffles': 'Bakery, Coffee & Desserts',
    Chicken: 'Fast Food',
    Hamburgers: 'Fast Food',
    Hotdogs: 'Fast Food',
    Sandwiches: 'Fast Food',
    'Bagels/Pretzels': 'Bakery, Coffee & Desserts',
    Vegan: 'Vegetarian & Healthy',
    Vegetarian: 'Vegetarian & Healthy',
    Salads: 'Vegetarian & Healthy',
    Healthy: 'Vegetarian & Healthy',
    Seafood: 'Seafood',
    'Seafood/Steak': 'Seafood',
    Other: 'Other',
    '(blank)': 'Other',
    '': 'Other',
};

const getCuisineGroup = (cuisine) => {
    const value = (cuisine || '').trim();

    if (!value || value === '(blank)' || value === 'Other') {
        return 'Other';
    }

    const exactGroup = CUISINE_GROUP_LABEL_BY_EXACT_VALUE[value];
    if (exactGroup) {
        return exactGroup;
    }

    const normalizedValue = value.toLowerCase();

    if (normalizedValue.includes('pizza') || normalizedValue.includes('ital')) return 'Italian & Pizza';
    if (normalizedValue.includes('chinese')) return 'Chinese';
    if (normalizedValue.includes('japanese') || normalizedValue.includes('sushi') || normalizedValue.includes('ramen')) return 'Japanese & Sushi';
    if (normalizedValue.includes('korean')) return 'Korean';
    if (normalizedValue.includes('mexic')) return 'Mexican';
    if (normalizedValue.includes('latin') || normalizedValue.includes('spanish') || normalizedValue.includes('peruvian')) return 'Latin American';
    if (normalizedValue.includes('caribbean') || normalizedValue.includes('hait')) return 'Caribbean';
    if (normalizedValue.includes('mediterr') || normalizedValue.includes('middle eastern') || normalizedValue.includes('greek') || normalizedValue.includes('turkish')) return 'Mediterranean & Middle Eastern';
    if (normalizedValue.includes('indian') || normalizedValue.includes('pakistan') || normalizedValue.includes('bangladesh') || normalizedValue.includes('afghan') || normalizedValue.includes('nepal')) return 'South Asian';
    if (normalizedValue.includes('thai') || normalizedValue.includes('viet') || normalizedValue.includes('filip') || normalizedValue.includes('malay') || normalizedValue.includes('indones')) return 'Southeast Asian';
    if (normalizedValue.includes('coffee') || normalizedValue.includes('tea') || normalizedValue.includes('bakery') || normalizedValue.includes('dessert') || normalizedValue.includes('donut') || normalizedValue.includes('ice cream') || normalizedValue.includes('smoothie') || normalizedValue.includes('juice')) return 'Bakery, Coffee & Desserts';
    if (normalizedValue.includes('burger') || normalizedValue.includes('chicken') || normalizedValue.includes('fried') || normalizedValue.includes('fast food')) return 'Fast Food';
    if (normalizedValue.includes('vegan') || normalizedValue.includes('vegetarian') || normalizedValue.includes('salad') || normalizedValue.includes('healthy')) return 'Vegetarian & Healthy';
    if (normalizedValue.includes('seafood') || normalizedValue.includes('fish')) return 'Seafood';
    if (normalizedValue.includes('american') || normalizedValue.includes('sandwich') || normalizedValue.includes('steak') || normalizedValue.includes('continental')) return 'American';

    return 'Other';
};

const RestaurantExplorer = () => {
    const { 
        restaurants = [], 
        loading = false, 
        error = null, 
        fetchByZipcode,
        fetchAll 
    } = useRestaurants() || {};

    const [mapTarget, setMapTarget] = useState(null);
    const [nameQuery, setNameQuery] = useState('');
    const [selectedCuisines, setSelectedCuisines] = useState([]);
    const [selectedGrades, setSelectedGrades] = useState([]);

    const locationSearch = useLocationSearch((coords) => setMapTarget(coords)) || {};

    const { 
        inputRef, 
        committedZip = "",
        zipError = "", 
        setZipError = () => {},
        geoLoading = false, 
        handleZipChange = () => {}, 
        handleMyLocation = () => {},
        commitZip = () => {}
    } = locationSearch;

    useEffect(() => {
        if (!fetchAll) return;

        fetchAll();
    }, [fetchAll]);

    const cuisineOptions = useMemo(() => {
        const counts = new Map();

        for (const restaurant of restaurants) {
            const cuisineGroup = getCuisineGroup(restaurant.cuisine);
            counts.set(cuisineGroup, (counts.get(cuisineGroup) || 0) + 1);
        }

        return [...counts.entries()]
            .sort((a, b) => {
                if (a[0] === 'Other') return 1;
                if (b[0] === 'Other') return -1;
                if (b[1] !== a[1]) return b[1] - a[1];
                const aIndex = CUISINE_GROUP_ORDER.indexOf(a[0]);
                const bIndex = CUISINE_GROUP_ORDER.indexOf(b[0]);
                if (aIndex !== -1 || bIndex !== -1) {
                    return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
                }
                return a[0].localeCompare(b[0]);
            })
            .map(([cuisine]) => cuisine);
    }, [restaurants]);

    const gradeOptions = useMemo(() => {
        return [...new Set(
            restaurants.map((restaurant) => restaurant.grade).filter(Boolean)
        )].sort();
    }, [restaurants]);

    const toggleSelection = (value, setSelectedValues) => {
        setSelectedValues((current) =>
            current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value]
        );
    };

    const handleSearch = () => {
        const currentZip = inputRef?.current?.value || "";
        if (currentZip.length !== 5) {
            setZipError("Enter a valid 5-digit ZIP.");
            return;
        }
        setZipError("");
        commitZip(currentZip);
        if (fetchByZipcode) fetchByZipcode(currentZip);
    };

    const filteredRestaurants = useMemo(() => {
        const normalizedQuery = nameQuery.trim().toLowerCase();

        return restaurants.filter((restaurant) => {
            if (normalizedQuery) {
                const matchesName = restaurant.name?.toLowerCase().includes(normalizedQuery);
                const matchesAddress = restaurant.address?.toLowerCase().includes(normalizedQuery);
                if (!matchesName && !matchesAddress) return false;
            }

            if (selectedCuisines.length > 0 && !selectedCuisines.includes(getCuisineGroup(restaurant.cuisine))) {
                return false;
            }

            if (selectedGrades.length > 0 && !selectedGrades.includes(restaurant.grade)) {
                return false;
            }

            return true;
        });
    }, [nameQuery, restaurants, selectedCuisines, selectedGrades]);
    const deferredFilteredRestaurants = useDeferredValue(filteredRestaurants);
    const visibleRestaurants = useMemo(() => {
        if (filteredRestaurants.length <= DEFERRED_CLUSTER_RENDER_THRESHOLD) {
            return filteredRestaurants;
        }

        return deferredFilteredRestaurants;
    }, [deferredFilteredRestaurants, filteredRestaurants]);
    const shouldClusterPins = visibleRestaurants.length > DIRECT_PIN_RENDER_THRESHOLD;

    const clearFilters = () => {
        setNameQuery('');
        setSelectedCuisines([]);
        setSelectedGrades([]);
    };

    const derivedMapTarget = useMemo(() => {
        if (mapTarget) return mapTarget;
        if (loading || restaurants.length === 0) return null;

        const hasActiveFilters = Boolean(nameQuery.trim()) || selectedCuisines.length > 0 || selectedGrades.length > 0;
        const first = hasActiveFilters ? filteredRestaurants[0] : restaurants[0];
        if (!first?.latitude || !first?.longitude) return null;

        return {
            lat: Number(first.latitude),
            lng: Number(first.longitude)
        };
    }, [filteredRestaurants, loading, mapTarget, nameQuery, restaurants, selectedCuisines.length, selectedGrades.length]);

    return (
        <div className="restaurant-page-container">
            <div className="restaurant-search-section">
                <div className="header-flex">
                    <span className="pantry-search-title">RESTAURANT EXPLORER</span>
                </div>

                <ZipSearchInput 
                    inputRef={inputRef}
                    onChange={handleZipChange}
                    onSearch={handleSearch}
                    onGeoClick={handleMyLocation}
                    loading={geoLoading || loading}
                    error={zipError || error}
                />

                <div className="restaurant-filters-panel">
                    <div className="restaurant-filter-group">
                        <label htmlFor="restaurant-name-search" className="restaurant-filter-label">
                            Search Restaurants
                        </label>
                        <input
                            id="restaurant-name-search"
                            type="text"
                            className="restaurant-name-input"
                            value={nameQuery}
                            onChange={(event) => setNameQuery(event.target.value)}
                            placeholder="Search by restaurant name or address"
                        />
                    </div>

                    {cuisineOptions.length > 0 && (
                        <div className="restaurant-filter-group">
                            <span className="restaurant-filter-label">Cuisine</span>
                            <div className="restaurant-filter-chip-row">
                                {cuisineOptions.map((cuisine) => (
                                    <button
                                        key={cuisine}
                                        type="button"
                                        className={`restaurant-filter-chip ${selectedCuisines.includes(cuisine) ? 'is-selected' : ''}`}
                                        onClick={() => toggleSelection(cuisine, setSelectedCuisines)}
                                    >
                                        {cuisine}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {gradeOptions.length > 0 && (
                        <div className="restaurant-filter-group">
                            <span className="restaurant-filter-label">Inspection Grade</span>
                            <div className="restaurant-filter-chip-row">
                                {gradeOptions.map((grade) => (
                                    <button
                                        key={grade}
                                        type="button"
                                        className={`restaurant-filter-chip ${selectedGrades.includes(grade) ? 'is-selected' : ''}`}
                                        onClick={() => toggleSelection(grade, setSelectedGrades)}
                                    >
                                        {grade}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="restaurant-filter-footer">
                        <span className="restaurant-results-count">
                            Showing {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'restaurant' : 'restaurants'}
                        </span>
                        <button
                            type="button"
                            className="restaurant-clear-filters"
                            onClick={clearFilters}
                        >
                            Clear filters
                        </button>
                    </div>
                </div>
            </div>

            <p className="restaurant-map-hint">Double-click a pin to view restaurant details.</p>

            <div className="map-frame" style={{ position: 'relative' }}>
                {loading && (
                    <div className="map-loading-overlay">
                        <div className="spinner"></div>
                        <p>Loading {restaurants.length === 0 ? 'City Data' : 'Clusters'}...</p>
                    </div>
                )}

                <RestaurantMap 
                    restaurants={visibleRestaurants}
                    shouldClusterPins={shouldClusterPins}
                    target={derivedMapTarget} 
                />
            </div>
        </div>
    );
};

export default RestaurantExplorer;
