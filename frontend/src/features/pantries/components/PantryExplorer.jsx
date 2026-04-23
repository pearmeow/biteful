import { useDeferredValue, useState, useMemo } from 'react';
import { usePantries } from '../hooks/usePantries';
import PantryMap from './PantryMap';
import { useLocationSearch } from '../../common/useLocationSearch'
import ZipSearchInput from '../../common/components/ZipSearchInput';
import { calculateLinearDistance, formatDistance } from '../../common/utils/locationUtils';
import '../../common/components/explorer.css';
import './pantries.css';

const DIRECT_PIN_RENDER_THRESHOLD = 600;
const DEFERRED_CLUSTER_RENDER_THRESHOLD = 2000;

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

    const processedGroups = useMemo(() => {
        return (groups || []).map(group => {
            // addr1, addr2, addr3 usually form the street/city portion
            const streetAddress = [
                group.building, // addr1
                group.street,   // addr2
                group.boro      // addr3
            ].filter(Boolean).join(', ');

            const fullAddress = streetAddress 
                ? `${streetAddress} ${group.zipcode || ''}`.trim()
                : (group.zipcode || '');

            return {
                ...group,
                fullAddress, 
                zipcode: group.zipcode ? String(group.zipcode).trim() : '',
                cleanPrograms: (group.programs || []).map(p => ({
                    ...p,
                    cleanType: (p.program || '').trim(),
                    day: p.day_of_week
                }))
            };
        });
    }, [groups]);

    // filter(Boolean) removes falsy values for safety
    // useMemo to cache data
    const pantryTypes = useMemo(() => {
        return [...new Set(
            processedGroups.flatMap(group => 
                group.cleanPrograms.map(p => p.cleanType).filter(Boolean)
            )
        )].sort();
    }, [processedGroups]);

    const toggleSelection = (value, setSelectedValues) => {
        setSelectedValues((current) =>
            current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value]
        );
    };

    // groups is data loaded from backend
    // a pantry can have multiple programs, programs is an array
    const filteredGroups = useMemo(() => {
        return processedGroups.filter((group) => {
            if (committedZip.length === 5) {
                if (group.zipcode !== committedZip) return false;
            }

            if (selectedDays.length > 0) {
                const hasDay = group.cleanPrograms.some(p => 
                    selectedDays.includes(p.day)
                );
                if (!hasDay) return false;
            }

            if (selectedTypes.length > 0) {
                const hasType = group.cleanPrograms.some(p => 
                    selectedTypes.includes(p.cleanType)
                );
                if (!hasType) return false;
            }

            return true;
        });
    }, [processedGroups, committedZip, selectedDays, selectedTypes]);

    const sortedGroups = useMemo(() => {
        const groupsWithDistance = filteredGroups.map((group) => ({
            ...group,
            distance: calculateLinearDistance(
                userCoords,
                { lat: group.latitude, lng: group.longitude },
                'miles'
            ),
        }));

        if (!sortByProximity || !userCoords) {
            return groupsWithDistance;
        }

        return [...groupsWithDistance].sort((a, b) => {
            if (a.distance == null && b.distance == null) return 0;
            if (a.distance == null) return 1;
            if (b.distance == null) return -1;
            return a.distance - b.distance;
        });
    }, [filteredGroups, sortByProximity, userCoords]);

    const selectedPantry = useMemo(
        () => sortedGroups.find((group) => group.id === selectedPantryId) || null,
        [selectedPantryId, sortedGroups]
    );

    const deferredFilteredGroups = useDeferredValue(sortedGroups);
    const visibleGroups = useMemo(() => {
        if (sortedGroups.length <= DEFERRED_CLUSTER_RENDER_THRESHOLD) {
            return sortedGroups;
        }

        return deferredFilteredGroups;
    }, [deferredFilteredGroups, sortedGroups]);
    const shouldClusterPins = visibleGroups.length > DIRECT_PIN_RENDER_THRESHOLD;

    const handleSearch = () => {
        const currentZip = inputRef.current?.value || "";

        if (currentZip.length !== 5) {
            setZipError("Enter a valid 5-digit ZIP code.");
            return;
        }

        setZipError("");
        commitZip(currentZip);
        const match = processedGroups.find((group) => group.zipcode === currentZip);

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
                                    {[...new Set(group.cleanPrograms.map((program) => program.cleanType).filter(Boolean))]
                                        .slice(0, 3)
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
