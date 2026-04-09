import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

const DAY_ORDER = {
  "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, 
  "Friday": 5, "Saturday": 6, "Sunday": 7
};

const PantryMap = ({ pantries = [], target }) => {
  return (
    <MapContainer
      center={[40.7128, -74.0060]}
      zoom={12}
      className="map-frame"
      style={{ height: '600px', width: '100%' }}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater target={target} />

      {pantries.map((group) => {
        const groupedPrograms = group.programs.reduce((acc, p) => {
          if (!acc[p.program]) acc[p.program] = [];
          acc[p.program].push(p);
          return acc;
        }, {});

        return (
          <Marker key={group.id} position={[group.latitude, group.longitude]} icon={purpleIcon}>
            <Popup>
              <div className="pantry-popup-container">
                <h3>{group.agency}</h3>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(group.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pantry-address-link"
                >
                  {group.address}
                </a>
                <a
                  href={`tel:${group.phone?.replace(/\D/g, '')}`}
                  className="pantry-phone-link"
                >
                  {group.phone || "No phone listed"}
                </a>

                <div className="pantry-list-scroll">
                  {Object.entries(groupedPrograms).map(([category, days], idx) => {
                    const sortedDays = [...days].sort((a, b) => 
                        (DAY_ORDER[a.day_of_week] || 99) - (DAY_ORDER[b.day_of_week] || 99)
                    );

                    return (
                      <div key={idx} className="pantry-category-group">
                        <span className="pantry-category-label">{category}</span>
                        {sortedDays.map((d, dIdx) => (
                          <div key={dIdx} className="pantry-day-row">
                            <strong>{d.day_of_week}:</strong> {d.open_time} - {d.close_time}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default PantryMap;