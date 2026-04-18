import { useState } from 'react';
import { usePantries } from '../hooks/usePantries';
import PantryMap from './PantryMap';
import './pantries.css';

const DAYS_OF_WEEK = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
];

const ZIP_CODE_PATTERN = /^\d{5}$/;

const extractZipCode = (address = '') => {
    const zipMatch = address.match(/\b\d{5}(?:-\d{4})?\b/);
    return zipMatch ? zipMatch[0].slice(0, 5) : '';
};

const PantryExplorer = () => {
    const { groups, loading, error } = usePantries();
    const [searchZip, setSearchZip] = useState("");
    const [mapTarget, setMapTarget] = useState(null);
    const [geoLoading, setGeoLoading] = useState(false);
    const [selectedDays, setSelectedDays] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [zipError, setZipError] = useState('');

    // If loading, show a message instead of the map
    if (loading) return <div className="loading">Loading pantry data...</div>;
    // If error, show the error
    if (error) return <div className="error">Error: {error}</div>;

    const pantryTypes = Array.from(
        new Set(
            groups.flatMap((group) =>
                group.programs
                    .map((program) => program.program?.trim())
                    .filter(Boolean)
            )
        )
    ).sort((a, b) => a.localeCompare(b));

    const toggleSelection = (value, setSelectedValues) => {
        setSelectedValues((current) =>
            current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value]
        );
    };

    const filteredGroups = groups.filter((group) => {
        const extractedZip = extractZipCode(group.address);
        const matchesZip = ZIP_CODE_PATTERN.test(searchZip)
            ? extractedZip === searchZip
            : true;

        const matchesDays = selectedDays.length
            ? group.programs.some((program) => selectedDays.includes(program.day_of_week))
            : true;

        const matchesTypes = selectedTypes.length
            ? group.programs.some((program) => selectedTypes.includes(program.program?.trim()))
            : true;

        return matchesZip && matchesDays && matchesTypes;
    });

    const handleSearch = () => {
        if (!searchZip) return;
        if (!ZIP_CODE_PATTERN.test(searchZip)) {
            setZipError('Enter a valid 5-digit ZIP code.');
            return;
        }

        setZipError('');

        const match = filteredGroups.find((group) => extractZipCode(group.address) === searchZip);
        if (match) {
            setMapTarget({ lat: match.latitude, lng: match.longitude });
        } else {
            alert("No pantries found for the current filters.");
        }
    };

    const clearFilters = () => {
        setSearchZip("");
        setSelectedDays([]);
        setSelectedTypes([]);
        setMapTarget(null);
        setZipError('');
    };

    const handleZipChange = (event) => {
        const nextZip = event.target.value.replace(/\D/g, '').slice(0, 5);
        setSearchZip(nextZip);

        if (!nextZip) {
            setZipError('');
            return;
        }

        setZipError(ZIP_CODE_PATTERN.test(nextZip) ? '' : 'Enter a valid 5-digit ZIP code.');
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setMapTarget({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setGeoLoading(false);
            },
            () => {
                setGeoLoading(false);
                alert("Unable to retrieve your location. Please check your permissions.");
            }
        );
    };

    return (
        <div className="pantry-page-container">
            <div>
                <span className="pantry-search-title">FIND LOCAL FOOD PANTRIES</span>

                <div className="pantry-input-wrapper">
                    <div className="pantry-search-button-sq" onClick={handleSearch}>
                        🔍︎
                    </div>
                    <input 
                        type="text"
                        inputMode="numeric"
                        pattern="\d{5}"
                        maxLength={5}
                        placeholder="Enter 5-digit ZIP code"
                        className="pantry-zip-input"
                        value={searchZip}
                        onChange={handleZipChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <div
                        className={`pantry-geo-button-sq ${geoLoading ? 'is-loading' : ''}`}
                        onClick={handleUseMyLocation}
                        title="Use current location"
                    >
                        {geoLoading ? (
                            <span className="pantry-spinner"></span>
                        ) : (
                            <svg 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                className="geo-icon-svg"
                            >
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M12 2v3m0 14v3m10-10h-3M5 12H2"></path>
                                <circle cx="12" cy="12" r="7"></circle>
                            </svg>
                        )}
                    </div>
                </div>
                {zipError && <p className="pantry-zip-error">{zipError}</p>}

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
                            Showing {filteredGroups.length} {filteredGroups.length === 1 ? 'pantry' : 'pantries'}
                        </span>
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

            <div className="map-frame">
                {!loading && <PantryMap pantries={filteredGroups} target={mapTarget} />}
            </div>
        </div>
    );
};

export default PantryExplorer;
