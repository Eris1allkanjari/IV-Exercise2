let buildHeatMap = (data, columnMapping, scatterplotData, scatterplotSvg) => {
    // Set up SVG and scales
    const margin = { top: 50, right: 50, bottom: 50, left: 150 };
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#svg-heatmap")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Define the list of attributes (columns) to use for the heatmap
    const attributes = Object.keys(data[0]).filter(key => key !== "team_id" && key !== "team_name");
    const attributeNames = attributes.map((d) => { return columnMapping[d]; });

    // Extract the domain (minimum and maximum values) for each attribute
    const attributeDomains = {};
    attributes.forEach(attr => {
        attributeDomains[attr] = d3.extent(data, d => d[attr]);
    });

    // Function to calculate color based on data value and attribute domain
    const getColor = (value, attr) => {
        const domain = attributeDomains[attr];
        const normalizedValue = (value - domain[0]) / (domain[1] - domain[0]);
        return d3.interpolateRdBu(normalizedValue);
    };

    // 1. Define the size of the rectangles based on the width and height available for the heatmap grid
    const cellSize = Math.min(width / data.length, height / attributes.length);

    // 2. Update the xScale to use the cellSize for the range
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.team_name))
        .range([0, width])
        .padding(0.1) // Adjust padding as needed
        .round(true); // Ensure pixels are rounded for sharp edges

    // 3. Update the yScale to use the cellSize for the range
    const yScale = d3.scaleBand()
        .domain(attributeNames)
        .range([0, height])
        .padding(0.5) // Adjust padding as needed
        .round(true); // Ensure pixels are rounded for sharp edges

    // Create heatmap rectangles
    svg.selectAll("rect")
        .data(data.flatMap(d => attributes.map(attr => ({ team: d.team_name, attribute: attr, value: d[attr] }))))
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.team))
        .attr("y", d => yScale(columnMapping[d.attribute]))
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("fill", d => getColor(d.value, d.attribute))
        .on("mouseover", function(d) {
            // Update scatterplot based on mouseover event
            const dat = this.__data__;
           console.log(dat)
            console.log(scatterplotData)

            const selectedTeam = dat.team;
            // Filter scatterplot data based on selected team
            const filteredData = scatterplotData.filter(item => item.team === selectedTeam);
            // Update scatterplot
            updateScatterplot(filteredData, scatterplotSvg);
        });

    // Add X-axis labels
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)") // Rotate for better readability
        .attr("text-anchor", "end");

    // Add Y-axis labels
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale)
            .tickSize(cellSize)) // Adjust tick size if needed
        .selectAll("text")
        .attr("dy", ".50em");
}

// Function to update scatterplot
function updateScatterplot(data, scatterplotSvg) {
    // Remove existing circles
    scatterplotSvg.selectAll("circle").remove();
    // Draw circles based on updated data
    scatterplotSvg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 5)
        .style("fill", "blue"); // Adjust fill color as needed
}