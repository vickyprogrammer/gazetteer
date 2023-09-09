<?php
// Turn on error reporting
ini_set('display_errors', 'On');
error_reporting(E_ALL);

// Start execution timer
$executionStartTime = microtime(true);

// API key for the weather service
$apiKey = "";

// Construct the API URL
$lat = $_REQUEST['lat'];
$lng = $_REQUEST['lng'];
$url = "https://api.openweathermap.org/data/2.5/onecall?lat=$lat&lon=$lng&appid=$apiKey";

// Initialize a cURL session
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

// Execute the cURL request
$result = curl_exec($ch);

// Close the cURL session
curl_close($ch);

// Decode the JSON response
$weatherData = json_decode($result, true);

// Prepare the response data
$output = [
    'status' => [
        'code' => "200",
        'name' => "ok",
        'description' => "success",
        'returnedIn' => intval((microtime(true) - $executionStartTime) * 1000) . " ms"
    ],
    'data' => $weatherData
];

// Set response headers
header('Content-Type: application/json; charset=UTF-8');

// Output the JSON response
echo json_encode($output);
?>