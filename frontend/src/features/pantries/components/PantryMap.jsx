import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapUpdater({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 15, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

const purpleIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const PantryMap = ({ pantries = [], target }) => {
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

      {pantries.map((group) => (
        <Marker key={group.id} position={[group.latitude, group.longitude]} icon={purpleIcon}>
          <Popup>
            <div className="pantry-popup-container">
              <h3>{group.agency}</h3>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(group.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pantry-address-link"
                title="Open in Maps"
              >
                {group.address}
              </a>
              <a
                href={`tel:${group.phone.replace(/\D/g, '')}`}
                className="pantry-phone-link"
              >
                {group.phone}
              </a>
              <div className="pantry-list-scroll">
                {group.programs.map((p, idx) => (
                  <div key={idx} className="pantry-item-row">
                    <span>{p.program}</span>
                    <strong>{p.day_of_week}</strong>: {p.open_time} - {p.close_time}
                  </div>
                ))}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default PantryMap;