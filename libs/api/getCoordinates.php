<?php
// Construct the API URL for the first API
$url1 = "../js/data/countryBorders.json";

$jsonData = file_get_contents($url1);
$data1 = json_decode($jsonData, true);

// Construct the API URL for the second API
$country = urlencode($_REQUEST['country']);
$url2 = 'https://geocode.maps.co/search?q=' . $country;

$ch = curl_init($url2);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$data2 = json_decode($response, true);

// Process data from the first API
$filteredOutput = [];
if ($data1 && isset($data1['features'])) {
    $filterIsoA2 = isset($_REQUEST['country']) ? $_REQUEST['country'] : '';

    foreach ($data1['features'] as $feature) {
        if (isset($feature['properties']['iso_a2']) && isset($feature['geometry'])) {
            $iso_a2 = $feature['properties']['iso_a2'];
            $geometry = $feature['geometry'];

            if ($iso_a2 === $filterIsoA2 || $filterIsoA2 === '') {
                $filteredOutput[] = [
                    'geometry' => $geometry
                ];
            }
        }
    }
}

// Process data from the second API
$result = [];
if (is_array($data2) && count($data2) > 0) {
    $firstPlace = $data2[0];

    if (isset($firstPlace['place_id']) && isset($firstPlace['lat']) && isset($firstPlace['lon'])) {
        $result = [
            'place_id' => $firstPlace['place_id'],
            'lat' => $firstPlace['lat'],
            'lon' => $firstPlace['lon']
        ];
    }
}

// Combine the results into a single response
$combinedResponse = [
'data' => [
    'status' => 200,
    'description' => 'Success',
    'name' => 'ok',
    'time' => date('Y-m-d H:i:s'),
    'api1_data' => $filteredOutput,
    'api2_data' => $result
    ]
];

// Set response headers and output the combined response
http_response_code(200);
header('Content-Type: application/json');
echo json_encode($combinedResponse, JSON_PRETTY_PRINT);
?>