class VpsMonitoringCtrl {
    constructor ($q, $translate, CloudMessage, VpsActionService ,VpsService) {
        this.$q = $q;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.VpsActionService = VpsActionService;
        this.VpsService = VpsService;

        this.loaders = {
            init: false
        };
        this.data = {};
        this.period = "LASTDAY";
    }

    $onInit () {
        this.loadOptions();
        this.loadMonitoring();
    }

    loadMonitoring () {
        this.loaders.init = true;
        this.monitoring = {
            cpu: [],
            ram: [],
            trafic: {},
            labels: []
        };
        this.VpsService.getMonitoring(this.period)
            .then((data) => {
                this.data = data;
                this.convertData(data.cpu.values[0].points, this.monitoring.cpu);
                this.convertData(data.ram.values[0].points, this.monitoring.ram);
                this.generateLabels(data.cpu.values[0].points, data.cpu.pointInterval, data.cpu.pointStart, this.monitoring.labels);
            })
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_monitoring_fail")))
            .finally(() => { this.loaders.init = false });
    }

    convertData (data, tab) {
        _.forEach(data, element => {
            tab.push(element.y);
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
            scales: {
                xAxes: [{
                    id: "y-axe",
                    type: "linear",
                    ticks: {
                        min: 0,
                        beginAtZero: true
                    }
                }],
                yAxes: [{
                    id: "y-axe",
                    type: "linear",
                    ticks: {
                        min: 0,
                        beginAtZero: true
                    }
                }]
            },
            elements: {
                point: {
                    radius: 0
                }
            }
        };
    }
}

angular.module("managerApp").controller("VpsMonitoringCtrl", VpsMonitoringCtrl);
