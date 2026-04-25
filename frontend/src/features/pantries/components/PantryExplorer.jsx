import { useDeferredValue, useState, useMemo } from 'react';
import { usePantries } from '../hooks/usePantries';
import PantryMap from './PantryMap';
import { useLocationSearch } from '../../common/useLocationSearch'
import ZipSearchInput from '../../common/components/ZipSearchInput';
import { formatDistance } from '../../common/utils/locationUtils';
import { getVisibleClusterItems, sortItemsByDistance, toggleSelectedValue } from '../../common/utils/explorerUtils';
import '../../common/components/explorer.css';
import './pantries.css';

const DIRECT_PIN_RENDER_THRESHOLD = 600;
const DEFERRED_CLUSTER_RENDER_THRESHOLD = 2000;
const SELECTED_LOCATION_ZOOM = 17;

const DAYS_OF_WEEK = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
];

const PantryExplorer = () => {
    const { groups, loading, error } = usePantries();
    const [mapTarget, setMapTarget] = useState(null);
    const [selectedDays, setSelectedDays] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [userCoords, setUserCoords] = useState(null);
    const [sortByProximity, setSortByProximity] = useState(false);
    const [selectedPantryId, setSelectedPantryId] = useState(null);

    const { 
        inputRef, 
        committedZip,
        zipError, 
        setZipError,
        geoLoading, 
        handleZipChange, 
        handleMyLocation, 
        resetZip,
        commitZip

    } = useLocationSearch((coords) => {
        setMapTarget(coords);
        setUserCoords(coords);
    });

    const pantryTypes = useMemo(() => {
        return [...new Set(
            groups.flatMap((group) =>
                group.programTypes || []
            )
        )].sort();
    }, [groups]);

    const toggleSelection = (value, setSelectedValues) => {
        toggleSelectedValue(value, setSelectedValues);
    };

    const filteredGroups = useMemo(() => {
        return groups.filter((group) => {
            if (committedZip.length === 5) {
                if (group.zipcode !== committedZip) return false;
            }

            if (selectedDays.length > 0) {
                const hasDay = group.programs.some((program) =>
                    selectedDays.includes(program.day)
                );
                if (!hasDay) return false;
            }

            if (selectedTypes.length > 0) {
                const hasType = group.programs.some((program) =>
                    selectedTypes.includes(program.cleanType)
                );
                if (!hasType) return false;
            }

            return true;
        });
    }, [committedZip, groups, selectedDays, selectedTypes]);

    const sortedGroups = useMemo(() => {
        const groupsWithDistance = sortItemsByDistance(
            filteredGroups,
            userCoords,
            (group) => ({ lat: group.latitude, lng: group.longitude }),
            sortByProximity
        );

        return groupsWithDistance;
    }, [filteredGroups, sortByProximity, userCoords]);

    const selectedPantry = useMemo(
        () => sortedGroups.find((group) => group.id === selectedPantryId) || null,
        [selectedPantryId, sortedGroups]
    );

    const deferredFilteredGroups = useDeferredValue(sortedGroups);
    const visibleGroups = useMemo(
        () => getVisibleClusterItems(sortedGroups, deferredFilteredGroups, DEFERRED_CLUSTER_RENDER_THRESHOLD),
        [deferredFilteredGroups, sortedGroups]
    );
    const shouldClusterPins = visibleGroups.length > DIRECT_PIN_RENDER_THRESHOLD;

    const handleSearch = () => {
        const currentZip = inputRef.current?.value || "";

        if (currentZip.length !== 5) {
            setZipError("Enter a valid 5-digit ZIP code.");
            return;
        }

        setZipError("");
        commitZip(currentZip);
        const match = groups.find((group) => group.zipcode === currentZip);

        if (match) {
            setMapTarget({ lat: match.latitude, lng: match.longitude });
        } else {
            alert("No pantries found for this ZIP code.");
        }
    };

    const clearFilters = () => {
        resetZip();
        setSelectedDays([]);
        setSelectedTypes([]);
        setSortByProximity(false);
        setUserCoords(null);
        setSelectedPantryId(null);
        setMapTarget(null);
    };

    const handleSelectPantry = (group) => {
        setSelectedPantryId(group.id);
        setMapTarget({
            lat: Number(group.latitude),
            lng: Number(group.longitude),
            zoom: SELECTED_LOCATION_ZOOM,
        });
    };

    const handleSortByProximity = async () => {
        if (userCoords) {
            setSortByProximity((current) => !current);
            return;
        }

        const coords = await handleMyLocation();
        if (coords) {
            setSortByProximity(true);
        }
    };

    // If loading, show a message instead of the map
    if (loading) return <div className="loading">Loading pantry data...</div>;
    // If error, show the error
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="pantry-page-container">
            <div>
                <span className="pantry-search-title">FIND LOCAL FOOD PANTRIES</span>

            <ZipSearchInput 
                    inputRef={inputRef}
                    onChange={handleZipChange}
                    onSearch={handleSearch}
                    onGeoClick={handleMyLocation}
                    loading={geoLoading}
                    error={zipError}
                />

                <div className="pantry-filters-panel">
                    {/* ── ROW: Open Days + Pantry Types side by side ── */}
                    <div className="filter-groups-row">
                        <div className="pantry-filter-group">
                            <span className="pantry-filter-label">Open Days</span>
                            <div className="pantry-filter-chip-row pantry-filter-chip-row-days">
                                {DAYS_OF_WEEK.map((day) => (
                                    <button
                                        key={day}
                                        type="button"
                                        className={`pantry-filter-chip ${selectedDays.includes(day) ? 'is-selected' : ''}`}
                                        onClick={() => toggleSelection(day, setSelectedDays)}
                                    >
                                        {day.slice(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pantry-filter-group">
                            <span className="pantry-filter-label">Pantry Types</span>
                            <div className="pantry-filter-chip-row">
                                {pantryTypes.map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        className={`pantry-filter-chip ${selectedTypes.includes(type) ? 'is-selected' : ''}`}
                                        onClick={() => toggleSelection(type, setSelectedTypes)}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pantry-filter-footer">
                        <span className="pantry-results-count">
                            Showing {sortedGroups.length} {sortedGroups.length === 1 ? 'pantry' : 'pantries'}
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
                            className="pantry-clear-filters"
                            onClick={clearFilters}
                        >
                            Clear filters
                        </button>
                    </div>
                </div>
            </div>

            <div className="results-list-panel">
                {sortedGroups.map((group) => (
                    <button
                        key={group.id}
                        type="button"
                        className={`location-list-card ${selectedPantryId === group.id ? 'is-selected' : ''}`}
                        onClick={() => handleSelectPantry(group)}
                    >
                        <div className="location-list-heading">
                            <div className="location-list-title-group">
                                <h3 className="location-list-name">{group.agency}</h3>
                                <div className="location-list-inline-meta">
                                    {(group.programTypes || []).slice(0, 3)
                                        .map((type) => (
                                            <span key={type}>{type}</span>
                                        ))}
                                </div>
                            </div>
                            {group.distance != null && (
                                <span className="distance-badge">{formatDistance(group.distance, 'miles')}</span>
                            )}
                        </div>
                        <p className="location-list-address">{group.fullAddress || 'Address unavailable'}</p>
                    </button>
                ))}
            </div>

            <div className="map-frame">
                {!loading && (
                    <PantryMap
                        pantries={visibleGroups}
                        selectedPantry={selectedPantry}
                        shouldClusterPins={shouldClusterPins}
                        target={mapTarget}
                    />
                )}
            </div>
        </div>
    );
};

export default PantryExplorer;
