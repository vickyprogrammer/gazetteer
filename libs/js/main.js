// SET GLOBAL VARIABLES START
var geoselection;
let cityData; // Declare a variable to store the city data
let airportData; // Declare a variable to store the airports data
let universityData; // Declare a variable to store the university data
let mountainData; // Declare a variable to store the refugee camp data
let markers = []; // Array to store markers
let selectedLatitude;
let selectedLongitude;
let selectedCountry;
let selectedOption;
var selectedOption3 = "";

var airportLayer,cityLayer,universityLayer,refugeeLayer;
// SET GLOBAL VARIABLES END

// ******************************** MAP GENERAL CONFIGURATION STARTS ************************************
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


var myStyle = {
    color: "#0043FF",
    weight: 4,
    opacity: 0.65,
};

function getMap(lat, lng) {
    map.setView([lat, lng]);
}

// ******************************** MAP GENERAL CONFIGURATION ENDS ************************************



//Select Function to load all
const countrySelect = document.getElementById("countrySelect");
var loadingIndicator = document.getElementById("loadingIndicator");
countrySelect.addEventListener("change", function() {
loadingIndicator.style.display = "block"; // Show loading indicator
    selectedOption = countrySelect.value;
    selectedCountry = countrySelect.options[countrySelect.selectedIndex].text;

    //Remove Borders and Markers on Select
    geoselection.remove();
    airports.clearLayers();
    cities.clearLayers();
    universities.clearLayers();
    mountains.clearLayers();
    //Get Borders on Select
    getCountryBorders(selectedOption);
    getCountryInfo(selectedOption);
    
    //Load Markers on Select
    getCountryCities(selectedOption);
    getCountryAirports(selectedOption);
    getCountryUniversities(selectedOption);
    getCountryMountains(selectedOption);
   
});


// ******************************** COUNTRY LIST AND BORDERS START ************************************

const xhrNew = new XMLHttpRequest();
xhrNew.onreadystatechange = function() {
    if (xhrNew.readyState === XMLHttpRequest.DONE) {
        if (xhrNew.status === 200) {
			loadingIndicator.style.display = "block"; // Show loading indicator
            const response = JSON.parse(xhrNew.responseText);
           // const entry = ;
            for (const entry of response.data) {
            const option = document.createElement("option");
            option.value = entry.countryCode;
            option.textContent = entry.countryName;
            countrySelect.appendChild(option);
    }
            updateSelectedCountry();
        } else {
            console.error("Error fetching data");
        }
    }
};

xhrNew.open("GET", "libs/api/getRESTCountryInfo.php", true);
xhrNew.send();





// Update Country Function
function updateSelectedCountry() {
    navigator.geolocation.getCurrentPosition(function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        var apiUrl = 'libs/api/getCurrentCountry.php?lat=' + latitude + '&lng=' + longitude;
        var xhr = new XMLHttpRequest();

        // Configure the AJAX request
        xhr.open("GET", apiUrl, true);

        // Set up a callback function to handle the response
        xhr.onreadystatechange = function () {
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
                        const countrySelect = document.getElementById("countrySelect"); // Assuming you have an element with id "countrySelect"

                        // Clear the previous selection
                        const previousSelectedOption = countrySelect.querySelector('option[selected]');
                        if (previousSelectedOption) {
                            previousSelectedOption.removeAttribute('selected');
                        }

                        // Set the new option as selected
                        const newOption = countrySelect.querySelector('option[value="' + currentData.countryCode + '"]');
                        if (newOption) {
                            newOption.setAttribute('selected', 'selected');
                        }

                        selectedOption = currentData.countryCode;
                        selectedCountry = currentData.countryName;
                        getCountryBorders(selectedOption);
                        getCountryInfo(selectedOption);

                        // MARKERS
                        getCountryCities(selectedOption);
                        getCountryAirports(selectedOption);
                        getCountryUniversities(selectedOption);
                        getCountryMountains(selectedOption);
                        
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



 
//Borders Function
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
                if (result.data.name === "ok" && result.data.api1_data[0] !== undefined) {
                    selectedOption3 = result.data.api1_data[0].iso_a3;
                    var coordinateData = result.data.api1_data[0].geometry;
                    selectedLatitude = result.data.api2_data.lat;
                    selectedLongitude = result.data.api2_data.lon;
                    geoselection = L.geoJSON([coordinateData], {
                        style: myStyle,
                    }).addTo(map);
                    map.fitBounds(geoselection.getBounds());
                } else {
                    alert("No borders available for the specified country. Please check back soon..");
                }
            } else {
               // console.log(JSON.stringify(xhr));
               // console.log(JSON.stringify(xhr.statusText));
               // console.log(JSON.stringify(xhr.status));
            }
        }
    };

    xhr.send();
}
// ******************************** COUNTRY LIST AND BORDERS END ************************************


// ******************************** GET MODAL INFORMATION FUNCTIONS START ************************************

//Get Country Information Modal
var currencyfetch;
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
                    var population = countryInfo.population;
                    currencyfetch = countryInfo.currencyCode;
                    document.getElementById("countryName").textContent =
                        countryInfo.countryName + " | Country Information";
                    document.getElementById("countryContinent").textContent =
                        countryInfo.continentName;
                    document.getElementById("countryCapital").textContent =
                        countryInfo.capital;
                    document.getElementById("countryPopulation").textContent =
                        formatNumberWithCommas(population);
                    document.getElementById("countryLanguage").textContent =
                        countryInfo.languages;
                    document.getElementById("countryCurrency").textContent =
                        countryInfo.currencyCode;
                    document.getElementById("countryArea").textContent =
                        formatNumberWithCommas(countryInfo.areaInSqKm)+"sqm";
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

//Function to format numbers
function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
                    document.getElementById("weatherTitle").innerHTML = selectedCountry +
                        " | Weather Information";
                        var d = response.data;
        
                       // $('#weatherModalLabel').html(d.location + ", " + d.country);
                        
                        $('#todayConditions').html(d.daily[0].weather[0].main);
                        $('#todayIcon').attr("src", 'https://openweathermap.org/img/wn/' +
                            d.daily[0].weather[0].icon + '@2x.png');
                        $('#todayMaxTemp').html(kelvinToCelsius(d.daily[0].temp.max));
                        $('#todayMinTemp').html(kelvinToCelsius(d.daily[0].temp.min));

                        $('#day1Date').text(convertUnixDate(d.daily[1].dt));
                        $('#day1Icon').attr("src", 'https://openweathermap.org/img/wn/' +
                            d.daily[1].weather[0].icon + '.png');
                        $('#day1MinTemp').text(kelvinToCelsius(d.daily[1].temp.min));
                        $('#day1MaxTemp').text(kelvinToCelsius(d.daily[1].temp.max));
                        
                        $('#day2Date').text(convertUnixDate(d.daily[2].dt));
                        $('#day2Icon').attr("src", 'https://openweathermap.org/img/wn/' +
                            d.daily[2].weather[0].icon + '.png');
                        $('#day2MinTemp').text(kelvinToCelsius(d.daily[2].temp.min));
                        $('#day2MaxTemp').text(kelvinToCelsius(d.daily[2].temp.max));
                        
                        $('#lastUpdated').text("Source: Openweather.org");
                        
                         // Function to convert Kelvin to Celsius
                    function kelvinToCelsius(kelvin) {
                        return (kelvin - 273.15).toFixed();
                    }
                   
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
                document.getElementById("newsTitle").innerHTML = selectedCountry +
                        " | Top News";
                // Check if the response contains data
                if (response && response.data) {
                    var newsInfo = response.data.results;

                    // Loop through the news articles and create a table
                    var tableHtml = "";
                    for (var i = 0; i < newsInfo.length; i++) {
                        var newsArticle = newsInfo[i];
                       if(newsArticle.image_url===null){
                          var imagesurl = "libs/images/noimage.jpeg";
                       } else{
                          var imagesurlunclean = newsArticle.image_url;
                           imagesurl = imagesurlunclean.replace(/\/$/, '');
                           
                       }
                       tableHtml += '<table class="table table-borderless">';
                       tableHtml +=   '<tr>';
                       tableHtml +=     '<td rowspan="2" width="50%">';
                       tableHtml +=      '<img class="img-fluid rounded" src="' + imagesurl + '" alt="" title="">';
                       tableHtml +=    '</td>';
                       tableHtml +=  '<td>';
                       tableHtml +=       '<a href="' + newsArticle.link + '" target="_blank">' + newsArticle.title + '</a>';
                       tableHtml +=    '</td>';
                       tableHtml +=   '</tr>';
                       tableHtml +=   '<tr>';          
                       tableHtml +=     '<td class="align-bottom pb-0">';
                       tableHtml +=      '<p class="fw-light fs-6 mb-1">' + newsArticle.source_id + '</p>';
                       tableHtml +=     '</td>';          
                       tableHtml +=  '</tr>';
                       tableHtml +=  '</table>'
                       tableHtml +=  '<hr>';
                    }


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
                    document.getElementById("wikiTitle").innerHTML = selectedCountry +
                        " | Wikipedia";
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




//Get Public Holiday Information Modal
function getCountryHoliday(country) {
    var apiUrl = "libs/api/getPublicHolidays.php";

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
                    response.data.length > 0
                ) {
                    var holidayInfo = response.data;
                    document.getElementById("holidayTitle").innerHTML = selectedCountry +
                        " | Public Holidays";
                    // Loop through the news articles and create a table
                    var tableHtml = "<table class='table table-striped'><tbody>";

                    for (var i = 0; i < holidayInfo.length; i++) {
                        var holidayContent = holidayInfo[i];
                        tableHtml += "<tr>";
                        tableHtml += "<td>" + formatDate(holidayContent.date) + "</td>";
                        tableHtml += "<td>" + holidayContent.name + "</td>";
                        tableHtml += "</tr>";
                    }

                    tableHtml += "</tbody></table>";

                    // Insert the table into the designated HTML element
                    var tableContainer = document.getElementById("tableholiday");
                    tableContainer.innerHTML = tableHtml;
                } else {
                    console.log("No public holiday available for the specified country.");
                }
            } else {
                console.log("Error fetching data. Status code:", xhr.status);
            }
        }
    };
    // Send the AJAX request
    xhr.send();
}

// Function for Exchange Rates
function getCountryCurrency(countrysel) {
    getCountryInfo(selectedOption);
    var apiUrl = "libs/api/getExchangeRate.php";
    var xhr = new XMLHttpRequest();
    var url = apiUrl + "?country=" + encodeURIComponent(countrysel);
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                loadingIndicator.style.display = "block"; // Show loading indicator
                var response = JSON.parse(xhr.responseText);
                document.getElementById("curTitle").innerHTML = selectedCountry +
                        " | Currency Exchange";
                const exchangeRate = document.getElementById("exchangeRate");
                if (response && response.data && response.data.rates) {
                    const exchangeRates = response.data.rates;
                     for (const currency in exchangeRates) {
                          if (exchangeRates.hasOwnProperty(currency)) {
                              const option = document.createElement("option");
                                option.value = `${exchangeRates[currency]}`;
                                option.textContent = `${currency}`;
                                // Check if the currency is equal to country and set 'selected' attribute
                            if (currency === currencyfetch) {
                              option.selected = true;
                            }
                                exchangeRate.appendChild(option);
                          }
                        }
                        calcResult();
                } else {
                    console.log("No currency available for the specified country.");
                }
            } else {
                console.log("Error fetching data. Status code:", xhr.status);
            }
        }
    };
   
    xhr.send();
}


      //============================================= OTHER FUNCTIONS USED=========================================================
function convertUnixDate(unixdate){
// Unix timestamp: 1694114040
const unixTimestamp = unixdate;

// Create a Date object from the Unix timestamp
const date = new Date(unixTimestamp * 1000); // Multiply by 1000 to convert from seconds to milliseconds

// Define arrays for the day names and month names
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Get the day of the week (0-6)
const dayOfWeek = date.getUTCDay();

// Get the day of the month (1-31)
const dayOfMonth = date.getUTCDate();

// Get the formatted day string, including "st", "nd", "rd", or "th" suffix
function getDayWithSuffix(day) {
  if (day >= 11 && day <= 13) {
    return day + 'th';
  }
  switch (day % 10) {
    case 1:
      return day + 'st';
    case 2:
      return day + 'nd';
    case 3:
      return day + 'rd';
    default:
      return day + 'th';
  }
}

// Format the date string
const formattedDate = `${dayNames[dayOfWeek]} ${getDayWithSuffix(dayOfMonth)}`;
return formattedDate;

}



$('#fromAmount').on('keyup', function () {
  calcResult();
})

$('#fromAmount').on('change', function () {
  calcResult();
})

$('#exchangeRate').on('change', function () {
  calcResult();
})

$('#currencyInformation').on('show.bs.modal', function () {
  calcResult();
})


function calcResult() {
  $('#toAmount').val(numeral($('#fromAmount').val() * $('#exchangeRate').val()).format("0,0.00"));
}





// ************************************** GET MODAL INFORMATION FUNCTIONS END *******************************************




// ************************************** MAP MARKERS FUNCTIONS START *************************************************


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
                     addMarkersToClusterCity(cityData);
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
                    addMarkersToClusterAirport(airportData);
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

//Get Map Markers for Universities
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
                    addMarkersToClusterUniversity(universityData);
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


//Get Map Markers for Mountain
function getCountryMountains(country) {
    var xhr = new XMLHttpRequest();
    var url = "libs/api/markers/getMapMountains.php";
    var params = "country=" + country;

    xhr.open("GET", url + "?" + params, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
				loadingIndicator.style.display = "block"; // Show loading indicator
                var result = JSON.parse(xhr.responseText);
                if (result.status.name === "ok") {
                    mountainData = result.data.geonames; // Store the city data
                    addMarkersToClusterMountain(mountainData);
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


// ************************************** MAP MARKERS FUNCTIONS END **********************************************





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
            
            $("#countryInformation").modal("show");

            $(".close").click(function() {
                $("#countryInformation").modal("hide");
            });
        },
    }, ],
}).addTo(map);


// Show Public Holiday Information Button

L.easyButton({
    position: "topleft",
    id: "pbBtn",
    states: [{
        icon: "fa-calendar",
        stateName: "unchecked",
        title: "Show Public Holiday Information",
        onClick: function(btn, map) {
            getCountryHoliday(selectedOption);
            $("#phInformation").modal("show");

            $(".close").click(function() {
                $("#phInformation").modal("hide");
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
    id: "railway-view-button",
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


//Show Wikipedia Button

L.easyButton({
    position: "topleft",
    id: "wikiBtn",
    states: [{
        icon: "fab fa-wikipedia-w",
        stateName: "unchecked",
        title: "Show Country Wikipedia",
        onClick: function(btn, map) {
            getCountryWiki(selectedCountry);
            $("#showWikipedia").modal("show");

            $(".close").click(function() {
                $("#showWikipedia").modal("hide");
            });
        },
    }, ],
}).addTo(map);



//Show Location Button

L.easyButton({
    position: "topright",
    id: "locationBtn",
    states: [{
        icon: "fa-location-arrow",
        stateName: "unchecked",
        title: "Get Current Location",
        onClick: function(btn, map) {
        window.location = window.location;
        },
    }, ],
}).addTo(map);



//Show Currency Button

L.easyButton({
    position: "topleft",
    id: "currencyBtn",
    states: [{
        icon: "fa fa-gbp",
        stateName: "unchecked",
        title: "Get Currency Information",
        onClick: function(btn, map) {
            getCountryCurrency(selectedOption3);
            $("#currencyInformation").modal("show");

            $(".close").click(function() {
                $("#currencyInformation").modal("hide");
            });
        },
    }, ],
}).addTo(map);


// ******************************************* MAP BUTTONS END *************************************************



// ******************************************* MAP MARKERS START *************************************************
var airports = L.markerClusterGroup({
      polygonOptions: {
        fillColor: '#fff',
        color: '#000',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5
      }}).addTo(map);

var cities = L.markerClusterGroup({
      polygonOptions: {
        fillColor: '#fff',
        color: '#000',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5
      }}).addTo(map);
      
var universities = L.markerClusterGroup({
      polygonOptions: {
        fillColor: '#fff',
        color: '#000',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5
      }}).addTo(map);
      
var mountains = L.markerClusterGroup({
      polygonOptions: {
        fillColor: '#fff',
        color: '#000',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5
      }}).addTo(map);

var overlays = {
  "Airports": airports,
  "Cities": cities,
  "Universities": universities,
  "Mountains": mountains
};

var layerControl = L.control.layers(basemaps, overlays).addTo(map);

var airportIcon = L.ExtraMarkers.icon({
  prefix: 'fa',
  icon: 'fa-plane',
  iconColor: 'black',
  markerColor: 'white',
  shape: 'square'
});

var cityIcon = L.ExtraMarkers.icon({
  prefix: 'fa',
  icon: 'fa-city',
  markerColor: 'green',
  shape: 'square'
});

var universityIcon = L.ExtraMarkers.icon({
  prefix: 'fa',
  icon: 'fa-university',
  markerColor: 'blue',
  shape: 'square'
});

var mountainIcon = L.ExtraMarkers.icon({
  prefix: 'fa',
  icon: 'fa-mountain',
  markerColor: 'red',
  shape: 'square'
});


// City Markers with Cluster Group
// Function to add markers to the cluster group
function addMarkersToClusterCity(cityData) {
    if (cityData) {
        // Loop through city data and create markers
        for (var i = 0; i < cityData.length; i++) {
            var city = cityData[i];
            var lat = parseFloat(city.lat);
            var lng = parseFloat(city.lng);
            var population = city.population.toLocaleString();
            var cityName = city.name;

             L.marker([lat, lng], {icon: cityIcon})
            .bindTooltip("<div class='col text-center'><strong>" + cityName + "</strong><br><i>(" + population + ")</i></div>", {direction: 'top', sticky: true})
            .addTo(cities);
        }
      
    }
}




function addMarkersToClusterAirport(airportData) {
    if (airportData) {
        // Loop through city data and create markers
        for (var i = 0; i < airportData.length; i++) {
            var airport = airportData[i];
            var lat = parseFloat(airport.lat);
            var lng = parseFloat(airport.lng);
            var aiportName = airport.name;
            L.marker([lat, lng], {icon: airportIcon})
            .bindTooltip(aiportName, {direction: 'top', sticky: true})
            .addTo(airports);
          
        }
      
    }
}





// University Markers with Cluster Group
// Function to add markers to the cluster group
function addMarkersToClusterUniversity(universityData) {
    if (universityData) {
        // Loop through city data and create markers
        for (var i = 0; i < universityData.length; i++) {
            var university = universityData[i];
            var lat = parseFloat(university.lat);
            var lng = parseFloat(university.lng);
            var universityName = university.name;
            L.marker([lat, lng], {icon: universityIcon})
            .bindTooltip(universityName, {direction: 'top', sticky: true})
            .addTo(universities);        
          
        }
      
    }
}




// Mountain Markers with Cluster Group
// Function to add markers to the cluster group
function addMarkersToClusterMountain(mountainData) {
    if (mountainData) {
        // Loop through city data and create markers
        for (var i = 0; i < mountainData.length; i++) {
            var mountain = mountainData[i];
            var lat = parseFloat(mountain.lat);
            var lng = parseFloat(mountain.lng);
            var mountainName = mountain.name;
            L.marker([lat, lng], {icon: mountainIcon})
            .bindTooltip(mountainName, {direction: 'top', sticky: true})
            .addTo(mountains);
        }
    }
}



// ******************************************* MAP MARKERS END *************************************************


