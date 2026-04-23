import React, { useEffect, useMemo, useRef } from 'react';
import { Marker, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet.markercluster';
import BaseMap, { purpleIcon } from '../../common/components/BaseMap';
import 'leaflet/dist/leaflet.css';

const buildPopupContent = (restaurant, onNavigate) => {
    const container = document.createElement('div');
    container.className = 'rpc';

    const title = document.createElement('h3');
    title.className = 'rpc-name';
    title.textContent = restaurant.name || 'Unknown Restaurant';
    container.appendChild(title);

    if (restaurant.phone) {
        const phoneLink = document.createElement('a');
        phoneLink.href = `tel:${restaurant.phone.replace(/\D/g, '')}`;
        phoneLink.className = 'rpc-phone';
        phoneLink.textContent = restaurant.phone;
        container.appendChild(phoneLink);
    }

    if (restaurant.address) {
        const addressLink = document.createElement('a');
        addressLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`;
        addressLink.target = '_blank';
        addressLink.rel = 'noopener noreferrer';
        addressLink.className = 'rpc-address';
        addressLink.title = 'Open in Maps';
        addressLink.textContent = restaurant.address;
        container.appendChild(addressLink);
    }

    if (restaurant.cuisine || restaurant.grade) {
        const meta = document.createElement('div');
        meta.className = 'rpc-meta';

        if (restaurant.cuisine) {
            const cuisineGroup = document.createElement('div');
            cuisineGroup.className = 'rpc-category-group';

            const cuisineLabel = document.createElement('span');
            cuisineLabel.className = 'rpc-category-label';
            cuisineLabel.textContent = 'Cuisine';

            const cuisineValue = document.createElement('div');
            cuisineValue.className = 'rpc-detail-row';
            cuisineValue.textContent = restaurant.cuisine;

            cuisineGroup.append(cuisineLabel, cuisineValue);
            meta.appendChild(cuisineGroup);
        }

        if (restaurant.grade) {
            const gradeGroup = document.createElement('div');
            gradeGroup.className = 'rpc-category-group';

            const gradeLabel = document.createElement('span');
            gradeLabel.className = 'rpc-category-label';
            gradeLabel.textContent = 'Grade';

            const gradeValue = document.createElement('div');
            gradeValue.className = 'rpc-detail-row';
            gradeValue.textContent = restaurant.grade;

            gradeGroup.append(gradeLabel, gradeValue);
            meta.appendChild(gradeGroup);
        }

        container.appendChild(meta);
    }

    const links = document.createElement('div');
    links.className = 'rpc-links';

    const viewMenuLink = document.createElement('button');
    viewMenuLink.type = 'button';
    viewMenuLink.className = 'rpc-action-link';
    viewMenuLink.textContent = 'View Menu';
    viewMenuLink.dataset.action = 'view-menu';

    const uploadMenuLink = document.createElement('button');
    uploadMenuLink.type = 'button';
    uploadMenuLink.className = 'rpc-action-link';
    uploadMenuLink.textContent = 'Upload Menu';
    uploadMenuLink.dataset.action = 'upload-menu';

    const state = {
        name: restaurant.name,
        address: restaurant.address,
        phone: restaurant.phone,
    };

    viewMenuLink.onclick = () => onNavigate(`/${restaurant.id}/menu`, state);
    uploadMenuLink.onclick = () => onNavigate(`/${restaurant.id}/menu/upload`, state);

    links.append(viewMenuLink, uploadMenuLink);
    container.appendChild(links);

    return container;
};

const createRestaurantMarker = (restaurant, onNavigate) => {
    const marker = L.marker([Number(restaurant.latitude), Number(restaurant.longitude)], {
        icon: purpleIcon,
    });

    marker.on('popupopen', () => {
        if (marker.getPopup()) return;
        marker.bindPopup(buildPopupContent(restaurant, onNavigate), { className: 'rpc-popup' });
        marker.openPopup();
    });

    marker.on('click', () => {
        if (!marker.getPopup()) {
            marker.bindPopup(buildPopupContent(restaurant, onNavigate), { className: 'rpc-popup' });
        }
    });

    return marker;
};

const RestaurantClusterLayer = ({ restaurants = [] }) => {
    const map = useMap();
    const navigate = useNavigate();
    const clusterGroupRef = useRef(null);
    const markerByIdRef = useRef(new Map());

    const normalizedRestaurants = useMemo(() => {
        return (restaurants || []).filter((restaurant) =>
            restaurant &&
            restaurant.id &&
            restaurant.latitude != null &&
            restaurant.longitude != null &&
            !Number.isNaN(Number(restaurant.latitude)) &&
            !Number.isNaN(Number(restaurant.longitude))
        );
    }, [restaurants]);

    useEffect(() => {
        if (clusterGroupRef.current) return;

        const clusterGroup = L.markerClusterGroup({
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
        });

        clusterGroupRef.current = clusterGroup;
        map.addLayer(clusterGroup);

        return () => {
            map.removeLayer(clusterGroup);
            clusterGroupRef.current = null;
        };
    }, [map]);

    useEffect(() => {
        const clusterGroup = clusterGroupRef.current;
        if (!clusterGroup) return;

        clusterGroup.clearLayers();
        markerByIdRef.current.clear();

        for (const restaurant of normalizedRestaurants) {
            const marker = createRestaurantMarker(restaurant, (path, state) => {
                navigate(path, { state });
            });

            markerByIdRef.current.set(restaurant.id, marker);
        }

        if (markerByIdRef.current.size > 0) {
            clusterGroup.addLayers([...markerByIdRef.current.values()]);
        }
    }, [navigate, normalizedRestaurants]);

    useEffect(() => {
        return () => {
            markerByIdRef.current.clear();
        };
    }, []);

    return null;
};

const RestaurantMarkerLayer = ({ restaurants = [] }) => {
    const navigate = useNavigate();

    const normalizedRestaurants = useMemo(() => {
        return (restaurants || []).filter((restaurant) =>
            restaurant &&
            restaurant.id &&
            restaurant.latitude != null &&
            restaurant.longitude != null &&
            !Number.isNaN(Number(restaurant.latitude)) &&
            !Number.isNaN(Number(restaurant.longitude))
        );
    }, [restaurants]);

    return normalizedRestaurants.map((restaurant) => (
        <Marker
            key={restaurant.id}
            position={[Number(restaurant.latitude), Number(restaurant.longitude)]}
            icon={purpleIcon}
            eventHandlers={{
                click: (event) => {
                    const marker = event.target;
                    if (!marker.getPopup()) {
                        marker.bindPopup(
                            buildPopupContent(restaurant, (path, state) => navigate(path, { state })),
                            { className: 'rpc-popup' }
                        );
                    }

                    marker.openPopup();
                },
            }}
        />
    ));
};

const RestaurantMap = ({ restaurants = [], shouldClusterPins = false, target }) => {
    return (
        <BaseMap target={target}>
            {shouldClusterPins ? (
                <RestaurantClusterLayer restaurants={restaurants} />
            ) : (
                <RestaurantMarkerLayer restaurants={restaurants} />
            )}
        </BaseMap>
    );
};

export default React.memo(RestaurantMap);
