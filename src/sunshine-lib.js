class Scene1Chart {
    constructor(data, annotations, canvasContainerSelector) {
        this.data = data;
        this.canvasContainerSelector = canvasContainerSelector;
        this.margin = {
            top: 10, right: 30, bottom: 30, left: 60
        };
        this.width = 1000 - this.margin.left - this.margin.right;
        this.height = 600 - this.margin.top - this.margin.bottom;

        this.series = [];
        this.legend = [];

        this.annotations = annotations || [];
    }

    addSeries(serie) {
        this.series = [...this.series, serie];
        this.legend = [...this.legend, [serie.valueCaption, serie.color]];
    }

    createCanvas() {
        const svg = d3.select(this.canvasContainerSelector)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        return svg;
    }

    createAndRenderXAxis(svg) {
        const x = d3.scaleTime()
            .domain(d3.extent(this.data, d => d.year ))
            .range([0, this.width]);

        svg.append("g")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(x));

        return x
    }

    renderYAxis(svg, serie) {
        const padding = serie.yAxisPadding;
        const maxValue = d3.max(this.data, d => d[serie.attr]);
        const minValue = d3.min(this.data, d => d[serie.attr]);

        const y = d3.scaleLinear()
            .domain([minValue - padding, maxValue + padding])
            .range([this.height, 0]);

        const orientation = serie.yAxisOrientation === 'left' ? d3.axisLeft : d3.axisRight;
        const placementWidth = serie.yAxisPlacement === 'left' ? 0 : this.width;

        svg.append("g")
            .attr('class', 'axis-' + serie.color)
            .attr("transform", "translate( " + placementWidth + ", 0 )")
            .call(orientation(y));

        return y
    }

    renderLine(svg, serie, x, y) {
        const line = d3.line()
            .x(d => x(d.year))
            .y(d => y(d[serie.attr]));
        svg.append("path")
            .data([this.data])
            .attr("fill", "none")
            .attr("stroke", serie.color)
            .attr("stroke-width", 3)
            .attr("d", line);
    }

    renderTooltip(svg, serie, x, y) {
        svg.selectAll('dot')
            .data(this.data)
            .enter()
            .append('circle')
            .attr('class', serie.color)
            .attr('data-toggle', 'tooltip')
            .attr('data-placement', 'left')
            .attr('data-html', true)
            .attr('title', (d) => 'Year: ' + d.year.getFullYear() + "<br/>" + serie.valueCaption + ": " + serie.valueFormatter(d[serie.attr]))
            .attr('r', 5)
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d[serie.attr]))
        $('[data-toggle="tooltip"]').tooltip();
    }

    renderLegend(svg) {
        const keys = this.legend;
        const size = 20;
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

    build() {
        const svg = this.createCanvas();

        const x = this.createAndRenderXAxis(svg);

        for (const serie of this.series) {
            const y = this.renderYAxis(svg, serie);
            this.renderLine(svg, serie, x, y);
            this.renderTooltip(svg, serie, x, y);
        }

        this.renderLegend(svg);

        const makeAnnotations = d3.annotation()
            .editMode(false)
            .notePadding(15)
            .type(d3.annotationLabel)
            .annotations(this.annotations);

        svg
            .append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations);
    }
}

class Scene2Chart {
    constructor(data, canvasContainerSelector) {
        this.data = data;
        this.canvasContainerSelector = canvasContainerSelector;
        this.margin = { top: 20, right: 20, bottom: 30, left: 250 },
        this.width = 1000 - this.margin.left - this.margin.right,
        this.height = 600 - this.margin.top - this.margin.bottom;
    }

    createCanvas() {
        const svg = d3.select(this.canvasContainerSelector).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + this.margin.left + "," + this.margin.top + ")");
        return svg;
    }

    createXAxis() {
        const x = d3.scaleLinear()
            .range([0, this.width])
            .domain([0, d3.max(this.data, (d) =>  d.averageSalary )]);
        return x;
    }

    createYAxis() {
        const y = d3.scaleBand()
            .range([this.height, 0])
            .padding(0.1)
            .domain(this.data.map((d) =>  d.sector ));
        return y;
    }

    build() {
        const svg = this.createCanvas();

        // format the data
        this.data.forEach(function (d) {
            d.sales = +d.sales;
        });

        const x = this.createXAxis();
        const y = this.createYAxis();

        // append the rectangles for the bar chart
        svg.selectAll(".bar")
            .data(this.data)
            .enter().append("rect")
            .attr("fill", "steelBlue")
            //.attr("x", function(d) { return x(d.sales); })
            .attr("width", function (d) { return x(d.averageSalary); })
            .attr("y", function (d) { return y(d.sector); })
            .attr("height", y.bandwidth());

        // add the x Axis
        svg.append("g")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(x));

        // add the y Axis
        svg.append("g")
            .call(d3.axisLeft(y));

    }
}