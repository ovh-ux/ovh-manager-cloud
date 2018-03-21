class LogsIndexCtrl {
    constructor ($stateParams, CloudMessage, ControllerHelper, LogsIndexService, LogsIndexConstant) {
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.ControllerHelper = ControllerHelper;
        this.CloudMessage = CloudMessage;
        this.LogsIndexService = LogsIndexService;
        this.LogsIndexConstant = LogsIndexConstant;
        this.suffixPattern = this.LogsIndexConstant.suffixPattern;
        this.initLoaders();
    }

    initLoaders () {
        this.indexOptions = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsIndexService.getSubscribedOptions(this.serviceName)
        });

        this.quota = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsIndexService.getQuota(this.serviceName)
        });

        this.indices = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsIndexService.getIndices(this.serviceName)
        });

        this.quota.load();
        this.indices.load();
        this.indexOptions.load();
    }

    add (info) {
        this.CloudMessage.flushChildMessage();
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/dbaas/logs/detail/index/add/logs-index-add.html",
                controller: "LogsIndexAddModalCtrl",
                controllerAs: "ctrl",
                backdrop: "static",
                resolve: {
                    serviceName: () => this.serviceName,
                    indexInfo: () => info,
                    options: () => this.indexOptions,
                    quota: () => this.quota
                }
            }
        }).then(() => {
            this.initLoaders();
        });
    }

    showDeleteConfirm (info) {
        this.CloudMessage.flushChildMessage();
        this.LogsIndexService.deleteModal(
            this.serviceName,
            info
        ).then(() => {
            this.delete = this.ControllerHelper.request.getHashLoader({
                loaderFunction: () => this.LogsIndexService.deleteIndex(this.serviceName, info)
                    .then(() => this.initLoaders())
                    .finally(() => this.ControllerHelper.scrollPageToTop())
            });

            this.delete.load();
        });
    }
}

angular.module("managerApp").controller("LogsIndexCtrl", LogsIndexCtrl);
