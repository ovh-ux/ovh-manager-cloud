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
        this.monitoring = {
            cpu: [],
            ram: []
        };
    }

    $onInit () {
        this.loadOptions();
        this.loadMonitoring();
    }

    loadMonitoring () {
        this.loaders.init = true;
        this.VpsService.getMonitoring(this.period)
            .then((data) => {
                this.data = data;
                this.convertData(data.cpu.values[0].points, this.monitoring.cpu);
                this.convertData(data.ram.values[0].points, this.monitoring.ram);
            })
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_monitoring_fail")))
            .finally(() => { this.loaders.init = false });
    }

    convertData (data, tab) {
        _.forEach(data, element => {
            tab.push(element.y);
        });
    }

    loadOptions () {
        this.options = {
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
    }
}

angular.module("managerApp").controller("VpsMonitoringCtrl", VpsMonitoringCtrl);
