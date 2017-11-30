class VpsMonitoringCtrl {
    constructor ($q, $stateParams, $translate, CloudMessage, VpsActionService ,VpsService) {
        this.$q = $q;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.serviceName = $stateParams.serviceName;
        this.VpsActionService = VpsActionService;
        this.VpsService = VpsService;

        this.loaders = {
            init: false
        };
        this.data = {};
        this.monitoring = {
            cpu: [],
            ram: [],
            net: [[], []],
            labels: []
        };
        this.period = "LASTDAY";
    }

    $onInit () {
        this.loadOptions();
        this.loadMonitoring();
    }

    loadMonitoring () {
        this.loaders.init = true;
        this.reset();
        this.VpsService.getMonitoring(this.serviceName, this.period)
            .then(data => {
                this.data = data;
                this.humanizeData(data.cpu.values[0].points, this.monitoring.cpu);
                this.humanizeData(data.ram.values[0].points, this.monitoring.ram);
                this.humanizeData(data.netRx.values[0].points, this.monitoring.net[0]);
                this.humanizeData(data.netTx.values[0].points, this.monitoring.net[1]);
                this.generateLabels(data.cpu.values[0].points, data.cpu.pointInterval, data.cpu.pointStart, this.monitoring.labels);
            })
            .catch(() => {
                this.CloudMessage.error(this.$translate.instant("vps_configuration_monitoring_fail"));
                this.error = true;
            })
            .finally(() => { this.loaders.init = false });
    }

    reset () {
        this.monitoring = {
            cpu: [],
            ram: [],
            net: [[], []],
            labels: []
        };
    }

    humanizeData (data, tab) {
        _.forEach(data, element => {
            if (element && element.y) {
                tab.push(element.y);
            } else {
                tab.push(0);
            }
        });
    }

    generateLabels (data, interval, start, tab) {
        const unitInterval = "minutes"
        const pointInterval = interval.standardMinutes;
        let date = moment(start);
        _.forEach(data, element => {
            tab.push(date.format("MM/DD/YY - HH:mm:ss"));
            date = moment(date).add(unitInterval, pointInterval);
        });
    }

    loadOptions () {
        // this.datasetOverride =
        // [{
        //     yAxisID: 'y-axis-1',
        //     borderColor: 'rgb(54, 162, 235)'
        //  }, {
        //     yAxisID: 'y-axis-2',
        //     borderColor: 'rgb(255, 159, 64)'
        // }];
        this.colors = ['#F1C40F', '#3498DB', '#717984', '#72C02C'];
        this.series = [this.$translate.instant("vps_monitoring_network_netRx"), this.$translate.instant("vps_monitoring_network_netTx")];
        this.option1 = {
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
        };
        this.option2 = {
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
                // },
                // {
                //     id: 'y-axis-2',
                //     type: 'linear',
                //     display: true,
                //     position: 'right',
                //     ticks: {
                //         min: 0,
                //         beginAtZero: true
                //     },
                //     scaleLabel: {
                //         display: true,
                //         labelString: "BPS"

                //     }
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
        };
    }
}

angular.module("managerApp").controller("VpsMonitoringCtrl", VpsMonitoringCtrl);
