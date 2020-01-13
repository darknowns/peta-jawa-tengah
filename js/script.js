var width = 1920,
  height = 1080,
  populationDomain;

var colorRange = ["#1a9850", "#66bd63", "#a6d96a", "#d9ef8b", "#ffffbf", "#fee08b", "#fdae61", "#f46d43", "#d73027"];
var populationDomain = [0, 100000, 200000, 300000, 500000, 750000, 1000000, 1500000, 2500000, 5000000];

// Create SVG element
var svg = d3.select("body").insert("svg", "p")
  .attr("width", width)
  .attr("height", height * 0.8)
  .attr("class", "map");

// Projection and path
var projection = d3.geoMercator()
  .center([110, -7.5])
  .scale(width * 12)
  .translate([width / 2, height / 2]);

var path = d3.geoPath().projection(projection);

// Asynchronous tasks, load topojson map and data
d3.queue()
  .defer(d3.json, "data/jawa-tengah.json")
  .defer(d3.csv, "data/data.csv")
  .await(ready);

// Callback function
function ready(error, data, population) {
  if (error) throw error;

  // population data
  var populationData = {};

  population.forEach(function (d) { populationData[d.id] = +d.population; });

  // Color
  var populationColor = d3.scaleThreshold()
    .domain(populationDomain)
    .range(colorRange);

  var g = svg.append("g");

  // Draw the map
  g.selectAll("path")
    .attr("class", "city")
    .data(data.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("stroke", "black")
    .attr("stroke-width", "0.2")
    .attr("fill", "white")
    .transition().duration(2000)
    .delay(function (d, i) { return i * 5; })
    .ease(d3.easeLinear)
    .attr("fill", function (d) {
      return populationColor(populationData[d.properties.kabkot]);
    });

  g.selectAll("path")
    .append("title")
    .text(function (d) {
      return d.properties.kabkot + " : " + populationData[d.properties.kabkot];
    });
}

d3.select(window).on("resize", resize);

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;

  projection.scale(width * 1.2)
    .translate([width / 2, height / 2]);

  d3.select("svg")
    .attr("width", width)
    .attr("height", height * 0.8);

  d3.selectAll("path")
    .attr("d", path);
}