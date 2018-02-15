class LogsHomeCtrl {
    constructor ($stateParams, $translate, ControllerHelper) {
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.ControllerHelper = ControllerHelper;
        this.serviceName = this.$stateParams.serviceName;
        this.stream = {
            name: "Flux 123",
            url: "https://gra2.logs.ovh.com/streams/595fa3e852440d0001e14a5e"
        };
        this.dashboard = {
            name: "test-tableau-juillet-2017",
            url: "https://gra2.logs.ovh.com/streams/595fa3e852440d0001e14a5e"
        };
        this.graylog = {
            url: "https://gra2.logs.ovh.com/"
        };
        this.actions = {
            lastStream: {
                href: "https://gra2.logs.ovh.com/streams/595fa3e852440d0001e14a5e",
                text: "Flux 123",
            },
            allStream: {
                state: "dbaas.logs.detail.streams",
                text: this.$translate.instant("logs_home_shortcuts_all_stream")
            },
            lastDashboard: {
                href: "https://gra2.logs.ovh.com/streams/595fa3e852440d0001e14a5e",
                text: "test-tableau-juillet-2017"
            },
            allDashboard: {
                state: "dbaas.logs.detail.dashboards",
                text: this.$translate.instant("logs_home_shortcuts_all_dashboard")
            },
            graylog: {
                href: "https://gra2.logs.ovh.com/",
                text: this.$translate.instant("logs_home_shortcuts_graylog")
            },
            elasticsearch: {
                href: "https://gra2.logs.ovh.com/",
                text: this.$translate.instant("logs_home_shortcuts_elasticsearch")
            }
        };
    }
}

angular.module("managerApp").controller("LogsHomeCtrl", LogsHomeCtrl);
