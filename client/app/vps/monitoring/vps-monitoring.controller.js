class VpsMonitoringCtrl {
    constructor ($q, $stateParams, $translate, CloudMessage, VpsActionService, VpsMonitoringConstant, VpsService) {
        this.$q = $q;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.serviceName = $stateParams.serviceName;
        this.VpsActionService = VpsActionService;
        this.VpsMonitoringConstant = VpsMonitoringConstant;
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
            .catch(() => { this.error = true; })
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
        this.colors = this.VpsMonitoringConstant.colors;
        this.series = [this.$translate.instant("vps_monitoring_network_netRx"), this.$translate.instant("vps_monitoring_network_netTx")];
        this.percentOption = this.VpsMonitoringConstant.percentOption;
        this.bpsOption = this.VpsMonitoringConstant.bpsOption;
    }
}

angular.module("managerApp").controller("VpsMonitoringCtrl", VpsMonitoringCtrl);
