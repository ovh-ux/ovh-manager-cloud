class LogsIndexCtrl {
    constructor ($stateParams, ControllerHelper, LogsIndexService) {
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.ControllerHelper = ControllerHelper;
        this.LogsIndexService = LogsIndexService;
        this.initLoaders();
    }

    $onInit () {
        this.quota.load();
        this.indices.load();
        this.indexOptions.load();
    }

    initLoaders () {
        this.indexOptions = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsIndexService.getSubscribedOptions(this.serviceName),
            successHandler: res => { console.log(res); }
        });

        this.quota = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsIndexService.getQuota(this.serviceName)
        });

        this.indices = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsIndexService.getIndices(this.serviceName),
            successHandler: res => { console.log(res); }
        });
    }

    add (info) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/dbaas/logs/detail/index/add/logs-index-add.html",
                controller: "LogsIndexAddModalCtrl",
                controllerAs: "LogsIndexAddModalCtrl",
                resolve: {
                    serviceName: () => this.serviceName,
                    indexInfo: () => info,
                    options: () => this.LogsIndexService.getSubscribedOptions(this.serviceName)
                }
            }
        });
        // this.LogsIndexService.addModal(this.$stateParams, info);
    }

    showDeleteConfirm (info) {
        this.LogsIndexService.deleteModal(
            this.$stateParams.serviceName,
            info
        ).then(() => this.deleteIndex(info));
    }

    deleteModal (info) {
        this.LogsIndexService.deleteIndex(this.serviceName, info.indexId);
        // .then(() => refresh view ?)
    }
}

angular.module("managerApp").controller("LogsIndexCtrl", LogsIndexCtrl);
