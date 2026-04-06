import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; 

const PantryMap = ({ pantries = [] }) => {
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

      {pantries.map((group) => (
        <Marker key={group.id} position={[group.latitude, group.longitude]}>
          <Popup>
            <div className="pantry-popup-container">
              <h3>{group.agency}</h3>
              <p>{group.address}</p>
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