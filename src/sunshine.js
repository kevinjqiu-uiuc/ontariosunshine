$('a[data-toggle="tab"]').on('shown.bs.tab', async (e) => {
    const tabId = $(e.target).attr('id');
    if (tabId === 'scene1-tab') {
        const data = await d3.json("/data/scene1.json");
        for (datum of data) {
            datum.year = new Date(datum.year, 1, 1);
        }
        console.log(data);
        $("#scene1-container").empty();
        buildScene1(data, '#scene1-container');
    }
});

function buildScene1(data, containerSelector) {
    const margin = {
        top: 10, right: 30, bottom: 30, left: 60
    };
    const width = 1024 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    const svg = d3.select(containerSelector)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleTime()
        .domain(d3.extent(data, d => d.year ))
        .range([0, width]);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    const maxValue = d3.max(data, d => d.averageSalary);
    const minValue = d3.min(data, d => d.averageSalary);

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([minValue - 1000, maxValue + 1000])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add the line
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(d => x(d.year))
            .y(d => y(d.averageSalary))
        );

    $('div.tooltip').remove();
    const tooltipDiv = d3.select("body").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0);

    svg.selectAll('dot')
       .data(data)
       .enter()
       .append('circle')
       .attr('r', 5)
       .attr("cx", d => x(d.year))
       .attr("cy", d => y(d.averageSalary))
       .on('mouseover', d => {
           console.log('mouseover');
           tooltipDiv.transition()
               .duration(200)
               .style("opacity", .9);
           tooltipDiv.html('Year: ' + d.year.getFullYear() + "<br/>" + 'Avg Salary: ' + d.averageSalary.toLocaleString('en-CA', {style: 'currency', currency: 'CAD'}))
               .style("left", (d3.event.pageX) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
       })
       .on("mouseout", d => {
            tooltipDiv.transition()
                .duration(500)
                .style("opacity", 0);
        });
}