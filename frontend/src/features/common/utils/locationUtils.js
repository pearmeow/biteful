export const normalizeZip = (value = '') => value.replace(/\D/g, '').slice(0, 5);

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
