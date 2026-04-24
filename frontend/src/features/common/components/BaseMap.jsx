import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';

function MapUpdater({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target?.lat != null && target?.lng != null) {
      map.flyTo([target.lat, target.lng], target.zoom ?? 15, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

const DEFAULT_CLUSTER_OPTIONS = {
  chunkedLoading: false,
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
    const nextClusterGroup = L.markerClusterGroup(clusterOptions);

    const markers = normalizedItems.map((item) => {
      const marker = L.marker(getPosition(item).map(Number), { icon });
      bindLazyPopup(marker, item, buildPopupContent, popupClassName);
      return marker;
    });

    if (markers.length > 0) {
      // Build the cluster tree before attaching it to the map so the plugin
      // cannot continue chunk-processing after React has removed the layer.
      nextClusterGroup.addLayers(markers);
    }

    const previousClusterGroup = clusterGroupRef.current;
    clusterGroupRef.current = nextClusterGroup;
    map.addLayer(nextClusterGroup);

    if (previousClusterGroup) {
      previousClusterGroup.clearLayers();
      map.removeLayer(previousClusterGroup);
    }

    return () => {
      nextClusterGroup.clearLayers();
      if (map.hasLayer(nextClusterGroup)) {
        map.removeLayer(nextClusterGroup);
      }

      if (clusterGroupRef.current === nextClusterGroup) {
        clusterGroupRef.current = null;
      }
    };
  }, [buildPopupContent, clusterOptions, getPosition, icon, map, normalizedItems, popupClassName]);

  return null;
};

export const MarkerLayer = ({
  items = [],
  getKey,
  getPosition,
  buildPopupContent,
  popupClassName,
  icon,
  shouldOpenPopup = false,
}) => {
  const normalizedItems = useMemo(
    () => getNormalizedItems(items, getKey, getPosition),
    [getKey, getPosition, items]
  );

  return normalizedItems.map((item) => (
    <PopupMarker
      key={getKey(item)}
      item={item}
      popupKey={getKey(item)}
      position={getPosition(item).map(Number)}
      buildPopupContent={buildPopupContent}
      popupClassName={popupClassName}
      icon={icon}
      shouldOpenPopup={shouldOpenPopup}
    />
  ));
};

const PopupMarker = ({
  item,
  popupKey,
  position,
  buildPopupContent,
  popupClassName,
  icon,
  shouldOpenPopup = false,
}) => {
  const markerRef = useRef(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    if (!marker.getPopup()) {
      marker.bindPopup(buildPopupContent(item), { className: popupClassName });
    }

    if (shouldOpenPopup) {
      marker.openPopup();
    }
  }, [buildPopupContent, item, popupClassName, popupKey, shouldOpenPopup]);

  return (
    <Marker
      ref={markerRef}
      position={position}
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
  );
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
          shouldOpenPopup
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
