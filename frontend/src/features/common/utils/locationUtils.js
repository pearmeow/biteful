export const normalizeZip = (value = '') => value.replace(/\D/g, '').slice(0, 5);

const EARTH_RADIUS_KM = 6371;
const KM_TO_MILES = 0.621371;

const toRadians = (value) => (value * Math.PI) / 180;

export const getCurrentPosition = (options = { enableHighAccuracy: true }) =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });

export const getCoordsFromPosition = (position) => ({
  lat: position.coords.latitude,
  lng: position.coords.longitude,
});

export const calculateLinearDistance = (origin, destination, unit = 'miles') => {
  if (!origin || !destination) return null;

  const originLat = Number(origin.lat);
  const originLng = Number(origin.lng);
  const destinationLat = Number(destination.lat);
  const destinationLng = Number(destination.lng);

  if ([originLat, originLng, destinationLat, destinationLng].some((value) => Number.isNaN(value))) {
    return null;
  }

  const latDelta = toRadians(destinationLat - originLat);
  const lngDelta = toRadians(destinationLng - originLng);
  const haversine =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(originLat)) *
      Math.cos(toRadians(destinationLat)) *
      Math.sin(lngDelta / 2) ** 2;

  const distanceKm = 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return unit === 'kilometers' ? distanceKm : distanceKm * KM_TO_MILES;
};

export const formatDistance = (distance, unit = 'miles') => {
  if (distance == null || Number.isNaN(distance)) return '';

  const roundedDistance = distance < 10 ? distance.toFixed(1) : Math.round(distance).toString();
  return `${roundedDistance} ${unit === 'kilometers' ? 'km' : 'mi'}`;
};
