// set the dimensions and margins of the graph
let buildScatterplot = (data, heatmapSvg) => {
    // set the dimensions and margins of the graph
    const margin = {top: 10, right: 30, bottom: 30, left: 30},
        width = 350 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

// append the svg object to the body of the page
    const svg = d3.select("#svg-scatterplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Add X axis
    //(style('display', 'none') is used to hide the axis)
    //TODO: update domain with max and min element
    const x = d3.scaleLinear()
        .domain([
            // Minimum value of the x property in your data
            d3.min(data, (d) => d.x),
            // Maximum value of the x property in your data
            d3.max(data, (d) => d.x)
        ])
        .range([0, width]);
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x)).remove();

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([
            // Minimum value of the x property in your data
            d3.min(data, (d) => d.y),
            // Maximum value of the x property in your data
            d3.max(data, (d) => d.y)
        ])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y)).remove();


    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .join("circle")
        .attr("cx", (d) => {
            return x(d.x)
        })
        .attr("cy", (d) => {
            return y(d.y)
        })
        .attr("r", 5)
        .style("fill", function (d) {
            //doing the calculations for id because interpolateRdBu accepts only values in the range [0,1]
            let color = d3.interpolateRdBu((d.id - 1) / (29));
            d3.select(this).property("data-original-color", color)
            return color
        }).on("mouseover", function (d) {
        const dat = this.__data__
        const selectedTeam = dat.name;
        // Highlight the corresponding cell in the heatmap
        highlightCellInHeatmap(selectedTeam);
    })
        .on("mouseout", function () {
            // Remove highlighting when mouse leaves the scatterplot circle
            const dat = this.__data__
            const selectedTeam = dat.name;
            removeHighlightFromHeatmap(selectedTeam);
        });

// Function to highlight the corresponding cell in the heatmap
    function highlightCellInHeatmap(teamName) {
        // Use teamName to identify and highlight the corresponding cell in the heatmap
        heatmapSvg.selectAll("rect")
            .filter(d => d.team === teamName)
            .style("stroke", "green") // Apply yellow color to the stroke
            .style("stroke-width", 2); // Increase the stroke width for better visibility

        const heatmapLabelNodes = heatmapSvg.selectAll(".heatmap-label");
        heatmapLabelNodes.filter(d => d === teamName)
            .style("font-weight", "bold")
            .style("fill", "black");
    }


// Function to remove highlighting from the heatmap
    function removeHighlightFromHeatmap(teamName) {
        // Removing highlighting from all cells in the heatmap by resetting stroke properties
        heatmapSvg.selectAll("rect")
            .style("stroke", null)
            .style("stroke-width", null);

        const heatmapLabelNodes = heatmapSvg.selectAll(".heatmap-label");

        heatmapLabelNodes.filter(d => d === teamName)
            .style("font-weight", null)
            .style("fill", null);

    };

    return svg;

}

