// save API endpoint
const APIUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";

console.log(APIUrl);

// D3 request to the API URL
d3.json(APIUrl).then(APIresponse => createEarthquakeMap(APIresponse.features));


// function to define/create the features (specific earthquakes) and to create the map
function createEarthquakeMap(earthquakeFeatureData) {


  let quakeMarkers = [];

  // loop through the earthquakes/'features' array creating a new circle marker with detailed popup for each quake and pushing them into the quakeMarkers array
  for (let i = 0; i < earthquakeFeatureData.length; i++) {

    let feature = earthquakeFeatureData[i];
    
    // API data puts longitude before latitude, have to switch them here for L.circle/marker function argument
    let coordinates = [feature.geometry.coordinates[1],feature.geometry.coordinates[0]];
    console.log('Coordinates = ' + coordinates);

    let magnitude = feature.properties.mag;
    console.log('magnitude = ' + magnitude);

    let place = feature.properties.place;
    console.log('place = ' + place);

    let date = new Date(feature.properties.time).toLocaleDateString();
    console.log('date = ' + date);

    let depth = feature.geometry.coordinates[2];
    console.log('depth = ' + depth);
    let colorBasedOnDepth = '';

    // determine color to use based on depth of quake
    if (depth < 10) {
        colorBasedOnDepth = '#663399';
    }   else if (depth < 30) {
        colorBasedOnDepth = '#0000FF';
    }   else if (depth < 50) {
        colorBasedOnDepth = '#006400';
    }   else if (depth < 70) {
        colorBasedOnDepth = '#FFFF00';
    }   else if (depth < 90) {
        colorBasedOnDepth = '#FFA500';
    }   else {
        colorBasedOnDepth = '#FF0000';
    };
    console.log('colorBasedOnDepth = ' + colorBasedOnDepth);

    // save attributes dict/JSON for circle marker
    let featureAttributes = {
      stroke: false,
      fillOpacity: 0.75,
      color: "black",
      fillColor: colorBasedOnDepth,
      radius: Math.pow(magnitude*15,3)
    };
    
    // create circle marker based on coordinates + attributes dict, with detailed popup showing additional info
    quakeMarkers.push(
      L.circle(coordinates, featureAttributes)
      .bindPopup(`<h3>${place}</h3><hr>
      Date: ${date}<br>
      Magnitude: ${magnitude}<br>
      Depth: ${depth}<br>
      Coordinates: ${coordinates}`)
    );

  }


  // create overlay layer from quakeMarkers array
  let quakeLayer = L.layerGroup(quakeMarkers);


  // create base layers
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });


  // create baseMaps object
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };


  // create overlayMaps object to hold our quakeLayer of earthquake markers with popups
  let overlayMaps = {
    "Significant Earthquakes (past 30 days)": quakeLayer
  };


  // create map, passing streetmap and earthquakes layers to display on load, showing the entire world centered on [0,0]
  let myMap = L.map("map", {
    center: [
      0,0
    ],
    zoom: 2,
    layers: [street, quakeLayer]
  });

  
  // add a legend showing how the marker colors represent earthquake depth

  var legend = L.control({
    position: 'bottomright'
  });

  legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'depth legend');
    div.style.backgroundColor = "white";
    div.style.border = "thin solid black";
    div.innerHTML = '<h3>Earthquake depth (km)</h3><svg width="10" height="10"><rect width="10" height="10" fill="#663399"/></svg>  -10 - 10<br><svg width="10" height="10"><rect width="10" height="10" fill="#0000FF"/></svg>  10 - 30<br><svg width="10" height="10"><rect width="10" height="10" fill="#006400"/></svg>  30 - 50<br><svg width="10" height="10"><rect width="10" height="10" fill="#FFFF00"/></svg>  50 - 70<br><svg width="10" height="10"><rect width="10" height="10" fill="#FFA500"/></svg>  70 - 90<br><svg width="10" height="10"><rect width="10" height="10" fill="#FF0000"/></svg>  90+<br>';
    return div;        
  };

  legend.addTo(myMap);


  // create layer control with baseMaps and overlayMaps objects and add it to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


};
