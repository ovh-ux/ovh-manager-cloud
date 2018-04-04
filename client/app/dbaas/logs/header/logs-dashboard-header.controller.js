class LogsDashboardHeaderCtrl {
    constructor ($stateParams, $translate, ControllerHelper, LogsConstants, LogsDetailService, ovhDocUrl, SidebarMenu, LogsHelperService, LogsHomeService) {
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.ControllerHelper = ControllerHelper;
        this.LogsConstants = LogsConstants;
        this.LogsDetailService = LogsDetailService;
        this.ovhDocUrl = ovhDocUrl;
        this.SidebarMenu = SidebarMenu;
        this.serviceName = $stateParams.serviceName;
        this.isAccountDisabled = true;
        this.LogsHelperService = LogsHelperService;
        this.LogsHomeService = LogsHomeService;

        this._initLoaders();
    }

    $onInit () {
        this.service = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsHomeService.getServiceDetails(this.serviceName)
                .then(service => {
                    this.isAccountDisabled = this.LogsHelperService.isAccountDisabled(service);
                    return service;
                })
        }).load();

        this.title = this.serviceName;
        this.menuItem = this.SidebarMenu.getItemById(this.serviceName);
        //  If the menu is not yet loaded, we fetch IPLB's displayName.  Dirty patch.
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
            url: this.ovhDocUrl.getDocUrl(this.LogsConstants.LOGS_DOCS_NAME)
        }];
        this.guides.footer = this.$translate.instant("logs_guides_footer");
    }
}

angular.module("managerApp").controller("LogsDashboardHeaderCtrl", LogsDashboardHeaderCtrl);
