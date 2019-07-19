class Serie {
    constructor(attr, yAxisPadding, yAxisPlacement) {
        this.attr = attr;
        this.yAxisPadding = yAxisPadding;
        this.yAxisPlacement = yAxisPlacement;
    }
}

class Scene1Chart {
    constructor(data, canvasContainerSelector) {
        this.data = data;
        this.canvasContainerSelector = canvasContainerSelector;
        this.margin = {
            top: 10, right: 30, bottom: 30, left: 60
        };
        this.width = 1000 - this.margin.left - this.margin.right;
        this.height = 600 - this.margin.top - this.margin.bottom;

        this.series = [];
    }

    addSeries(serie) {
        this.series = [...this.series, serie]
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

    build() {
        const svg = this.createCanvas();
        console.log(svg);
        const x = this.createAndRenderXAxis(svg);

        for (const serie of this.series) {
            const y = this.renderYAxis(svg, serie);
            this.renderLine(svg, serie, x, y)
        }
    }
}