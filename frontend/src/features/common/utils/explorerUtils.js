import { calculateLinearDistance } from './locationUtils';

export const toggleSelectedValue = (value, setSelectedValues) => {
    setSelectedValues((current) =>
        current.includes(value)
            ? current.filter((item) => item !== value)
            : [...current, value]
    );
};

export const sortItemsByDistance = (items, userCoords, getCoordinates, shouldSort = false) => {
    const itemsWithDistance = items.map((item) => ({
        ...item,
        distance: calculateLinearDistance(userCoords, getCoordinates(item), 'miles'),
    }));

    if (!userCoords || !shouldSort) {
        return itemsWithDistance;
    }

    return [...itemsWithDistance].sort((a, b) => {
        if (a.distance == null && b.distance == null) return 0;
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
    });
};

export const getVisibleClusterItems = (items, deferredItems, threshold) =>
    items.length <= threshold ? items : deferredItems;
