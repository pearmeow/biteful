import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';

function MapUpdater({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target?.lat != null && target?.lng != null) {
      map.flyTo([target.lat, target.lng], 15, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

const DEFAULT_CLUSTER_OPTIONS = {
  chunkedLoading: true,
  chunkInterval: 120,
  chunkDelay: 40,
  removeOutsideVisibleBounds: true,
  animate: false,
  animateAddingMarkers: false,
  showCoverageOnHover: false,
  maxClusterRadius: 20,
  spiderfyOnMaxZoom: true,
  spiderfyDistanceMultiplier: 2.5,
  zoomToBoundsOnClick: false,
};

const getNormalizedItems = (items, getKey, getPosition) =>
  (items || []).filter((item) => {
    const key = getKey(item);
    const position = getPosition(item);

    return (
      key != null &&
      Array.isArray(position) &&
      position.length === 2 &&
      position[0] != null &&
      position[1] != null &&
      !Number.isNaN(Number(position[0])) &&
      !Number.isNaN(Number(position[1]))
    );
  });

const bindLazyPopup = (marker, item, buildPopupContent, popupClassName) => {
  const bindPopup = () => {
    if (marker.getPopup()) return;
    marker.bindPopup(buildPopupContent(item), { className: popupClassName });
  };

  marker.on('popupopen', () => {
    bindPopup();
    marker.openPopup();
  });

  marker.on('click', bindPopup);
};

export const ClusteredMarkerLayer = ({
  items = [],
  getKey,
  getPosition,
  buildPopupContent,
  popupClassName,
  icon,
  clusterOptions = DEFAULT_CLUSTER_OPTIONS,
}) => {
  const map = useMap();
  const clusterGroupRef = useRef(null);

  const normalizedItems = useMemo(
    () => getNormalizedItems(items, getKey, getPosition),
    [getKey, getPosition, items]
  );

  useEffect(() => {
    if (clusterGroupRef.current) return;

    const clusterGroup = L.markerClusterGroup(clusterOptions);
    clusterGroupRef.current = clusterGroup;
    map.addLayer(clusterGroup);

    return () => {
      map.removeLayer(clusterGroup);
      clusterGroupRef.current = null;
    };
  }, [clusterOptions, map]);

  useEffect(() => {
    const clusterGroup = clusterGroupRef.current;
    if (!clusterGroup) return;

    clusterGroup.clearLayers();
    if (normalizedItems.length === 0) return;

    const markers = normalizedItems.map((item) => {
      const marker = L.marker(getPosition(item).map(Number), { icon });
      bindLazyPopup(marker, item, buildPopupContent, popupClassName);
      return marker;
    });

    clusterGroup.addLayers(markers);
  }, [buildPopupContent, getPosition, icon, normalizedItems, popupClassName]);

  return null;
};

export const MarkerLayer = ({
  items = [],
  getKey,
  getPosition,
  buildPopupContent,
  popupClassName,
  icon,
}) => {
  const normalizedItems = useMemo(
    () => getNormalizedItems(items, getKey, getPosition),
    [getKey, getPosition, items]
  );

  return normalizedItems.map((item) => (
    <Marker
      key={getKey(item)}
      position={getPosition(item).map(Number)}
      icon={icon}
      eventHandlers={{
        click: (event) => {
          const marker = event.target;
          if (!marker.getPopup()) {
            marker.bindPopup(buildPopupContent(item), { className: popupClassName });
          }

          marker.openPopup();
        },
      }}
    />
  ));
};

export const SelectableMarkerLayers = ({
  items = [],
  selectedItem = null,
  shouldClusterPins = false,
  getKey,
  getPosition,
  buildPopupContent,
  popupClassName,
  icon,
  clusterOptions,
}) => {
  const baseItems = useMemo(() => {
    if (!selectedItem) return items;

    const selectedKey = getKey(selectedItem);
    return (items || []).filter((item) => getKey(item) !== selectedKey);
  }, [getKey, items, selectedItem]);

  const sharedProps = {
    getKey,
    getPosition,
    buildPopupContent,
    popupClassName,
    icon,
  };

  return (
    <>
      {shouldClusterPins ? (
        <ClusteredMarkerLayer
          items={baseItems}
          clusterOptions={clusterOptions}
          {...sharedProps}
        />
      ) : (
        <MarkerLayer
          items={baseItems}
          {...sharedProps}
        />
      )}
      {selectedItem && (
        <MarkerLayer
          items={[selectedItem]}
          getKey={(item) => `selected-${getKey(item)}`}
          getPosition={getPosition}
          buildPopupContent={buildPopupContent}
          popupClassName={popupClassName}
          icon={icon}
        />
      )}
    </>
  );
};

const BaseMap = ({ target, children, center = [40.7128, -74.0060], zoom = 12 }) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="map-frame"
      style={{ height: '600px', width: '100%' }}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater target={target} />
      {children}
    </MapContainer>
  );
};

export default BaseMap;
