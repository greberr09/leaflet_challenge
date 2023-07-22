// ----------------------------------------------------------------
// Display earthquake data for the last seven days, all earthquake types, from the U.S. 
// Geological Survey.  See //https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php for
// more information about the different feed types available.  Data is available for the past hour,
// the past day, the past 7 days, and the past 30 days.  All are updated every 30 seconds.
// ----------------------------------------------------------------

// Store the USGS seven-day API endpoint as the query url.

const queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request then wait for response

d3.json(queryURL).then(function (data) {

  // Once server responds, call the createFeatures function to add data received to the map
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    // Create a layer group to hold the markers
    const markersLayer = L.layerGroup();

    // function to apply to each feature as it is encountered
    function onEachFeature(feature, layer) {

        function getColor(depth) {
          console.log("depth: " + depth);
    
          if (depth < 10) {
            return 'green';
          } else if (depth < 30) {
            return 'lightgreen';
          } else if (depth < 50) {
            return 'yellow'; 
          } else if (depth < 70) {
            return 'orange';
          } else { if (depth < 90) {
            return 'pink';
          } else {
            return 'red';
          }
        };
      };
    
        console.log("lng: " + feature.geometry.coordinates[1] + "lat: " + feature.geometry.coordinates[0] + "mag: " + feature.properties.mag );
          
        const marker = L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
          color: getColor(feature.geometry.coordinates[2]),
          fillColor: getColor(feature.geometry.coordinates[2]),
          fillOpacity: 0.8,
          radius: feature.properties.mag
        });
        layer.addLayer(marker);


        // Give each feature a popup that describes the place, time, and magnitude of the earthquake.
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Magnitude:  ${feature.properties.mag}</p></p><p>Depth:  ${feature.geometry.coordinates[2]}</p>`);
    };
    
  // Create a GeoJSON layer that contains the points array from the earthquakeData object.
  let earthquakes = L.geoJSON(earthquakeData, {
    // execute the onEachFeature function once for each piece of data in the array.
        onEachFeature: onEachFeature
    });

  // Create the map with the modified earthquakes layer
  createMap(earthquakes);

};


function createMap(earthquakes) {

  // Create the base layers.
  let streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create the baseMaps object.
  let baseMaps = {
    "Street Map": streets,
    "Topographic Map": topo
  };

  // Create an overlay object to hold the earthquake markers
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create the map, displaying the streetmap and earthquakes layers on load.
  let earthQuakeMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streets, earthquakes]
  });

  // Create a layer control with the baseMaps and overlayMaps.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
    // Add the layer control to the map.
  }).addTo(earthQuakeMap);

}
