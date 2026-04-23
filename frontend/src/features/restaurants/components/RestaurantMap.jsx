import React from 'react';
import { useNavigate } from 'react-router-dom';
import BaseMap, { SelectableMarkerLayers } from '../../common/components/BaseMap';
import { purpleIcon } from '../../common/utils/mapPins';
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
            cuisineLabel.textContent = 'Cuisine:';

            const cuisineValue = document.createElement('span');
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
            gradeLabel.textContent = 'Grade:';

            const gradeValue = document.createElement('span');
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

const RestaurantMap = ({ restaurants = [], selectedRestaurant = null, shouldClusterPins = false, target }) => {
    const navigate = useNavigate();
    const buildRestaurantPopup = (restaurant) =>
        buildPopupContent(restaurant, (path, state) => navigate(path, { state }));

    return (
        <BaseMap target={target}>
            <SelectableMarkerLayers
                items={restaurants}
                selectedItem={selectedRestaurant}
                shouldClusterPins={shouldClusterPins}
                getKey={(restaurant) => restaurant.id}
                getPosition={(restaurant) => [restaurant.latitude, restaurant.longitude]}
                buildPopupContent={buildRestaurantPopup}
                popupClassName="rpc-popup"
                icon={purpleIcon}
            />
        </BaseMap>
    );
};

export default React.memo(RestaurantMap);
