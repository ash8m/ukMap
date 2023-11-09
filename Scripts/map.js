// Define the width and height of the map container, here it
// is aligned with the dimensions of the svg element defined 
// in the html.
const width = 800;
const height = 900;

// Define a projection, either Albers or Mercator, for the UK map.
// Mercator is selected as that is the most widely used projection.
// Rotate and center the projection to UK.
// For more details refer https://www.d3indepth.com/geographic/
const projection = d3.geoMercator()
    .center([0, 55.4])
    .rotate([4.4, 0])
    .scale(2500)
    .translate([width / 2, height / 2]);

// Creates a new geographic path generator. This generator is used to convert 
// GeoJSON geometries into SVG path string
const path = d3.geoPath().projection(projection);

// Function for drawing the UK map. Accepts a geoJson file 
// as the argument and draws a map based on it.
function drawMap(geoJson) {
    d3.select('#content g.map').selectAll("path")
        .data(geoJson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", "grey")
        .style("opacity", "1")
        .style("stroke", "black");
}


// Function to fetch the locations to be plotted at the UK Map from 
// a specified feed. The locations are plotted as circles of varying radius
// depending on the population of the locations in the feed.
function fetchAndPlotLocations(locations) {

    d3.select('#content g.map').selectAll("circle").remove();
    const jsonURL = "http://34.38.72.236/Circles/Towns/50";
    d3.json(jsonURL).then(function(locations) {
        d3.select('#content g.map').selectAll("circle.location")
            .data(locations)
            .enter()
            .append("circle")
            // for cx and cy attributes, select the latitude and longitude 
            // from the geoJson file. 
            // For more details https://www.d3indepth.com/geographic/ 
            .attr("cx", function(d) {
                return projection([d.lng, d.lat])[0];
            })
            .attr("cy", function(d) {
                return projection([d.lng, d.lat])[1];
            })
            // in the radius attribute, scale the radius of the circle
            // proportional to the population of the town. For more 
            // details refer https://observablehq.com/@d3/d3-scalelinear
            .attr("r", function(d) {
                const radiusScale = d3.scaleLinear()
                    .domain([0, d3.max(locations, d => d.Population)])
                    .range([5, 10]);

                return radiusScale(d.Population);
            })
            .style("fill", "green")
            // Add a title element for the tooltip. The tooltip displays the 
            // name of the town and its population.
            .append("title")
            .text(function(d) {
                return d.Town + "\nPopulation: " + d.Population;
            });
    }).catch(function(error) {
        console.error('Error fetching JSON:', error);
    });
}

// Map data taken from data made available under MIT License by the game 'click-that-hood'.
// For details, https://github.com/codeforgermany/click_that_hood/tree/main
// json() method is used to fetch the data. Since the feed has points in Isle of Mann, its 
// Map is concatenated with the Map data of UK. The final Map has both UK and Isle of Mann.
// json() method is asynchronous and is chained together using 'then' so that drawMap() and 
// fetchAndPlotLocations() are called only after both the geojson data is loaded.
d3.json('https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/united-kingdom.geojson').then(function(data1) {
    d3.json('https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/isle-of-man.geojson').then(function(data2) {
        var combinedFeatures = data1.features.concat(data2.features);
        var combinedGeoJson = {
            type: 'FeatureCollection',
            features: combinedFeatures
        };
        drawMap(combinedGeoJson);
        fetchAndPlotLocations();
    });


});
//event listener for reload button
document.getElementById('reloadButton').addEventListener('click', fetchAndPlotLocations);