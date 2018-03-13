class LogsDashboardsCrudCtrl {
    constructor ($q, $state, $stateParams, $uibModalInstance, LogsDashboardsService,
                 ControllerHelper, CloudMessage, LogsStreamsService) {
        this.$q = $q;
        this.$stateParams = $stateParams;
        this.$uibModalInstance = $uibModalInstance;
        this.serviceName = this.$stateParams.serviceName;
        this.LogsDashboardsService = LogsDashboardsService;
        this.ControllerHelper = ControllerHelper;
        this.CloudMessage = CloudMessage;
        this.LogsStreamsService = LogsStreamsService;
        this.isEdit = false;
        this.isDuplicate = $state.$current.name === "dbaas.logs.detail.dashboards.duplicate";
        this.dashboardName = this.$stateParams.dashboardName;

        this.initLoaders();
    }

    /**
     * initializes options list
     *
     * @memberof LogsDashboardsCrudCtrl
     */
    initLoaders () {
        this.options = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsDashboardsService.getSubscribedOptions(this.serviceName)
        });
        this.options.load();

        this.mainOffer = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsDashboardsService.getMainOffer(this.serviceName)
        });
        this.mainOffer.load();

        if (this.isDuplicate) {
            this.streams = this.ControllerHelper.request.getArrayLoader({
                loaderFunction: () => this.LogsStreamsService.getOwnStreams(this.serviceName)
            });
            this.streams.load();
            this.isEdit = false;
            this.dashboard = this.LogsDashboardsService.getNewDashboard();
            if (!this.dashboardName) {
                this.ControllerHelper.request.getHashLoader({
                    loaderFunction: () => this.LogsDashboardsService.getDashboard(this.serviceName, this.$stateParams.dashboardId)
                        .then(aapiDashboard => {
                            this.dashboardName = aapiDashboard.title;
                            return aapiDashboard;
                        })
                }).load();
            }
        } else if (this.$stateParams.dashboardId) {
            this.isEdit = true;
            this.dashboard = this.ControllerHelper.request.getHashLoader({
                loaderFunction: () => this.LogsDashboardsService.getAapiDashboard(this.serviceName, this.$stateParams.dashboardId)
                    .then(dashboard => dashboard.info)
            });
            this.dashboard.load();
        } else {
            this.isEdit = false;
            this.dashboard = this.LogsDashboardsService.getNewDashboard();
        }
    }

    /**
     * update dashboard
     *
     * @memberof LogsDashboardsCrudCtrl
     */
    updateDashboard () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.CloudMessage.flushChildMessage();
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsDashboardsService.updateDashboard(this.$stateParams.serviceName, this.dashboard.data)
                    .finally(() => this.$uibModalInstance.close())
        });
        return this.saving.load();
    }

    /**
     * create new dashboard
     *
     * @memberof LogsDashboardsCrudCtrl
     */
    createDashboard () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.CloudMessage.flushChildMessage();
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsDashboardsService.createDashboard(this.$stateParams.serviceName, this.dashboard.data)
                    .finally(() => this.$uibModalInstance.close())
        });
        return this.saving.load();
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("LogsDashboardsCrudCtrl", LogsDashboardsCrudCtrl);
