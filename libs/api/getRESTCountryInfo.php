<?php

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);
	$apiKey = "";
	$url='http://api.geonames.org/countryInfoJSON?username=' . $apiKey;

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $url);

	$result = curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result, true);

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

	// Extract only countryName and countryCode from the data
	$extractedData = [];
	foreach ($decode['geonames'] as $entry) {
		$extractedData[] = [
			'countryName' => $entry['countryName'],
			'countryCode' => $entry['countryCode']
		];
	}

	// Sort the extracted data by countryName
	usort($extractedData, function ($a, $b) {
		return strcmp($a['countryName'], $b['countryName']);
	});

	$output['data'] = $extractedData;

	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output);

?>
