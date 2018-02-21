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

        this.mainOffer = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsIndexService.getMainOffer(this.serviceName)
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
        this.mainOffer.load();
    }

    add (info) {
        this.CloudMessage.flushChildMessage();
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/dbaas/logs/detail/index/add/logs-index-add.html",
                controller: "LogsIndexAddModalCtrl",
                controllerAs: "ctrl",
                resolve: {
                    serviceName: () => this.serviceName,
                    indexInfo: () => info,
                    options: () => this.indexOptions,
                    mainOffer: () => this.mainOffer
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
                loaderFunction: () => this.LogsIndexService.deleteIndex(this.serviceName, info.indexId)
                    .then(() => this.initLoaders())
            });

            this.delete.load();
        });
    }
}

angular.module("managerApp").controller("LogsIndexCtrl", LogsIndexCtrl);
