// ----------------------------------------------------------------
// Display earthquake data for the last seven days, all earthquake types, from the U.S. 
// Geological Survey.  See //https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php for
// more information about the different feed types available.  Data is available for the past hour,
// the past day, the past 7 days, and the past 30 days.  All are updated every 5 minutes.
//
// As a separate layer that can be turned on and off like the earthquake layer, display the tectnonic plates.
//
// The tectonic plates data was downloaded from the "fraxen/tectonicplates" GitHub repository 
// and served on the local host because, although the file is publically available for download, 
// GitHub apparently does not allow cross-server requests for direct file URLS as below, even with the
// appropriate CORS code, see further notes in the "fetchPlateData(url)"" function.  This repository has 
// a number of different options for download of the tectonic plate data.  The "steps" data is 
// the largest file and provides more detail at higher zoom levels than the "plates" or "boundaries" 
// versions, but only contains geospatial information.  The other versions provide more information 
// about the name of the plate and the source of the data that could be used for popups, but allowing 
// for more up-close examination of the earthquake data seemed more important, and the plate names 
// are largely associated with the continents.
// ----------------------------------------------------------------

// Store the USGS seven-day API endpoint as the earthquake query url.
const queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Plate data is served locally from Live Server rather than from GitHub repository were it is available for download.
//const plateURL = "https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_plates.json?short_path=879951b";
const plateURL = "PB2002_steps.json";

// Perform a GET request then wait for response from USGS
d3.json(queryURL).then(function (data) {
 
    // Once server responds, call the createFeatures function to add earthquake data received to the map
    createFeatures(data.features, plateURL);
});

// Function to determine marker color based on the depth of the earthquake.
function getMarkerColor(depth) {

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

// This CORS request code was developed before it was learned that GitHub does not allow direct 
// cross-server requests for a specific cross-server file URL.  Thereafter,
// the file was downloaded and served from a server running on local host.  In development, this was
// Live Server, but an Express server could also be used with a short piece of javascript code.  
// Alternatively, a proxy server could be used to make the request to GitHub, but that seemed beyond the scope of this assignment.
async function fetchPlateData(plateURL) {
  try {
    var response = await fetch(plateURL, {mode: 'cors'});
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    var data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching plate data:', error);
    return null;
  };
};

// This function to add all features was made asynchronous when the fetchPlateData function was added.
async function createFeatures(earthquakeData, plateURL) {

    // Define a function to run once for each feature in the earthquakes data. 
    function onEachFeature(feature, layer) {
      try {
          // Give each feature a popup that describes the place and time of the earthquake and its depth and magnitude.
          layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Magnitude:  ${feature.properties.mag}</p><p>Depth:  ${feature.geometry.coordinates[2]}</p>`);
      } catch (error) {
          console.error("Error binding popup for earthquake:", error);
          console.log("Feature:", feature);
          console.log("Layer:", layer);
      };  
    };

  // Create a GeoJSON layer that contains the features array of the earthquakeData object.
  // Call the onEachFeature function once for each earthquake point.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: (feature, latlng) => {

      const quakeLatLng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);

      // Convert the point to a circle marker with appropriate radius and color
      return L.circleMarker(quakeLatLng, {
        color: getMarkerColor(feature.geometry.coordinates[2]),
        fillColor: getMarkerColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.8,
        radius: feature.properties.mag * 3
      });
    }
  });

// This request with CORS enabled was developed before it was learned that GitHub does not allow direct 
// cross-server requests for a specific cross-server file URL.  Thereafter, the plates file
//  was downloaded and served from a server running on local host.  In development, this was
// Live Server, but an Express server could also be used with a short piece of javascript code.  
// Alternatively, a proxy server could be used to make the request to GitHub, but that seemed beyond the scope of this assignment.
  
var plateData = await fetchPlateData(plateURL);
  if (plateData) {
    console.log("platedata");
    let plates = L.geoJSON(plateData, {
      style: function (feature) {
        return {
          color: 'darkorange', 
          weight: 2
        }
      }
    });
      // Call function to add the earthquakes and plates layers to the map along with base layers.
      createMap(earthquakes, plates);
  } else {
      // If plate data fetch failed, only add the earthquakes layer to the map.
      createMap(earthquakes);
  };
};

// Create the map with the earthquake layer, two basemap layers from Open Streets, and
// three other basemap layers from other sources.  Let plates be null if not provided, in 
// case the CORS call to the tectonic plates data is not successful.
// create the map with the earthquake layers and two basemap layers from Open Streets.
function createMap(earthquakes, plates=null) {

  // Create the base layers.
  let streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  let satellite = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}', {
	  maxZoom: 20,
	  attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
  });

  let grayscale = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	  attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	  maxZoom: 16
  });

 let outdoors = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
	  attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
	  bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
	  minZoom: 1,
	  maxZoom: 8,
	  format: 'jpg',
	  time: '',
	  tilematrixset: 'GoogleMapsCompatible_Level'
  });

  // Create the baseMaps object.
  let baseMaps = {
    "Street Map": streets,
    "Topographic Map": topo,
    "Satellite" : satellite,
    "GrayScale" : grayscale,
    "Night View" : outdoors
  };

  // Create an overlay object to hold the earthquake markers
  let overlayMaps = {
      Earthquakes: earthquakes,
      TectonicPlates: plates
  };

  // Create the map, displaying the streetmap and earthquakes layers on load.
  let earthQuakeMap = L.map("map", {
    center: [
      20.09, -52.71
    ],
    zoom: 3,
    layers: [satellite, earthquakes, plates]
  });

  // Create a layer control with the baseMaps and overlayMaps.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
    // Add the layer control to the map.
  }).addTo(earthQuakeMap);

  // function to build the legend 
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
      };
      return div;
    };
    legend.addTo(earthQuakeMap);
  };

  // Add the legend to the map
  createLegend()
};
