const PREFIX = window.location.href.indexOf('http://localhost') !== -1 ? '' : '/ontariosunshine';

const CURRENCY_FORMATTER = (v) => v.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

$('a[data-toggle="tab"]').on('shown.bs.tab', async (e) => {
    const tabId = $(e.target).attr('id');
    switch (tabId) {
        case 'scene1-tab': {
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
            break;
        }
        case 'scene2-tab': {
            $('#scene2-year-selector').on('change', async function (e) {
                const year = $(e.target).val();
                $('#scene2-input-year-label').html(`Year: ${year}`);
                const dataPath = PREFIX + `/data/scene2/${year}.json`;
                const data = await d3.json(dataPath);

                const annotationsPath = PREFIX + `/data/scene2/anno-${year}.json`;
                let annotations = [];
                try {
                    annotations = await d3.json(annotationsPath);
                } catch {
                    console.log(`No annotation found for year: ${year}`)
                }

                $('#scene2-container').empty()
                buildScene2(data, annotations, '#scene2-container');
            });
            $('#scene2-year-selector').trigger('change');
            break;
        }
        case 'scene3-tab': {
            $('#scene3-year-selector').on('change', async function (e) {
                const year = $(e.target).val();
                $('#scene3-input-year-label').html(`Year: ${year}`);
                const dataPath = PREFIX + `/data/scene3/${year}.json`;
                const data = await d3.json(dataPath);

                const annotationsPath = PREFIX + `/data/scene3/anno-${year}.json`;
                let annotations = [];
                try {
                    annotations = await d3.json(annotationsPath);
                } catch {
                    console.log(`No annotation found for year: ${year}`)
                }
                $('#scene3-container').empty()
                buildScene3(data, annotations, '#scene3-container');
            });
            $('#scene3-year-selector').trigger('change');
            break;
        }
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

function buildScene2(data, annotations, containerSelector) {
    const chart = new Scene2Chart(data, annotations, containerSelector);
    chart.build();
}

function buildScene3(data, annotations, containerSelector) {
    const chart = new Scene3Chart(data, annotations, containerSelector);
    chart.build();
}