angular.module("managerApp").constant("VpsMonitoringConstant", {
	colors : ['#F1C40F', '#3498DB', '#717984', '#72C02C'],
    option1 : {
        scales: {
            xAxes: [{
                gridLines: {
                    display: false
                }
            }],
            yAxes: [{
                id: "y-axe",
                type: "linear",
                ticks: {
                    min: 0,
                    max: 100,
                    beginAtZero: true
                },
                scaleLabel: {
                    display: true,
                    labelString: "%"

                }
            }]
        },
        elements: {
            line: {
                fill: "bottom",
                backgroundColor: "#59d2ef",
                borderColor: "#00a2bf",
                borderWidth: 4
            },
            point: {
                radius: 0
            }
        }
    },
    option2 : {
        legend: {
            display: true,
        },
        scales: {
            xAxes: [{
                gridLines: {
                    display: false
                }
            }],
            yAxes: [
            {
                id: 'y-axis-1',
                type: 'linear',
                display: true,
                position: 'left',
                ticks: {
                    min: 0,
                    beginAtZero: true
                },
                scaleLabel: {
                    display: true,
                    labelString: "BPS"

                }
            }
          ]
        },
        elements: {
            line: {
                borderColor: "#00a2bf",
                borderWidth: 4
            },
            point: {
                radius: 0
            }
        }
    }
})
