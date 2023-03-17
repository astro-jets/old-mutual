const fetch = require('node-fetch');

async function getCurrentLocation() {
  const res = await fetch('https://ipapi.co/json/');
  const data = await res.json();
  const latitude = data.latitude;
  const longitude = data.longitude;
  return { latitude, longitude };
}

getCurrentLocation().then(coords => {
  console.log('Latitude:', coords.latitude);
  console.log('Longitude:', coords.longitude);
}).catch(err => {
  console.error('Error getting location:', err);
});
