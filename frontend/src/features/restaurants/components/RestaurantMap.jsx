import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import BaseMap, { purpleIcon } from '../../common/components/BaseMap'

const RestaurantMap = ({ restaurants = [], target }) => {
  return (
    <BaseMap target={target}>
      {restaurants.map((restaurant) => (
        <Marker 
          key={restaurant.id} 
          position={[restaurant.latitude, restaurant.longitude]}
          icon={purpleIcon}
        >
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
    </BaseMap>
  );
};

export default React.memo(RestaurantMap);