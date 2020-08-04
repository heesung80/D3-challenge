// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

//Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Initial Params
var chosenXAxis = "poverty"
var chosenYAxis = "healthcare"

// function used for updating x-scale,y-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create xscales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData,d =>d[chosenXAxis] * .9), 
     d3.max(healthData, d => d[chosenXAxis] *1.1)])
    .range([0, width]);

  return xLinearScale;
}

function yScale(healthData, chosenYAxis) {
  // create yscales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData,d =>d[chosenYAxis] * .9), 
     d3.max(healthData, d => d[chosenYAxis] *1.1)])
    .range([height, 0]);

  return yLinearScale;
}

// function used for updating xAxis and yAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}


// function used for updating circles group with a transition to new circle

function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy",d => newYScale (d[chosenYAxis]));
  return circlesGroup;
}
// function used for updating circlestext group with a transition to new circle
function renderCirclesText(circletextGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circletextGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y",d => newYScale (d[chosenYAxis]));
  return circletextGroup;
}
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis,chosenYAxis, circlesGroup) {

  var labelX;
  if (chosenXAxis === "poverty") {
      labelX = "In Poverty (%):";
  }
  else {
      labelX = "Age:";
  }

  var labelY;

  if (chosenYAxis === "healthcare") {
     labelY = "Healthcare:";
  }
  else {
     labelY = "smokes:";
  }
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${labelX} ${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}


// Import Data
d3.csv("assets/data/data.csv").then(function(healthData,err) {
  if(err) throw err;
  console.log(healthData)

  // Parse Data/Cast as numbers
    
  healthData.forEach(function(data) {
    data.healthcare = +data.healthcare;
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.smokes = +data.smokes;
    console.log(data.healthcare);
    console.log(data.poverty);
    console.log(data.age);
    console.log(data.smokes);

  });

    // Create scale functions
   
    var xLinearScale = xScale(healthData, chosenXAxis);

    var yLinearScale = yScale(healthData, chosenYAxis);

    // Create axis functions
   
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append Axes to the chart
    
    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // Create Circles
    
    var circlesGroup = chartGroup.selectAll("circle")
      .data(healthData)
      .enter()
      .append("circle")
      .attr("class","stateCircle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", "10");
      
    var circletextGroup = chartGroup.selectAll()
      .data(healthData)
      .enter()
      .append("text")
      .attr("class","stateText")
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .attr("font-size","10px")
      .text(function(d) {
        return (d.abbr);
      });

    // Create group for two x-axis labels
    var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 17)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty(%)");

    var ageLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 37)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age(Median)");
      
    // Create group for two y-axis labels
    var healthcareLabel = labelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", (margin.left) *2.5)
      .attr("y", 0 - (height + 20))
      .attr("value", "healthcare") // value to grab for event listener
      .classed("active", true)
      .text("Lacks Healthcare(%)");
    
    var smokeLabel = labelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", (margin.left) *2.5)
      .attr("y", 0 - (height+40))
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .text("Smokes(%)");
    
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

     //x axis labels event listener
    labelsGroup.selectAll("text")
      .on("click", function() {
       // get value of selection
        var value = d3.select(this).attr("value");
        if (true) {
          if (value === "poverty" || value === "age") {
            // replaces chosenXAxis with value
              chosenXAxis = value;
  
            // functions here found above csv import
            // updates x scale for new data
              xLinearScale = xScale(healthData, chosenXAxis);
  
            // updates x axis with transition
              xAxis = renderXAxes(xLinearScale, xAxis);
  
          // changes classes to change bold text
            if (chosenXAxis === "age") {
              ageLabel
                .classed("active", true)
                .classed("inactive", false);
              povertyLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else {
              ageLabel
                .classed("active", false)
                .classed("inactive", true);
              povertyLabel
                .classed("active", true)
                .classed("inactive", false);
            }
          }
          else {
            chosenYAxis = value;
            console.log(chosenYAxis)
            yLinearScale = yScale(healthData, chosenYAxis);
  
            // updates y axis with transition
            yAxis = renderYAxes(yLinearScale, yAxis);
            //changes classes to change bold text
            if (chosenYAxis === "healthcare") {
              healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
              smokeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else {
              healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
              smokeLabel
                .classed("active", true)
                .classed("inactive", false);
            }

          }
        // updates circles with new x and y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
  
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);
        // updates circlestext with new x and y values
        circletextGroup= renderCirclesText(circletextGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);


        }
      });
}).catch(function(error) {
console.log(error);
});
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
