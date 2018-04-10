class LogsIndexCtrl {
    constructor ($stateParams, bytesFilter, CloudMessage, ControllerHelper, LogsIndexService, LogsConstants) {
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.ControllerHelper = ControllerHelper;
        this.CloudMessage = CloudMessage;
        this.LogsIndexService = LogsIndexService;
        this.LogsConstants = LogsConstants;
        this.suffixPattern = this.LogsConstants.suffixPattern;
        this.bytesFilter = bytesFilter;
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

    storageColor (info) {
        const percentage = parseInt((info.currentStorage * 100) / info.maxSize, 10);
        if (percentage > 80) {
            return this.LogsConstants.HIGH;
        } else if (percentage < 60) {
            return this.LogsConstants.LOW;
        } else if (percentage > 60 && percentage < 80) {
            return this.LogsConstants.MID;
        }
        return null;
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
