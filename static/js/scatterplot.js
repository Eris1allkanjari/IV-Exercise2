// set the dimensions and margins of the graph
let buildScatterplot = (data) => {
    // set the dimensions and margins of the graph
    const margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 300 - margin.left - margin.right,
        height = 100 - margin.top - margin.bottom;

// append the svg object to the body of the page
    const svg = d3.select("#svg_scatterplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Read the data


    // Add X axis
    //TODO: update domain with max and min element
    const x = d3.scaleLinear()
    .domain([-5, 10])
    .range([ 0, width ]);
    svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

    // Add Y axis
    const y = d3.scaleLinear()
    .domain([-5, 10])
    .range([ height, 0]);
    svg.append("g")
    .call(d3.axisLeft(y));

    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .join("circle")
        .attr("cx", function (d) {
            return x(d[0])
        })
        .attr("cy", function (d) {
            return y(d[1])
        })
        .attr("r", 5)
        .style("fill", "#69b3a2")


    return svg;

}
