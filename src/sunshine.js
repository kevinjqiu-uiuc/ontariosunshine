const PREFIX = window.location.href.indexOf('http://localhost') !== -1 ? '' : '/ontariosunshine';

const CURRENCY_FORMATTER = (v) => v.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

$('a[data-toggle="tab"]').on('shown.bs.tab', async (e) => {
    const tabId = $(e.target).attr('id');
    if (tabId === 'scene1-tab') {
        $('#sector-select').on('change', async function (e) {
            const sectorId = $(e.target).children("option:selected").val();
            const dataPath = PREFIX + `/data/scene1/${sectorId}.json`;

            const data = await d3.json(dataPath);
            for (datum of data) {
                datum.year = new Date(datum.year, 1, 1);
            }

            const annotationsPath = PREFIX + `/data/scene1/anno-${sectorId}.json`;

            let annotations = [];
            try {
                annotations = await d3.json(annotationsPath);
            } catch {
                console.log(`No annotation found for sector: ${sectorId}`)
            }

            console.log(data);
            console.log(annotations);

            $("#scene1-container").empty();
            buildScene1(data, annotations, '#scene1-container');
        });
        $('#sector-select').trigger('change');
    }
});

function buildScene1(data, annotations, containerSelector) {
    const chart = new Scene1Chart(data, annotations, containerSelector);
    chart.addSeries({
        attr: 'averageSalary',
        yAxisPadding: 1000,
        yAxisPlacement: 'left',
        yAxisOrientation: 'left',
        color: 'steelBlue',
        valueFormatter: CURRENCY_FORMATTER,
        valueCaption: "Average Salary",
    });
    chart.addSeries({
        attr: 'totalSalary',
        yAxisPadding: 100000000,
        yAxisPlacement: 'right',
        yAxisOrientation: 'right',
        color: 'orange',
        valueFormatter: CURRENCY_FORMATTER,
        valueCaption: "Total Salary",
    });
    chart.addSeries({
        attr: 'totalNumber',
        yAxisPadding: 15000,
        yAxisPlacement: 'right',
        yAxisOrientation: 'left',
        color: 'purple',
        valueFormatter: v => v,
        valueCaption: "Total # of people on the list",
    });

    chart.build();
}