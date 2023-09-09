<?php
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);
    $apiKey = ""; // Put API key
    $apiUrl = 'http://api.geonames.org/timezoneJSON?lat=' . $_REQUEST['lat'] . '&lng=' . $_REQUEST['lng'] . '&username=' . $apiKey;

    $curlHandle = curl_init();
    curl_setopt($curlHandle, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curlHandle, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curlHandle, CURLOPT_URL, $apiUrl);

    $apiResult = curl_exec($curlHandle);

    curl_close($curlHandle);

    $decodedResult = json_decode($apiResult, true);

    $outputData['status']['code'] = "200";
    $outputData['status']['name'] = "ok";
    $outputData['status']['description'] = "success";
    $outputData['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $outputData['data'] = $decodedResult;

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($outputData);
?>
