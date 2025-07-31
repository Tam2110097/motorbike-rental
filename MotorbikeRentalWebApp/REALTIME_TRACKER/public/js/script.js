const socket = io();

// Simulate moving location every 3 seconds
let simulatedLatitude = null;
let simulatedLongitude = null;
let hasInitialLocation = false;

function simulateMovement() {
    if (!hasInitialLocation) {
        console.log("Waiting for initial location...");
        return;
    }

    // Move about 5-10 meters in a random direction
    const movementDistance = 0.00005 + Math.random() * 0.00005; // 5-10 meters
    const angle = Math.random() * 2 * Math.PI; // Random direction

    simulatedLatitude += Math.cos(angle) * movementDistance;
    simulatedLongitude += Math.sin(angle) * movementDistance;

    console.log(`Simulated movement - Lat: ${simulatedLatitude.toFixed(6)}, Lng: ${simulatedLongitude.toFixed(6)}`);
    socket.emit('send-location', { latitude: simulatedLatitude, longitude: simulatedLongitude });
}

// Start simulation
setInterval(simulateMovement, 3000);

if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;

        // Set initial location for simulation if not set yet
        if (!hasInitialLocation) {
            simulatedLatitude = latitude;
            simulatedLongitude = longitude;
            hasInitialLocation = true;
            console.log(`Initial location set - Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
        }

        socket.emit('send-location', { latitude, longitude });
    },
        (error) => {
            console.error(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}

const map = L.map('map').setView([0, 0], 16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const markers = {};

socket.on('receive-location', (data) => {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude]);
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

socket.on('user-disconnected', (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
