// global variable for passing along the map instance
// Unfortunately, I could not encapsulate it in the IIFE below, because the Maps API needs access to the callback.
const gyg = {};

/**
 * @param {object} elem - container for user data DOM elements
 */
function fetchUserData(elem) {
	// Chrome supports the Fetch API
	fetch('https://www.getyourguide.com/touring.json?key=2Gr0p7z96D')
		.then(function(response) {
			response.json().then(function(data) {
				elem.userName.innerHTML = data.customerFirstName;
				elem.activity.innerHTML = data.activityTitle;
				elem.img.src = data.activityPictureUrl;

				// Update map and marker positions
				// I deliberatly made sure the user data is displayed even if Google Maps is not ready yet,
				// to avoid any third-party dependencies.
				let latLong;
				if (gyg.map) {
					latLong = new google.maps.LatLng(data.activityCoordinateLatitude, data.activityCoordinateLongitude);
					gyg.map.setCenter(latLong);
				}
				if (gyg.marker) {
					gyg.marker.setPosition(latLong || new google.maps.LatLng(data.activityCoordinateLatitude, data.activityCoordinateLongitude));
				}
			});
		})
		.then(function(response) {
			// get the next user's data after 8s
			setTimeout(fetchUserData, 8000, elem);
		})
		.catch(function(err) {
			// if something went wrong, try again
			// this error handling is very basic and should be improved for production code
			fetchUserData(elem);
		});
}

/**
 * Initialise Google Map
 * Is called by Google Maps API
 */
function initMap() {
	const mapElem = document.getElementById('map');

	// initialise map without positioning
	gyg.map = new google.maps.Map(mapElem, {
		scrollwheel: false,
		draggable: false,
		mapTypeControl: false,
		zoomControl: false,
		streetViewControl: false,
		zoom: 9
	});

	// initialise marker without positioning
	gyg.marker = new google.maps.Marker({
		map: gyg.map,
		icon: '/mapmarker.png'
	});
}

// use an Immediately Invoked Function Expression to avoid creating global variables
(function () {
	// get DOM elements only once for performance reasons
	const elem = {
		userName: document.querySelector('h1'),
		activity: document.querySelector('p'),
		img: document.querySelector('img')
	};

	// start fetching the user data
	fetchUserData(elem);
}());