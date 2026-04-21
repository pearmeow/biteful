import { useState } from 'react';
import { useRestaurants } from '../hooks/useRestaurants';
import RestaurantMap from './RestaurantMap';

const RestaurantExplorer = () => {
    const { restaurants, loading, error, fetchByZipcode } = useRestaurants();
    const [zipInput, setZipInput] = useState("");
    const [activeZip, setActiveZip] = useState(null);

    const handleSearch = () => {
        const zip = zipInput.trim();
        if (!zip) return;
        setActiveZip(zip);
        fetchByZipcode(zip);
    };

    return (
        <div className="restaurant-page-container">
            <div className="search-header">
                <input
                    type="text"
                    placeholder="Enter Zip Code (e.g., 10011)"
                    value={zipInput}
                    onChange={(e) => setZipInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch}>Search</button>
            </div>

            {loading && <div className="loading">Loading restaurants for {activeZip}...</div>}
            {error && <div className="error">Error: {error}</div>}

            {!activeZip && !loading && (
                <div className="loading">Enter a zip code to view restaurants on the map.</div>
            )}

            {activeZip && !loading && !error && restaurants.length === 0 && (
                <div className="loading">No restaurants found for zip code {activeZip}.</div>
            )}

            {activeZip && !loading && restaurants.length > 0 && (
                <div>
                    <RestaurantMap restaurants={restaurants} target={null} />
                </div>
            )}
        </div>
    );
};

export default RestaurantExplorer;
