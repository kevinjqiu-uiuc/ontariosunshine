const PREFIX = window.location.href.indexOf('http://localhost') != -1 ? '' : '/ontariosunshine';


$('a[data-toggle="tab"]').on('shown.bs.tab', async (e) => {
    const tabId = $(e.target).attr('id');
    if (tabId === 'scene1-tab') {
        const data = await d3.json(PREFIX + "/data/scene1.json");
        for (datum of data) {
            datum.year = new Date(datum.year, 1, 1);
        }
        console.log(data);
        $("#scene1-container").empty();
        buildScene1(data, '#scene1-container');
    }
});

function buildScene1(data, containerSelector) {
    const chart = new Scene1Chart(data, containerSelector);
    chart.addSeries({
        attr: 'averageSalary',
        yAxisPadding: 1000,
        yAxisPlacement: 'left',
        yAxisOrientation: 'left',
        color: 'steelBlue',
    });

    chart.build();
}

function _buildScene1(data, containerSelector) {
    const getYAxis = (attr, padding, height) => {
        const maxValue = d3.max(data, d => d[attr]);
        const minValue = d3.min(data, d => d[attr]);

        const y = d3.scaleLinear()
            .domain([minValue - padding, maxValue + padding])
            .range([height, 0]);
        return y
    }

    const margin = {
        top: 10, right: 30, bottom: 30, left: 60
    };
    const width = 1000 - margin.left - margin.right;
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

    // Add Y axis
    const y0 = getYAxis('averageSalary', 1000, height);
    const y1 = getYAxis('totalSalary', 100000000, height);
    const y2 = getYAxis('totalNumber', 30000, height);

    const averageSalaryLine = d3.line().x(d => x(d.year)).y(d => y0(d.averageSalary));
    const totalSalaryLine = d3.line().x(d => x(d.year)).y(d => y1(d.totalSalary));
    const totalNumberLine = d3.line().x(d => x(d.year)).y(d => y2(d.totalNumber));

    svg.append("g")
        .attr('class', 'axisSteelBlue')
        .call(d3.axisLeft(y0));

    svg.append("g")
        .attr('class', 'axisOrange')
        .attr("transform", "translate( " + width + ", 0 )")
        .call(d3.axisRight(y1));

    svg.append("g")
        .attr('class', 'axisPurple')
        .attr("transform", "translate( " + width + ", 0 )")
        .call(d3.axisLeft(y2));

    const createPath = (color, line) => {
        svg.append("path")
            .data([data])
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 3)
            .attr("d", line);
    }

    createPath('steelblue', averageSalaryLine);
    createPath('orange', totalSalaryLine);
    createPath('purple', totalNumberLine);

    $('div.tooltip').remove();

    const createTooltip = (attr, yScale, caption, formatter, color) => {
        const tooltipDiv = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // tooltip
        svg.selectAll('dot')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', color)
            .attr('r', 5)
            .attr("cx", d => x(d.year))
            .attr("cy", d => yScale(d[attr]))
            .on('mouseover', d => {
                tooltipDiv.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltipDiv.html('Year: ' + d.year.getFullYear() + "<br/>" + caption + formatter(d[attr]))
                    .style("left", (d3.event.pageX + 20) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", d => {
                tooltipDiv.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    }

    const currencyFormatter = (v) => v.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
    createTooltip('averageSalary', y0, 'Avg Salary: ', currencyFormatter, 'steelBlue');
    createTooltip('totalSalary', y1, 'Total Salary: ', currencyFormatter, 'orange');
    createTooltip('totalNumber', y2, 'Total Number on the list: ', v => v, 'purple');

    const createLegend = () => {
        const keys = [["Average Salary", "steelblue"], ["Total Salary", "orange"], ["Number of people on the list", "purple"]];
        const size = 20
        svg.selectAll("mydots")
        .data(keys)
        .enter()
        .append("circle")
            .attr("cx", 100)
            .attr("cy", (_,i) => 50 + i*(size+15))
            .attr("r", 6)
            .attr("width", size)
            .attr("height", size)
            .style("fill", d => d[1])

        svg.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
            .attr("x", 100 + size*1.2)
            .attr("y", (_,i) => 50 + i*(size+10) + (size/2))
            .style("fill", function(d){ return d[1]})
            .text(function(d){ return d[0]})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
    }
    createLegend();
}