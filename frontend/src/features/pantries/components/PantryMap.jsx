import React from 'react';
import 'leaflet/dist/leaflet.css';
import BaseMap, { SelectableMarkerLayers } from '../../common/components/BaseMap';
import { purpleIcon } from '../../common/utils/mapPins';

const DAY_ORDER = {
  "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4,
  "Friday": 5, "Saturday": 6, "Sunday": 7
};

const buildPantryPopupContent = (group) => {
  const container = document.createElement('div');
  container.className = 'pantry-popup-container';

  const title = document.createElement('h3');
  title.textContent = group.agency || 'Unknown Agency';
  container.appendChild(title);

  const displayAddress = [
    group.building,
    group.street,
    group.boro,
    group.zipcode
  ].filter(Boolean).join(', ');

  if (displayAddress) {
    const addressLink = document.createElement('a');
    addressLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayAddress)}`;
    addressLink.target = '_blank';
    addressLink.rel = 'noopener noreferrer';
    addressLink.className = 'pantry-address-link';
    addressLink.textContent = displayAddress;
    container.appendChild(addressLink);
  }

  const phoneValue = group.phone?.trim();
  const phoneElement = document.createElement(phoneValue ? 'a' : 'span');
  if (phoneValue) {
    phoneElement.href = `tel:${phoneValue.replace(/\D/g, '')}`;
  }
  phoneElement.className = 'pantry-phone-link';
  phoneElement.textContent = phoneValue || 'No phone listed';
  container.appendChild(phoneElement);

  const groupedPrograms = (group.programs || []).reduce((acc, program) => {
    if (!acc[program.program]) acc[program.program] = [];
    acc[program.program].push(program);
    return acc;
  }, {});

  const list = document.createElement('div');
  list.className = 'pantry-list-scroll';

  for (const [category, days] of Object.entries(groupedPrograms)) {
    const categoryGroup = document.createElement('div');
    categoryGroup.className = 'pantry-category-group';

    const categoryLabel = document.createElement('span');
    categoryLabel.className = 'pantry-category-label';
    categoryLabel.textContent = category;
    categoryGroup.appendChild(categoryLabel);

    const sortedDays = [...days].sort((a, b) =>
      (DAY_ORDER[a.day_of_week] || 99) - (DAY_ORDER[b.day_of_week] || 99)
    );

    for (const day of sortedDays) {
      const dayRow = document.createElement('div');
      dayRow.className = 'pantry-day-row';
      dayRow.textContent = `${day.day_of_week}: ${day.open_time} - ${day.close_time}`;
      categoryGroup.appendChild(dayRow);
    }

    list.appendChild(categoryGroup);
  }

  container.appendChild(list);
  return container;
};

const PantryMap = ({ pantries = [], selectedPantry = null, shouldClusterPins = false, target }) => {
  return (
    <BaseMap target={target}>
      <SelectableMarkerLayers
        items={pantries}
        selectedItem={selectedPantry}
        shouldClusterPins={shouldClusterPins}
        getKey={(group) => group.id}
        getPosition={(group) => [group.latitude, group.longitude]}
        buildPopupContent={buildPantryPopupContent}
        popupClassName="pantry-popup"
        icon={purpleIcon}
      />
    </BaseMap>
  );
};

export default React.memo(PantryMap);
