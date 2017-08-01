(() => {
    class VeeamStorageCtrl {
        constructor ($stateParams, $translate, ControllerHelper, RegionService, VeeamService) {
            this.$stateParams = $stateParams;
            this.$translate = $translate;
            this.ControllerHelper = ControllerHelper;
            this.RegionService = RegionService;
            this.VeeamService = VeeamService;

            this.storageInfos = ControllerHelper.request.getArrayLoader({
                loaderFunction: () => this.VeeamService.getStorages(this.$stateParams.serviceName),
                errorHandler: response => this.VeeamService.unitOfWork.messages.push({
                    text: response.message,
                    type: "error"
                })
            });

            this.actions = this.ControllerHelper.request.getArrayLoader({
                loaderFunction: () => this.VeeamService.getActions(this.$stateParams.serviceName)
            });

            this.capabilities = this.ControllerHelper.request.getHashLoader({
                loaderFunction: () => this.VeeamService.getCapabilities(this.$stateParams.serviceName)
            });
        }

        getRegionText (region) {
            return this.RegionService.getTranslatedMicroRegion(region.toUpperCase());
        }

        addStorage () {
            if (this.actions.data.addStorage.available) {
                this.ControllerHelper.modal.showModal({
                    modalConfig: {
                        templateUrl: "app/veeam/storage/add/veeam-storage-add.html",
                        controller: "VeeamStorageAddCtrl",
                        controllerAs: "VeeamStorageAddCtrl",
                        resolve: {
                            serviceName: () => this.$stateParams.serviceName
                        }
                    },
                    successHandler: result => {
                        this.VeeamService.startPolling(this.$stateParams.serviceName, result.data)
                            .then(this.storageInfos.load.bind(this));
                    },
                    errorHandler: err => this.VeeamService.unitOfWork.messages.push({
                        text: err.message,
                        type: "error"
                    })
                });   
            } else {
                this.ControllerHelper.modal.showWarningModal({
                    title: this.$translate.instant("common_action_unavailable"),
                    message: this.actions.data.addStorage.reason
                });
            }
        }

        updateQuota (inventoryName) {
            this.ControllerHelper.modal.showModal({
                modalConfig: {
                    templateUrl: "app/veeam/storage/update-quota/veeam-storage-update-quota.html",
                    controller: "VeeamStorageUpdateQuotaCtrl",
                    controllerAs: "VeeamStorageUpdateQuotaCtrl",
                    resolve: {
                        inventoryName: () => inventoryName,
                        serviceName: () => this.$stateParams.serviceName
                    }
                },
                successHandler: result => {
                    this.VeeamService.startPolling(this.$stateParams.serviceName, result.data)
                        .then(this.storageInfos.load.bind(this));
                }
            });
        }

        $onInit () {
            this.storageInfos.load();
            this.actions.load();
            this.capabilities.load();
        }
    }

    angular.module("managerApp").controller("VeeamStorageCtrl", VeeamStorageCtrl);
})();
