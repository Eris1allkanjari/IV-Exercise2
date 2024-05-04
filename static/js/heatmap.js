let buildHeatMap = (data, columnMapping, scatterplotData, scatterplotSvg) => {
    // Set up SVG and scales
    const margin = {top: 50, right: 50, bottom: 50, left: 150};
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#svg-heatmap")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Define the list of attributes (columns) to use for the heatmap
    const attributes = Object.keys(data[0]).filter(key => key !== "team_id" && key !== "team_name");
    const attributeNames = attributes.map((d) => {
        return columnMapping[d];
    });

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

// Function to Display Tooltip
    function displayTooltip(cellData, event) {
        // Select the tooltip element or create one if it doesn't exist
        let tooltip = d3.select("#heatmap-tooltip");
        if (tooltip.empty()) {
            tooltip = d3.select("#svg-heatmap")
                .append("div")
                .attr("id", "heatmap-tooltip")
                .attr("class", "tooltip")  // Add the tooltip class
                .style("position", "absolute")
                .style("background-color", "white")
                .style("border", "1px solid black")
                .style("padding", "5px")
                .style("border-radius", "5px")
                .style("pointer-events", "none") // Make tooltip ignore mouse events
                .style("opacity", 0); // Initially hidden
        }

        // Update tooltip content based on cell data
        tooltip.html(`<strong>${cellData.team}</strong><br> ${columnMapping[cellData.attribute]} : ${cellData.value}`);

        // Calculate tooltip position based on mouse coordinates
        const tooltipWidth = tooltip.node().offsetWidth;
        const tooltipHeight = tooltip.node().offsetHeight;
        const mouseX = event.pageX;
        const mouseY = event.pageY;

        // Position the tooltip above the mouse pointer, ensuring it doesn't go off-screen
        let tooltipLeft = mouseX + 10;
        if (tooltipLeft + tooltipWidth > window.innerWidth) {
            tooltipLeft = mouseX - tooltipWidth - 10;
        }
        let tooltipTop = mouseY - tooltipHeight - 10; // Adjusted to position above
        if (tooltipTop < 0) {
            // minimum distance from the top
            tooltipTop = 10;
        }

        // Show the tooltip
        tooltip.style("left", `${tooltipLeft}px`)
            .style("top", `${tooltipTop}px`)
            .style("opacity", 0.8)
            .style("position", "absolute")
            .style("background-color", "red")
            .style("color","white")
            .style("border-radius", "5px")
            .style("padding", "0.2em");
    }

    function hideTooltip() {
        // Select the tooltip element or create one if it doesn't exist
        let tooltip = d3.select("#heatmap-tooltip");
        tooltip.style("opacity", 0);
    }

    const mouseover = function (d) {

        const heatmapCellColor = d3.select(this).attr("fill");
        //get data of cell in heatmap
        const dat = this.__data__;

        // Update scatterplot
        updateScatterplotOnMouseOver(scatterplotSvg, dat.team,heatmapCellColor);
        displayTooltip(dat, d);
    }

    const mouseout = function () {
        // Revert to original fill color when mouse leaves
        const dat = this.__data__

        const selectedTeam = dat.team;
        // Update scatterplot
        updateScatterplotOnMouseOut(scatterplotSvg, selectedTeam);
        hideTooltip();

    }


    // Create heatmap rectangles
    svg.selectAll("rect")
        .data(data.flatMap(d => attributes.map(attr => ({team: d.team_name, attribute: attr, value: d[attr]}))))
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.team))
        .attr("y", d => yScale(columnMapping[d.attribute]))
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("fill", d => getColor(d.value, d.attribute))
        .on("mouseover", mouseover).on("mouseout", mouseout);

    // Add X-axis labels
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("class", "heatmap-label")
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
function updateScatterplotOnMouseOver(scatterplotSvg, teamName,hetmapCellColor) {
    scatterplotSvg.selectAll("circle")
        .filter(d => d.name === teamName)
        .style("fill",hetmapCellColor)
        .style("stroke", "red");

}

function updateScatterplotOnMouseOut(scatterplotSvg, teamName) {
    scatterplotSvg.selectAll("circle")
        .filter(d => d.name === teamName)
        .each(function (d) {
            const originalColor = d3.select(this).property("data-original-color");

            if (originalColor) {
                d3.select(this).style("fill", originalColor);
                 d3.select(this).style("stroke", "none");
            }
        });
}