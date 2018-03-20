class LogsDashboardHeaderCtrl {
    constructor ($stateParams, $translate, ControllerHelper, LogsDetailService, ovhDocUrl, SidebarMenu) {
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.ControllerHelper = ControllerHelper;
        this.LogsDetailService = LogsDetailService;
        this.ovhDocUrl = ovhDocUrl;
        this.SidebarMenu = SidebarMenu;
        this.serviceName = $stateParams.serviceName;

        this.serviceName = $stateParams.serviceName;

        this._initLoaders();
    }

    $onInit () {
        this.title = this.serviceName;
        this.menuItem = this.SidebarMenu.getItemById(this.serviceName);
        if (!this.menuItem) {
            this.menuItem = { title: this.serviceName };
        }
        this.runLoaders();
        this.initGuides();
    }

    _initLoaders () {
        //  No error handling since we don't want to break anything for a title.
        this.configuration = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsDetailService.getConfiguration(this.serviceName),
            successHandler: () => { this.title = this.configuration.data.displayName || this.configuration.data.serviceName; }
        });
    }

    runLoaders () {
        this.configuration.load();
    }

    initGuides () {
        this.guides = {};
        this.guides.title = this.$translate.instant("logs_guides");
        this.guides.list = [{
            name: this.$translate.instant("logs_guides_title"),
            url: this.ovhDocUrl.getDocUrl("logs-data-platform")
        }];
        this.guides.footer = this.$translate.instant("logs_guides_footer");
    }
}

angular.module("managerApp").controller("LogsDashboardHeaderCtrl", LogsDashboardHeaderCtrl);
