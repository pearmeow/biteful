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
            <div className="pantry-search-block">
                <div className="pantry-search-header">
                    <span className="pantry-search-title">FIND LOCAL FOOD PANTRIES</span>
                </div>
                
                <div className="pantry-input-wrapper">
                    <div className="pantry-search-button-sq" onClick={handleSearch}>
                        🔍︎
                    </div>
                    <input 
                        type="text" 
                        placeholder="Input zip code..." 
                        className="pantry-zip-input"
                        value={searchZip}
                        onChange={(e) => setSearchZip(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
            </div>

            <div className="map-frame">
                {!loading && <PantryMap pantries={groups} target={mapTarget} />}
            </div>
        </div>
    );
};

export default PantryExplorer;