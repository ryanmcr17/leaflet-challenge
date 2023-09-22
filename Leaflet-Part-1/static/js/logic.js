// save API endpoint
const APIUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";

console.log(APIUrl);

// D3 request to the API URL
d3.json(APIUrl).then(APIresponse => defineFeatures(APIresponse.features));


let featureCoordsArray = [];
let featureAttributesArray = [];
let featurePropertiesArray = [];

let featuresArray = [];

let circleMarkers = [];

// function to define/create the features (specific earthquakes) to be added to the map
function defineFeatures(earthquakeFeatureData) {



  



  console.log(earthquakeFeatureData);

  
    // function to run on each feature in the features array to add a popup with place and date
    function addFeatureWithPopup(feature, layer) {
    
        let featureCoords = [feature.geometry.coordinates[0],feature.geometry.coordinates[1]];
        console.log('featureCoords = ' + featureCoords);

        let depth = feature.geometry.coordinates[2];
        console.log('depth = ' + depth);

        let colorBasedOnDepth = '';
        let magnitude = feature.properties.mag;
        console.log('magnitude = ' + magnitude);

        let place = feature.properties.place;
        console.log('place = ' + place);

        let time = feature.properties.time;
        console.log('time = ' + time);
        
        if (depth < 10) {
            colorBasedOnDepth = 'darkgreen';
        }   else if (depth < 30) {
            colorBasedOnDepth = 'green';
        }   else if (depth < 50) {
            colorBasedOnDepth = 'lightgreen';
        }   else if (depth < 70) {
            colorBasedOnDepth = 'orange';
        }   else if (depth < 90) {
            colorBasedOnDepth = 'lightred';
        }   else {
            colorBasedOnDepth = 'red';
        };

        console.log('colorBasedOnDepth = ' + colorBasedOnDepth);

        let featureAttributes = {
          stroke: false,
          fillOpacity: 0.75,
          color: "black",
          fillColor: colorBasedOnDepth,
          radius: magnitude
        };

      ///// create arrays of coords + attribute dicts to call later within 'create map' function to create circles/markers for each feature/earthquake (with .addTo(myMap) appended to the calls within the loop)




        featureCoordsArray.push(featureCoords);
        
        featureAttributesArray.push(featureAttributes);

        featurePropertiesArray.push([place,time]);



        earthquakeMarkers.push(
          L.circle(featureCoords, featureAttributes).bindPopup(`<h3>${place}</h3><hr><p>${new Date(time)}</p>`)
        );
    
    };

    // create GeoJSON layer from the features array from earthquakeFeatureData, running addFeatureWithPopup as the 'onEachFeature' on each element of the array
    let earthquakesLayer = L.geoJSON(earthquakeFeatureData, {
        onEachFeature: addFeatureWithPopup
    });

    // pass earthquakesLayer to the createEarthquakeMap function
    createEarthquakeMap(earthquakeMarkers);

};



function createEarthquakeMap(earthquakeLayer) {

    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Create a baseMaps object.
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    };
  
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
      "Significant Earthquakes (past 30 days)": earthquakeLayer
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
      center: [
        0,-100
      ],
      zoom: 2,
      layers: [street, earthquakeLayer]
    });



  
    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  
};
  