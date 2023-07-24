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


// Function to determine marker color based on depth of the earthquake.
function getMarkerColor(depth) {
  console.log("depth: " + depth);

  if (depth < 10) {
    return 'lawngreen';
  } else if (depth < 30) {
    return 'mediumseagreen';
  } else if (depth < 50) {
    return 'gold';
  } else if (depth < 70) {
    return 'darkorange';
  } else if (depth < 90) {
    return 'hotpink';
  } else {
    return 'red';
  }
};

function createFeatures(earthquakeData) {

  // Define a function to run once for each feature in the features array. 
  function onEachFeature(feature, layer) {
    //console.log("lng: " + feature.geometry.coordinates[1] + "lat: " + feature.geometry.coordinates[0] + "mag: " + feature.properties.mag);

    // Give each feature a popup that describes the place and time of the earthquake and its depth and magnitude.
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Magnitude:  ${feature.properties.mag}</p><p>Depth:  ${feature.geometry.coordinates[2]}</p>`);
  };

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Call the onEachFeature function once for each piece of data 
  // Convert the point to a circle marker with appropriate radius and color

  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: (feature, latlng) => {

      const quakeLatLng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);

      return L.circleMarker(quakeLatLng, {
        color: getMarkerColor(feature.geometry.coordinates[2]),
        fillColor: getMarkerColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.8,
        radius: feature.properties.mag * 3
      });
    }
  });

  // Call function to add the earthquakes layer to the map along with base layers
  createMap(earthquakes);
};


// create the map with the earthquake layers and two basemap layers from Open Streets.
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

  //L.legend.layers(baseMaps, overlayMaps, {
  //  collapsed: false
    // Add the layer control to the map.
  //}).addTo(earthQuakeMap);


  // Create a layer control with the baseMaps and overlayMaps.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
    // Add the layer control to the map.
  }).addTo(earthQuakeMap);



function createLegend() {
  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (earthQuakeMap) {
    var div = L.DomUtil.create('div', 'info legend');
    labels = ['<strong>Depth</strong>'];

     const magnitudes = ['-10-10','10-30','30-50','50-70','70-90', '90++']; 
     const colors = ['lawngreen', 'mediumseagreen', 'gold', 'darkorange', 'hotpink', 'red']; 

     for (let i = 0; i < magnitudes.length; i++) {
       div.innerHTML +=
         '<i style="background:' + colors[i] + '"></i> ' +
         (magnitudes[i] ? magnitudes[i] + '<br>' : '+');
         console.log(div.innerHTML);
     }
     div.innerHTML += labels.join('<br>');
     return div;
  };

  legend.addTo(earthQuakeMap);
}

function createLegend() {
  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (earthQuakeMap) {
    var div = L.DomUtil.create('div', 'info legend');

    const magnitudes = ['<10', '10-30', '30-50', '50-70', '70-90', '90++'];
    const colors = ['lawngreen', 'mediumseagreen', 'gold', 'darkorange', 'hotpink', 'red'];

    div.innerHTML = '<div class="legend-title">' + '<strong>Depth</strong><br>'; 

    for (let i = 0; i < magnitudes.length; i++) {
      div.innerHTML +=
        '<div class="legend-item">' +
        '<div class="legend-rectangle" style="background-color:' + colors[i] + '"></div>' +
        (magnitudes[i] ? magnitudes[i] : '+') +
        '</div>';
    }

    return div;
  };

  legend.addTo(earthQuakeMap);
};

// Add the legend to the map
createLegend()

};
