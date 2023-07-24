// ----------------------------------------------------------------
// Display earthquake data for the last seven days, all earthquake types, from the U.S. 
// Geological Survey.  See //https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php for
// more information about the different feed types available.  Data is available for the past hour,
// the past day, the past 7 days, and the past 30 days.  All are updated every 5 minutes.
// ----------------------------------------------------------------

// Store the USGS seven-day API endpoint as the query url.

const queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// const tectonicURL = "https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_plates.json";
// const tectonicURL = "https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_plates.json?short_path=879951b";
const tectonicURL = "PB2002_steps.json"

// Perform a GET request then wait for response

d3.json(queryURL).then(function (data) {

  d3.json(tectonicURL).then(function (plateData) {

    //console.log(plateData.features);
 
    // Once server responds, call the createFeatures function to add data received to the map
    createFeatures(data.features, plateData.features);

    });
});

// Function to determine marker color based on depth of the earthquake.
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

function createFeatures(earthquakeData, plateData) {

    // Define a function to run once for each feature in the earthquakes data. 
    function onEachFeature(feature, layer) {
      //console.log("lng: " + feature.geometry.coordinates[1] + "lat: " + feature.geometry.coordinates[0] + "mag: " + feature.properties.mag);
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
  // Call the onEachFeature function once for each piece of data 
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

  let plates = L.geoJSON(plateData);
 
  // Call function to add the earthquakes layer to the map along with base layers
  createMap(earthquakes, plates);
};


// create the map with the earthquake layers and two basemap layers from Open Streets.
function createMap(earthquakes, plates) {

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

  //let outdoors = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	// attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
 // });

//  let outdoors = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/MODIS_Terra_CorrectedReflectance_TrueColor/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
//	  attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
//	  bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
	//  minZoom: 1,
	//  maxZoom: 9,
	//  format: 'jpg',
//	  time: '',
//	  tilematrixset: 'GoogleMapsCompatible_Level'
//});

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
    "Night View"  : outdoors
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

  //let earthQuakeMap = L.map("map", {
   // center: [
   //   37.09, -95.71
   //48.8566° N, 2.3522
    //],
    //zoom: 4,
   // layers: [satellite, earthquakes, plates]
  //});


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
