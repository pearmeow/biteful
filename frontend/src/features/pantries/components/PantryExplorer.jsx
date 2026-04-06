import { usePantries } from '../hooks/usePantries';
import PantryMap from './PantryMap';

const PantryExplorer = () => {
    const { groups, loading, error } = usePantries();

    // If loading, show a message instead of the map
    if (loading) return <div className="loading">Loading pantry data...</div>;

    // If error, show the error
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="pantry-page-container">
            <div className="search-header">
                {/* Search input here */}
            </div>
            <div className="map-frame">
                {/* 'groups' is guaranteed to be an array */}
                <PantryMap pantries={groups} />
            </div>
        </div>
    );
};

export default PantryExplorer;