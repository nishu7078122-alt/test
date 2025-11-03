// =========================
// HERO TEXT EFFECT
// =========================
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
  } else { w = (w + 1) % words.length; setTimeout(type, 200); }
}
document.addEventListener("DOMContentLoaded", () => setTimeout(type, 500));

// =========================
// WEATHER (OpenWeatherMap)
// =========================
async function fetchWeather() {
  const apiKey = "YOUR_OPENWEATHERMAP_KEY"; // <-- Replace with your own OpenWeatherMap key
  const city = "Kolkata";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.cod === 200) {
      document.getElementById('weather-location').innerText = data.name;
      document.getElementById('weather-temp').innerText = data.main.temp.toFixed(1);
      document.getElementById('weather-humidity').innerText = data.main.humidity;
    }
  } catch (err) { console.error(err); }
}
fetchWeather();

// =========================
// GOOGLE MAP + HOTELS
// =========================
let map, service, infoWindow, userMarker;

function initMap() {
  const defaultLoc = { lat: 22.5726, lng: 88.3639 }; // Kolkata default
  map = new google.maps.Map(document.getElementById("map"), {
    center: defaultLoc,
    zoom: 13,
  });
  infoWindow = new google.maps.InfoWindow();

  // Try to get user location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      map.setCenter(loc);
      userMarker = new google.maps.Marker({
        map,
        position: loc,
        icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        title: "You are here",
      });
      infoWindow.setContent("You are here!");
      infoWindow.open(map, userMarker);
      searchNearbyHotels(loc);
    }, () => alert("Unable to detect location!"));
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function searchNearbyHotels(location) {
  const request = { location, radius: 3000, type: ["hotel"] };
  const hotelsList = document.getElementById("hotel-list");
  hotelsList.innerHTML = "<li>Searching nearby hotels...</li>";

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, (results, status) => {
    hotelsList.innerHTML = "";
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      results.forEach((place) => {
        const marker = new google.maps.Marker({
          position: place.geometry.location,
          map,
          title: place.name,
        });
        const li = document.createElement("li");
        li.textContent = `${place.name} (${place.vicinity || "Location not available"})`;
        li.addEventListener("click", () => {
          map.panTo(place.geometry.location);
          map.setZoom(15);
          infoWindow.setContent(place.name);
          infoWindow.open(map, marker);
        });
        hotelsList.appendChild(li);
      });
    } else {
      hotelsList.innerHTML = "<li>No nearby hotels found.</li>";
    }
  });
}
