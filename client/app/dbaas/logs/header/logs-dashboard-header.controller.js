class LogsDashboardHeaderCtrl {
    constructor ($stateParams, $translate, ControllerHelper, LogsDetailService, ovhDocUrl) {
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.ControllerHelper = ControllerHelper;
        this.LogsDetailService = LogsDetailService;
        this.ovhDocUrl = ovhDocUrl;

        this.serviceName = $stateParams.serviceName;

        //  No error handling since we don't want to break anything for a title.
        this.configuration = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsDetailService.getConfiguration(this.serviceName),
            successHandler: () => { this.title = this.configuration.data.displayName; }
        });
    }

    $onInit () {
        this.title = this.serviceName;
        this.configuration.load();
        this.initGuides();
    }

    initGuides () {
        this.guides = {};
        this.guides.title = this.$translate.instant("logs_guides");
        this.guides.list = [{
            name: this.$translate.instant("logs_guides_title"),
            url: this.ovhDocUrl.getDocUrl("logs")
        }];
        this.guides.footer = this.$translate.instant("logs_guides_footer");
    }
}

angular.module("managerApp").controller("LogsDashboardHeaderCtrl", LogsDashboardHeaderCtrl);
