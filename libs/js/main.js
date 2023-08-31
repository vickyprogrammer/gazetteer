
// SET GLOBAL VARIABLES START
    var geoselection;
//let borders;
let countries;
let cityData; // Declare a variable to store the city data
let airportData; // Declare a variable to store the airports data
let universityData; // Declare a variable to store the university data
let refugeeData; // Declare a variable to store the refugee camp data
let markers = []; // Array to store markers
let selectedAlphaTwo;
let selectedLatitude;
let selectedLongitude;
let selectedCountry;
let selectedOption;

var latx, lngx;
// SET GLOBAL VARIABLES END

//Initialize Map
var streets = L.tileLayer(
    "https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=RO09eeNd1jxvwuN30AhMZMAeI0A0BH6c69iQefGH3fDgwzbEhjg0eFTDFKQfdG4O", {
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
    }
);

var satellite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    }
);
var basemaps = {
    Streets: streets,
    Satellite: satellite,
};

var map = L.map("map", {
    layers: [streets],
});

var layerControl = L.control.layers(basemaps).addTo(map);

var myStyle = {
    color: "#ff7800",
    weight: 2,
    opacity: 0.65,
};

function getMap(lat, lng) {
    map.setView([lat, lng]);
}


    const countrySelect = document.getElementById("countrySelect");
    var loadingIndicator = document.getElementById("loadingIndicator");
countrySelect.addEventListener("change", function() {
    loadingIndicator.style.display = "block"; // Show loading indicator
    selectedOption = countrySelect.value;
    selectedCountry = countrySelect.options[countrySelect.selectedIndex].text;
    console.log("Selected Country Text:", selectedCountry);
    console.log("Selected Country Value:", selectedOption);

    if (geoselection) {
        geoselection.remove();
    }
    removeMarkers();
    getCountryBorders(selectedOption);

    //MARKERS
    getCountryCities(selectedOption);
    getCountryAirports(selectedOption);
    getCountryUniversities(selectedOption);
    getCountryRefugeeC(selectedOption);
});


function populateCountrySelect(data) {
    for (const entry of data) {
        const option = document.createElement("option");
        option.value = entry.countryCode;
        option.textContent = entry.countryName;
        countrySelect.appendChild(option);
    }
}


const xhrNew = new XMLHttpRequest();
xhrNew.onreadystatechange = function() {
    if (xhrNew.readyState === XMLHttpRequest.DONE) {
        if (xhrNew.status === 200) {
			loadingIndicator.style.display = "block"; // Show loading indicator
            const response = JSON.parse(xhrNew.responseText);
            populateCountrySelect(response.data);
            updateSelectedCountry();
        } else {
            console.error("Error fetching data");
        }
    }
};

xhrNew.open("GET", "libs/api/getRESTCountryInfo.php", true);
xhrNew.send();



function updateSelectedCountry() {
    navigator.geolocation.getCurrentPosition(function(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        var apiUrl = 'libs/api/getCurrentCountry.php?lat=' + latitude + '&lng=' + longitude;
        var xhr = new XMLHttpRequest();

        // Configure the AJAX request
        xhr.open("GET", apiUrl, true);
        var currentCountryCode;
        // Set up a callback function to handle the response
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
					loadingIndicator.style.display = "block"; // Show loading indicator
                    // Parse the JSON response
                    var response = JSON.parse(xhr.responseText);

                    // Check if the response contains data
                    if (
                        response &&
                        response.data
                    ) {
                        var currentData = response.data;

                        const defaultOption = countrySelect.querySelector('option[selected]');
                        defaultOption.textContent = currentData.countryName; // Use backticks
                        defaultOption.value = currentData.countryCode;
                        selectedOption = defaultOption.value;
                        selectedCountry = defaultOption.textContent;
                        //console.log(selectedOption);
                        getCountryBorders(selectedOption);
                        //MARKERS
                        getCountryCities(selectedOption);
                        getCountryAirports(selectedOption);
                        getCountryUniversities(selectedOption);
                        getCountryRefugeeC(selectedOption);
                    } else {
                        console.log(
                            "No information available for the specified country."
                        );
                    }
                } else {
                    console.log("Error fetching data. Status code:", xhr.status);
                }
            }
        };

        xhr.send();

    });
}




function getCountryBorders(country) {
    var xhr = new XMLHttpRequest();
    var url = "libs/api/getCoordinates.php";
    var params = "country=" + country;

    xhr.open("GET", url + "?" + params, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
				loadingIndicator.style.display = "block"; // Show loading indicator
                var result = JSON.parse(xhr.responseText);
                if (result.data.name === "ok") {
                    var coordinateData = result.data.api1_data[0].geometry; // Store the city data
                    selectedLatitude = result.data.api2_data.lat;
                    selectedLongitude = result.data.api2_data.lon;
                    geoselection = L.geoJSON([coordinateData], {
                        style: myStyle,
                    }).addTo(map);
                    map.fitBounds(geoselection.getBounds());
                }
            } else {
                console.log(JSON.stringify(xhr));
                console.log(JSON.stringify(xhr.statusText));
                console.log(JSON.stringify(xhr.status));
            }
        }
    };

    xhr.send();
}




// ******************************** GET MODAL INFORMATION FUNCTIONS START ************************************

//Get Country Information Modal

function getCountryInfo(country) {
    var apiUrl = "libs/api/getCountryInfo.php";

    // Create a new XMLHttpRequest object
    var xhr = new XMLHttpRequest();

    // Construct the URL with the country parameter
    var url = apiUrl + "?country=" + encodeURIComponent(country);

    // Configure the AJAX request
    xhr.open("GET", url, true);

    // Set up a callback function to handle the response
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
				loadingIndicator.style.display = "block"; // Show loading indicator
                // Parse the JSON response
                var response = JSON.parse(xhr.responseText);

                // Check if the response contains data
                if (
                    response &&
                    response.data &&
                    response.data.geonames &&
                    response.data.geonames.length > 0
                ) {
                    var countryInfo = response.data.geonames[0];

                    document.getElementById("countryName").textContent =
                        countryInfo.countryName + " | Country Information";
                    document.getElementById("countryContinent").textContent =
                        countryInfo.continentName;
                    document.getElementById("countryCapital").textContent =
                        countryInfo.capital;
                    document.getElementById("countryPopulation").textContent =
                        countryInfo.population;
                    document.getElementById("countryLanguage").textContent =
                        countryInfo.languages;
                    document.getElementById("countryCurrency").textContent =
                        countryInfo.currencyCode;
                    document.getElementById("countryArea").textContent =
                        countryInfo.areaInSqKm;
                } else {
                    console.log(
                        "No information available for the specified country."
                    );
                }
            } else {
                console.log("Error fetching data. Status code:", xhr.status);
            }
        }
    };

    // Send the AJAX request
    xhr.send();
}



//Get Timezone Information Modal

function getCountryTimezone(lat, lng) {
    var apiUrl = "libs/api/getTimezone.php";

    // Create a new XMLHttpRequest object
    var xhr = new XMLHttpRequest();

    var url =
        apiUrl +
        "?lat=" +
        encodeURIComponent(lat) +
        "&lng=" +
        encodeURIComponent(lng);

    // Configure the AJAX request
    xhr.open("GET", url, true);

    // Set up a callback function to handle the response
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
				loadingIndicator.style.display = "block"; // Show loading indicator
                // Parse the JSON response
                var response = JSON.parse(xhr.responseText);

                // Check if the response contains data
                if (response && response.data) {
                    var timezoneInfo = response.data;
                    document.getElementById("timezoneTitle").innerHTML =
                        timezoneInfo.countryName + " | Timezone Information";
                    document.getElementById("tzId").innerHTML =
                        timezoneInfo.timezoneId;
                    document.getElementById("tztime").innerHTML =
                        timezoneInfo.time;
                    document.getElementById("tzsunrise").innerHTML =
                        timezoneInfo.sunrise;
                    document.getElementById("tzsunset").innerHTML =
                        timezoneInfo.sunset;
                    document.getElementById("tzgmtoffset").innerHTML =
                        timezoneInfo.gmtOffset;
                    document.getElementById("tzdstoffset").innerHTML =
                        timezoneInfo.dstOffset;
                } else {
                    console.log(
                        "No information available for the specified country timezone."
                    );
                }
            } else {
                console.log("Error fetching data. Status code:", xhr.status);
            }
        }
    };
    // Send the AJAX request
    xhr.send();
}



//Get Weather Information Modal
function getCountryWeather(lat, lng) {
    var apiUrl = "libs/api/getWeather.php";

    // Create a new XMLHttpRequest object
    var xhr = new XMLHttpRequest();

    var url =
        apiUrl +
        "?lat=" +
        encodeURIComponent(lat) +
        "&lng=" +
        encodeURIComponent(lng);

    // Configure the AJAX request
    xhr.open("GET", url, true);

    // Set up a callback function to handle the response
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
				loadingIndicator.style.display = "block"; // Show loading indicator
                // Parse the JSON response
                var response = JSON.parse(xhr.responseText);

                // Check if the response contains data
                if (response && response.data) {
                    var weatherInfo = response.data.daily;
                    document.getElementById("weatherTitle").innerHTML =
                        "Weather Information";
                    // Loop through the daily weather data and create a table
                    var tableHtml =
                        "<table class='table table-striped' ><thead><tr><th>Date</th><th>Min </th><th>Max</th><th> </th></tr></thead><tbody>";

                    for (var i = 0; i < weatherInfo.length; i++) {
                        var dailyWeather = weatherInfo[i];
                        var currentDate = new Date();
                        var currentDay = currentDate.getDate();

                        var displayDate = new Date(dailyWeather.dt * 1000);
                        var displayDay = displayDate.getDate();

                        var dateText = "";
                        if (displayDay === currentDay) {
                            dateText = "Today";
                        } else if (displayDay === currentDay + 1) {
                            dateText = "Tomorrow";
                        } else {
                            dateText = displayDate.toDateString();
                        }
                        tableHtml += "<tr>";
                        tableHtml += "<td>" + dateText + "</td>";
                        tableHtml +=
                            "<td>" +
                            Math.round(kelvinToCelsius(dailyWeather.temp.min)) +
                            " °C</td>";
                        tableHtml +=
                            "<td>" +
                            Math.round(kelvinToCelsius(dailyWeather.temp.max)) +
                            " °C</td>";
                        tableHtml +=
                            '<td><img src="http://openweathermap.org/img/w/' +
                            dailyWeather.weather[0].icon +
                            '.png" alt="' +
                            dailyWeather.weather[0].description +
                            '"></td>';
                        tableHtml += "</tr>";
                    }

                    tableHtml += "</tbody></table>";
                    // Function to convert Kelvin to Celsius
                    function kelvinToCelsius(kelvin) {
                        return (kelvin - 273.15).toFixed(2);
                    }
                    // Insert the table into the designated HTML element
                    var tableContainer = document.getElementById(
                        "tableContainer"
                    );
                    tableContainer.innerHTML = tableHtml;
                } else {
                    console.log(
                        "No information available for the specified country weather."
                    );
                }
            } else {
                console.log("Error fetching data. Status code:", xhr.status);
            }
        }
    };
    // Send the AJAX request
    xhr.send();
}


//Get Country News Modal
function getCountryNews(country) {
    var apiUrl = "libs/api/getNews.php";

    // Create a new XMLHttpRequest object
    var xhr = new XMLHttpRequest();

    var url = apiUrl + "?country=" + encodeURIComponent(country);

    // Configure the AJAX request
    xhr.open("GET", url, true);

    // Set up a callback function to handle the response
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
				loadingIndicator.style.display = "block"; // Show loading indicator
                // Parse the JSON response
                var response = JSON.parse(xhr.responseText);

                // Check if the response contains data
                if (response && response.data) {
                    var newsInfo = response.data.articles;

                    // Loop through the news articles and create a table
                    var tableHtml = "<table><tbody>";

                    for (var i = 0; i < newsInfo.length; i++) {
                        var newsArticle = newsInfo[i];
                        tableHtml += "<tr>";
                        tableHtml +=
                            '<td><a href="' +
                            newsArticle.url +
                            '" target="_blank">' +
                            newsArticle.title +
                            "</a><br>";
                        tableHtml +=
                            '<span style="color: grey;" ><em>' +
                            formatDate(newsArticle.publishedAt) +
                            "</em></span><hr></td>";
                        tableHtml += "</tr>";
                    }

                    tableHtml += "</tbody></table>";

                    // Insert the table into the designated HTML element
                    var tableContainer = document.getElementById("tablenews");
                    tableContainer.innerHTML = tableHtml;
                } else {
                    console.log(
                        "No news information available for the specified country."
                    );
                }
            } else {
                console.log("Error fetching data. Status code:", xhr.status);
            }
        }
    };
    // Send the AJAX request
    xhr.send();
}

// Function to format the date
function formatDate(dateString) {
    var date = new Date(dateString);
    return date.toDateString();
}

//Get Wikipedia Information Modal
function getCountryWiki(country) {
    var apiUrl = "libs/api/getWiki.php";

    // Create a new XMLHttpRequest object
    var xhr = new XMLHttpRequest();

    var url = apiUrl + "?country=" + encodeURIComponent(country);

    // Configure the AJAX request
    xhr.open("GET", url, true);

    // Set up a callback function to handle the response
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
				loadingIndicator.style.display = "block"; // Show loading indicator
                // Parse the JSON response
                var response = JSON.parse(xhr.responseText);

                // Check if the response contains data
                if (
                    response &&
                    response.data &&
                    response.data.geonames &&
                    response.data.geonames.length > 0
                ) {
                    var wikiInfo = response.data.geonames;

                    // Loop through the news articles and create a table
                    var tableHtml = "<table><tbody>";

                    for (var i = 0; i < wikiInfo.length; i++) {
                        var wikiContent = wikiInfo[i];
                        tableHtml += "<tr>";
                        tableHtml += "<td>" + wikiContent.summary + "<br>";
                        tableHtml +=
                            '<a href="https://' +
                            wikiContent.wikipediaUrl +
                            '" target="_blank">Read more</a><br>';
                        tableHtml +=
                            '<span style="color: grey;" ><em>' +
                            wikiContent.title +
                            "</em></span><hr></td>";
                        tableHtml += "</tr>";
                    }

                    tableHtml += "</tbody></table>";

                    // Insert the table into the designated HTML element
                    var tableContainer = document.getElementById("tablewiki");
                    tableContainer.innerHTML = tableHtml;
                } else {
                    console.log("No wiki available for the specified country.");
                }
            } else {
                console.log("Error fetching data. Status code:", xhr.status);
            }
        }
    };
    // Send the AJAX request
    xhr.send();
}

// ************************************** GET MODAL INFORMATION FUNCTIONS END *******************************************




// ************************************** MAP MARKERS FUNCTIONS START *************************************************

// Remove existing markers from the map
function removeMarkers() {
    for (var i = 0; i < markers.length; i++) {
        map.removeLayer(markers[i]);
    }
    markers = []; // Clear the markers array
}


//Get Map Markers for Cities
function getCountryCities(country) {
    var xhr = new XMLHttpRequest();
    var url = "libs/api/markers/getMapCities.php";
    var params = "country=" + country;

    xhr.open("GET", url + "?" + params, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
				loadingIndicator.style.display = "block"; // Show loading indicator
                var result = JSON.parse(xhr.responseText);
                if (result.status.name === "ok") {
                    cityData = result.data.geonames; // Store the city data
                }
            } else {
                console.log(JSON.stringify(xhr));
                console.log(JSON.stringify(xhr.statusText));
                console.log(JSON.stringify(xhr.status));
            }
        }
    };

    xhr.send();
}

//Get Map Markers for Airports
function getCountryAirports(country) {
    var xhr = new XMLHttpRequest();
    var url = "libs/api/markers/getMapAirports.php";
    var params = "country=" + country;

    xhr.open("GET", url + "?" + params, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
				loadingIndicator.style.display = "block"; // Show loading indicator
                var result = JSON.parse(xhr.responseText);
                if (result.status.name === "ok") {
                    airportData = result.data.geonames; // Store the city data
                }
            } else {
                console.log(JSON.stringify(xhr));
                console.log(JSON.stringify(xhr.statusText));
                console.log(JSON.stringify(xhr.status));
            }
        }
    };

    xhr.send();
}

//Get Map Markers for Refugee Universities
function getCountryUniversities(country) {
    var xhr = new XMLHttpRequest();
    var url = "libs/api/markers/getMapUniversities.php";
    var params = "country=" + country;

    xhr.open("GET", url + "?" + params, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
				loadingIndicator.style.display = "block"; // Show loading indicator
                var result = JSON.parse(xhr.responseText);
                if (result.status.name === "ok") {
                    universityData = result.data.geonames; // Store the city data
                }
            } else {
                console.log(JSON.stringify(xhr));
                console.log(JSON.stringify(xhr.statusText));
                console.log(JSON.stringify(xhr.status));
            }
        }
    };

    xhr.send();
}


//Get Map Markers for Refugee Camp
function getCountryRefugeeC(country) {
    var xhr = new XMLHttpRequest();
    var url = "libs/api/markers/getMapRefugeeC.php";
    var params = "country=" + country;

    xhr.open("GET", url + "?" + params, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
				loadingIndicator.style.display = "block"; // Show loading indicator
                var result = JSON.parse(xhr.responseText);
                if (result.status.name === "ok") {
                    refugeeData = result.data.geonames; // Store the city data
                }
            } else {
                console.log(JSON.stringify(xhr));
                console.log(JSON.stringify(xhr.statusText));
                console.log(JSON.stringify(xhr.status));
            }
        }
    };

    xhr.send();
}


// ************************************** MAP MARKERS FUNCTIONS END *************************************************





// ******************************************* MAP BUTTONS START *************************************************

// Show Country Information Button

L.easyButton({
    position: "topleft",
    id: "countryBtn",
    states: [{
        icon: "fa-info",
        stateName: "unchecked",
        title: "Show Country Information",
        onClick: function(btn, map) {
            getCountryInfo(selectedOption);
            $("#countryInformation").modal("show");

            $(".close").click(function() {
                $("#countryInformation").modal("hide");
            });
        },
    }, ],
}).addTo(map);


// Show Timezone Information Button

L.easyButton({
    position: "topleft",
    id: "timezoneBtn",
    states: [{
        icon: "fa-clock",
        stateName: "unchecked",
        title: "Show Timezone Information",
        onClick: function(btn, map) {
            getCountryTimezone(selectedLatitude, selectedLongitude);
            $("#timezoneInformation").modal("show");

            $(".close").click(function() {
                $("#timezoneInformation").modal("hide");
            });
        },
    }, ],
}).addTo(map);


// Show Weather Information Button

L.easyButton({
    position: "topleft",
    id: "weatherBtn",
    states: [{
        icon: "fa-solid fa-cloud-sun-rain",
        stateName: "unchecked",
        title: "Show Weather Information",
        onClick: function(btn, map) {
            getCountryWeather(selectedLatitude, selectedLongitude);
            $("#weatherInformation").modal("show");

            $(".close").click(function() {
                $("#weatherInformation").modal("hide");
            });
        },
    }, ],
}).addTo(map);


// Show News Button

L.easyButton({
    position: "topleft",
    id: "weatherBtn",
    states: [{
        icon: "fa-solid fa-newspaper",
        stateName: "unchecked",
        title: "Show News",
        onClick: function(btn, map) {
            getCountryNews(selectedOption);
            $("#newsInformation").modal("show");

            $(".close").click(function() {
                $("#newsInformation").modal("hide");
            });
        },
    }, ],
}).addTo(map);


// Show Cities Button

L.easyButton({
    position: "topright",
    id: "weatherBtn",
    states: [{
        icon: "fa-solid fa-city",
        stateName: "unchecked",
        title: "Show Cities",
        onClick: function(btn, map) {
            removeMarkers();
            var cityIcon = L.icon({
                iconUrl: "libs/images/icons/city.png",
                iconSize: [32, 32], // Adjust the icon size as needed
                iconAnchor: [16, 32], // Adjust the icon anchor point
                popupAnchor: [0, 0], // Adjust the popup anchor point
            });

            if (cityData) {
                for (var i = 0; i < cityData.length; i++) {
                    var city = cityData[i];
                    var lat = parseFloat(city.lat);
                    var lng = parseFloat(city.lng);
                    var population = city.population;
                    var cityName = city.name;

                    // Create a marker for each city
                    var marker = L.marker([lat, lng], {
                        icon: cityIcon,
                    }).addTo(map);
                    marker.bindPopup(
                        cityName + "<br>Population: " + population
                    );

                    markers.push(marker); // Add the marker to the markers array
                }
            }
        },
    }, ],
}).addTo(map);


// Show Airports Button


L.easyButton({
    position: "topright",
    id: "weatherBtn",
    states: [{
        icon: "fa-solid fa-plane-departure",
        stateName: "unchecked",
        title: "Show Airports",
        onClick: function(btn, map) {
            removeMarkers();
            var cityIcon = L.icon({
                iconUrl: "libs/images/icons/airport.png",
                iconSize: [32, 32], // Adjust the icon size as needed
                iconAnchor: [16, 32], // Adjust the icon anchor point
                popupAnchor: [0, 0], // Adjust the popup anchor point
            });

            if (airportData) {
                for (var i = 0; i < airportData.length; i++) {
                    var airport = airportData[i];
                    var lat = parseFloat(airport.lat);
                    var lng = parseFloat(airport.lng);
                    var aiportName = airport.name;

                    // Create a marker for each
                    var marker = L.marker([lat, lng], {
                        icon: cityIcon,
                    }).addTo(map);
                    marker.bindPopup(aiportName);

                    markers.push(marker); // Add the marker to the markers array
                }
            }
        },
    }, ],
}).addTo(map);


// Show Universities Button


L.easyButton({
    position: "topright",
    id: "weatherBtn",
    states: [{
        icon: "fa-solid fa-building-columns",
        stateName: "unchecked",
        title: "Show Universities",
        onClick: function(btn, map) {
            removeMarkers();
            var cityIcon = L.icon({
                iconUrl: "libs/images/icons/university.png",
                iconSize: [43, 43], // Adjust the icon size as needed
                iconAnchor: [16, 32], // Adjust the icon anchor point
                popupAnchor: [0, 0], // Adjust the popup anchor point
            });

            if (universityData) {
                for (var i = 0; i < universityData.length; i++) {
                    var university = universityData[i];
                    var lat = parseFloat(university.lat);
                    var lng = parseFloat(university.lng);
                    var universityName = university.name;

                    // Create a marker for each
                    var marker = L.marker([lat, lng], {
                        icon: cityIcon,
                    }).addTo(map);
                    marker.bindPopup(universityName);

                    markers.push(marker); // Add the marker to the markers array
                }
            }
        },
    }, ],
}).addTo(map);


// Show Refugee Camps Button


L.easyButton({
    position: "topright",
    id: "weatherBtn",
    states: [{
        icon: "fa-solid fa-hand-holding-heart",
        stateName: "unchecked",
        title: "Show Refugee Camps",
        onClick: function(btn, map) {
            removeMarkers();
            var cityIcon = L.icon({
                iconUrl: "libs/images/icons/charity.png",
                iconSize: [64, 64], // Adjust the icon size as needed
                iconAnchor: [16, 32], // Adjust the icon anchor point
                popupAnchor: [0, 0], // Adjust the popup anchor point
            });

            if (refugeeData) {
                for (var i = 0; i < refugeeData.length; i++) {
                    var refugee = refugeeData[i];
                    var lat = parseFloat(refugee.lat);
                    var lng = parseFloat(refugee.lng);
                    var refugeeName = refugee.name;

                    // Create a marker for each
                    var marker = L.marker([lat, lng], {
                        icon: cityIcon,
                    }).addTo(map);
                    marker.bindPopup(refugeeName);

                    markers.push(marker); // Add the marker to the markers array
                }
            }
        },
    }, ],
}).addTo(map);

// ******************************************* MAP BUTTONS END *************************************************
