import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useRestaurants } from '../hooks/useRestaurants';
import { useLocationSearch } from '../../common/useLocationSearch';
import ZipSearchInput from '../../common/components/ZipSearchInput';
import { formatDistance } from '../../common/utils/locationUtils';
import { getVisibleClusterItems, sortItemsByDistance, toggleSelectedValue } from '../../common/utils/explorerUtils';
import { CUISINE_GROUP_ORDER, getCuisineGroup } from '../utils/cuisineGroups';
import '../../common/components/explorer.css';
import RestaurantMap from './RestaurantMap';
import './restaurants.css';

const DIRECT_PIN_RENDER_THRESHOLD = 1200;
const DEFERRED_CLUSTER_RENDER_THRESHOLD = 4000;
const RESTAURANT_LIST_PAGE_SIZE = 50;
const SELECTED_LOCATION_ZOOM = 17;
const RestaurantExplorer = () => {
    const { 
        restaurants = [], 
        loading = false, 
        error = null, 
        fetchAll 
    } = useRestaurants() || {};

    const [mapTarget, setMapTarget] = useState(null);
    const [nameQuery, setNameQuery] = useState('');
    const [selectedCuisines, setSelectedCuisines] = useState([]);
    const [selectedGrades, setSelectedGrades] = useState([]);
    const [userCoords, setUserCoords] = useState(null);
    const [sortByProximity, setSortByProximity] = useState(false);
    const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
    const [visibleRestaurantCount, setVisibleRestaurantCount] = useState(RESTAURANT_LIST_PAGE_SIZE);

    const locationSearch = useLocationSearch((coords) => {
        setMapTarget(coords);
        setUserCoords(coords);
    }) || {};

    const { 
        inputRef, 
        committedZip = "",
        zipError = "", 
        setZipError = () => {},
        geoLoading = false, 
        handleZipChange = () => {}, 
        handleMyLocation = () => {},
        commitZip = () => {},
        resetZip = () => {}
    } = locationSearch;

    useEffect(() => {
        if (!fetchAll) return;

        fetchAll();
    }, [fetchAll]);

    useEffect(() => {
        if (!fetchAll) return;
        if (committedZip) return;
        if (loading || error || restaurants.length > 0) return;

        fetchAll();
    }, [committedZip, error, fetchAll, loading, restaurants.length]);

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
        setVisibleRestaurantCount(RESTAURANT_LIST_PAGE_SIZE);
        toggleSelectedValue(value, setSelectedValues);
    };

    const handleSearch = () => {
        const currentZip = inputRef?.current?.value || "";
        if (currentZip.length !== 5) {
            setZipError("Enter a valid 5-digit ZIP.");
            return;
        }
        setZipError("");
        setVisibleRestaurantCount(RESTAURANT_LIST_PAGE_SIZE);
        commitZip(currentZip);

        const match = restaurants.find((restaurant) => restaurant.zipcode === currentZip);
        if (match?.latitude && match?.longitude) {
            setMapTarget({
                lat: Number(match.latitude),
                lng: Number(match.longitude),
            });
        }
    };

    const filteredRestaurants = useMemo(() => {
        const normalizedQuery = nameQuery.trim().toLowerCase();

        return restaurants.filter((restaurant) => {
            if (committedZip.length === 5 && restaurant.zipcode !== committedZip) {
                return false;
            }

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
    }, [committedZip, nameQuery, restaurants, selectedCuisines, selectedGrades]);

    const sortedRestaurants = useMemo(() => {
        const restaurantsWithDistance = sortItemsByDistance(
            filteredRestaurants,
            userCoords,
            (restaurant) => ({ lat: restaurant.latitude, lng: restaurant.longitude }),
            sortByProximity
        );

        return restaurantsWithDistance;
    }, [filteredRestaurants, sortByProximity, userCoords]);

    const selectedRestaurant = useMemo(
        () => sortedRestaurants.find((restaurant) => restaurant.id === selectedRestaurantId) || null,
        [selectedRestaurantId, sortedRestaurants]
    );

    const visibleRestaurantList = useMemo(
        () => sortedRestaurants.slice(0, visibleRestaurantCount),
        [sortedRestaurants, visibleRestaurantCount]
    );

    const hasMoreRestaurants = visibleRestaurantList.length < sortedRestaurants.length;

    const deferredFilteredRestaurants = useDeferredValue(sortedRestaurants);
    const visibleRestaurants = useMemo(
        () => getVisibleClusterItems(sortedRestaurants, deferredFilteredRestaurants, DEFERRED_CLUSTER_RENDER_THRESHOLD),
        [deferredFilteredRestaurants, sortedRestaurants]
    );
    const shouldClusterPins = visibleRestaurants.length > DIRECT_PIN_RENDER_THRESHOLD;

    const clearFilters = () => {
        resetZip();
        setNameQuery('');
        setSelectedCuisines([]);
        setSelectedGrades([]);
        setSortByProximity(false);
        setUserCoords(null);
        setSelectedRestaurantId(null);
        setVisibleRestaurantCount(RESTAURANT_LIST_PAGE_SIZE);
        setMapTarget(null);
    };

    const derivedMapTarget = useMemo(() => {
        if (mapTarget) return mapTarget;
        if (loading || sortedRestaurants.length === 0) return null;

        const first = sortedRestaurants[0];
        if (!first?.latitude || !first?.longitude) return null;

        return {
            lat: Number(first.latitude),
            lng: Number(first.longitude)
        };
    }, [loading, mapTarget, sortedRestaurants]);

    const handleSelectRestaurant = (restaurant) => {
        setSelectedRestaurantId(restaurant.id);
        setMapTarget({
            lat: Number(restaurant.latitude),
            lng: Number(restaurant.longitude),
            zoom: SELECTED_LOCATION_ZOOM,
        });
    };

    const handleSortByProximity = async () => {
        if (userCoords) {
            setVisibleRestaurantCount(RESTAURANT_LIST_PAGE_SIZE);
            setSortByProximity((current) => !current);
            return;
        }

        const coords = await handleMyLocation();
        if (coords) {
            setVisibleRestaurantCount(RESTAURANT_LIST_PAGE_SIZE);
            setSortByProximity(true);
        }
    };

    const handleNameQueryChange = (event) => {
        setVisibleRestaurantCount(RESTAURANT_LIST_PAGE_SIZE);
        setNameQuery(event.target.value);
    };

    const handleLoadMoreRestaurants = () => {
        setVisibleRestaurantCount((current) => current + RESTAURANT_LIST_PAGE_SIZE);
    };

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
                            onChange={handleNameQueryChange}
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
                            Showing {Math.min(visibleRestaurantList.length, sortedRestaurants.length)} of {sortedRestaurants.length} {sortedRestaurants.length === 1 ? 'restaurant' : 'restaurants'}
                        </span>
                        <button
                            type="button"
                            className={`proximity-sort-button ${sortByProximity ? 'is-active' : ''}`}
                            onClick={handleSortByProximity}
                            disabled={geoLoading}
                        >
                            {geoLoading && !userCoords ? 'Finding location...' : 'Sort by proximity'}
                        </button>
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

            <div className="results-list-panel">
                {visibleRestaurantList.map((restaurant) => (
                    <button
                        key={restaurant.id}
                        type="button"
                        className={`location-list-card ${selectedRestaurantId === restaurant.id ? 'is-selected' : ''}`}
                        onClick={() => handleSelectRestaurant(restaurant)}
                    >
                        <div className="location-list-heading">
                            <div className="location-list-title-group">
                                <h3 className="location-list-name">{restaurant.name}</h3>
                                {(restaurant.cuisine || restaurant.grade) && (
                                    <div className="location-list-inline-meta">
                                        {restaurant.cuisine && <span>{restaurant.cuisine}</span>}
                                        {restaurant.grade && <span>Grade {restaurant.grade}</span>}
                                    </div>
                                )}
                            </div>
                            {restaurant.distance != null && (
                                <span className="distance-badge">{formatDistance(restaurant.distance, 'miles')}</span>
                            )}
                        </div>
                        <p className="location-list-address">{restaurant.address || 'Address unavailable'}</p>
                    </button>
                ))}
                {hasMoreRestaurants && (
                    <button
                        type="button"
                        className="load-more-button"
                        onClick={handleLoadMoreRestaurants}
                    >
                        Load more restaurants
                    </button>
                )}
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
                    selectedRestaurant={selectedRestaurant}
                    shouldClusterPins={shouldClusterPins}
                    target={derivedMapTarget} 
                />
            </div>
        </div>
    );
};

export default RestaurantExplorer;
