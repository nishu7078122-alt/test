// ========== HERO TYPING ==========
const heroQuote = document.getElementById("quote");
const words = ["Explore the colourful World", "Adventure Awaits", "Travel Beyond Limits"];
let w = 0, c = 0;
function type() {
  if (c < words[w].length) {
    heroQuote.textContent += words[w][c++];
    setTimeout(type, 100);
  } else setTimeout(erase, 2000);
}
function erase() {
  if (c > 0) {
    heroQuote.textContent = words[w].substring(0, --c);
    setTimeout(erase, 50);
  } else {
    w = (w + 1) % words.length;
    setTimeout(type, 200);
  }
}
document.addEventListener("DOMContentLoaded", () => setTimeout(type, 500));

// ========== WEATHER ==========
async function fetchWeather() {
  const apiKey = "YOUR_OPENWEATHERMAP_KEY"; // Replace with your real weather API key
  const city = "Kolkata";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.cod === 200) {
      document.getElementById("weather-location").innerText = data.name;
      document.getElementById("weather-temp").innerText = data.main.temp.toFixed(1);
      document.getElementById("weather-humidity").innerText = data.main.humidity;
    } else {
      document.getElementById("weather-location").innerText = "Location not found";
    }
  } catch (err) {
    console.error(err);
    document.getElementById("weather-location").innerText = "Error fetching weather";
  }
}
fetchWeather();

// ========== GOOGLE MAP + HOTELS ==========
let map, infoWindow, service, userMarker, markers = [];

function initMap() {
  const defaultPos = { lat: 22.5726, lng: 88.3639 }; // default Kolkata
  map = new google.maps.Map(document.getElementById("map"), {
    center: defaultPos,
    zoom: 13,
  });
  infoWindow = new google.maps.InfoWindow();
  service = new google.maps.places.PlacesService(map);

  document.getElementById("locBtn").addEventListener("click", getUserLocation);
  document.getElementById("radiusSelect").addEventListener("change", () => {
    if (userMarker) searchNearbyHotels(userMarker.getPosition());
  });

  getUserLocation(); // auto locate
}

function getUserLocation() {
  const status = document.getElementById("status");
  if (navigator.geolocation) {
    status.textContent = "Detecting location...";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map.setCenter(loc);
        map.setZoom(14);

        if (userMarker) userMarker.setMap(null);
        userMarker = new google.maps.Marker({
          position: loc,
          map,
          icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          title: "You are here",
        });
        infoWindow.setContent("You are here!");
        infoWindow.open(map, userMarker);

        searchNearbyHotels(loc);
        status.textContent = "Location found!";
      },
      () => {
        status.textContent = "Unable to get your location.";
      }
    );
  } else {
    status.textContent = "Geolocation not supported.";
  }
}

function clearMarkers() {
  markers.forEach((m) => m.setMap(null));
  markers = [];
}

function searchNearbyHotels(location) {
  const loader = document.getElementById("hotel-loader");
  loader.textContent = "Searching nearby hotels...";
  clearMarkers();
  const radius = parseInt(document.getElementById("radiusSelect").value);

  const request = { location, radius, type: ["lodging"] };
  service.nearbySearch(request, (results, status) => {
    const list = document.getElementById("hotel-list");
    list.innerHTML = "";
    if (status === google.maps.places.PlacesServiceStatus.OK && results.length) {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      results.forEach((place) => {
        const marker = new google.maps.Marker({
          map,
          position: place.geometry.location,
          title: place.name,
        });
        markers.push(marker);

        const li = document.createElement("li");
        li.textContent = `${place.name}${place.rating ? " ⭐" + place.rating : ""}`;
        li.style.cursor = "pointer";
        li.onclick = () => {
          map.panTo(place.geometry.location);
          map.setZoom(15);
          infoWindow.setContent(place.name);
          infoWindow.open(map, marker);
        };
        list.appendChild(li);
      });
      loader.textContent = `${results.length} hotels found.`;
    } else {
      loader.textContent = "No hotels found nearby.";
    }
  });
}
