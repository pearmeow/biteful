import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';

function MapUpdater({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 15, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}


const RestaurantMap = ({ restaurants = [], target }) => {
  return (
    <MapContainer
      center={[40.7128, -74.0060]}
      zoom={12}
      className="map-frame"
      style={{ height: '600px', width: '100%' }} // Backup height
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater target={target} />

      {restaurants.map((restaurant) => (
        <Marker key={restaurant.id} position={[restaurant.latitude, restaurant.longitude]}>
          <Popup className="rpc-popup">
            <div className="rpc">

              <p className="rpc-name">{restaurant.name}</p>

              <div className="rpc-meta">
                {restaurant.cuisine && (
                  <span className="rpc-cuisine">{restaurant.cuisine}</span>
                )}
                {restaurant.grade && (
                  <span className="rpc-grade">Grade: {restaurant.grade}</span>
                )}
              </div>

              <Link to={`/${restaurant.id}/menu`} state={{ name: restaurant.name, address: restaurant.address, phone:restaurant.phone }}>
                View Menu
              </Link>
              <Link to={`/${restaurant.id}/menu/upload`} state={{ name: restaurant.name, address: restaurant.address, phone:restaurant.phone }}>
                Upload Menu
              </Link>

              {restaurant.phone && (
                <div className="rpc-phone">📞 {restaurant.phone}</div>
              )}

              {restaurant.address && (
                <>
                  <div className="rpc-divider" />
                  📍
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rpc-address"
                    title="Open in Maps"
                  >
                    {restaurant.address}
                  </a>
                </>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default RestaurantMap;