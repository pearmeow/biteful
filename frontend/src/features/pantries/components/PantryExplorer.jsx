import { useState } from 'react';
import { usePantries } from '../hooks/usePantries';
import PantryMap from './PantryMap';

const PantryExplorer = () => {
    const { groups, loading, error } = usePantries();
    const [searchZip, setSearchZip] = useState("");
    const [mapTarget, setMapTarget] = useState(null);

    // If loading, show a message instead of the map
    if (loading) return <div className="loading">Loading pantry data...</div>;
    // If error, show the error
    if (error) return <div className="error">Error: {error}</div>;

    const handleSearch = () => {
        if (!searchZip) return;
        const match = groups.find(g => g.address.includes(searchZip));
        if (match) {
            setMapTarget({ lat: match.latitude, lng: match.longitude });
        } else {
            alert("No pantries found for that zip code.");
        }
    }

    return (
        <div className="pantry-page-container">
            <div className="search-header">
                <input 
                    type="text" 
                    placeholder="Enter Zip Code (e.g., 10011)" 
                    value={searchZip}
                    onChange={(e) => setSearchZip(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch}>Search</button>
            </div>
            <div className="map-frame">
                {!loading && <PantryMap pantries={groups} target={mapTarget} />}
            </div>
        </div>
    );
};

export default PantryExplorer;