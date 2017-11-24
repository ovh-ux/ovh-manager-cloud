class CloudProjectOpenstackUsersRcloneModalCtrl {
    constructor ($stateParams, $uibModalInstance, CloudProjectOpenstackUsersRcloneService, ControllerHelper) {
        this.$stateParams = $stateParams;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudProjectOpenstackUsersRcloneService = CloudProjectOpenstackUsersRcloneService;
        this.ControllerHelper = ControllerHelper;

        this.projectId = $stateParams.projectId;

        this.model = {
            region: {
                value: undefined,
                required: true
            }
        };

        this._initLoaders();
    }

    $onInit () {
        this.regions.load()
            .then(() => {
                if (this.regions.data.length === 1) {
                    this.model.region.value = this.regions.data[0].microRegion.code;
                }
            });
    }

    confirm () {
        this.$uibModalInstance.close();
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    isModalLoading () {
        return this.regions.loading;
    }

    _initLoaders () {
        this.regions = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.CloudProjectOpenstackUsersRcloneService.getValidRcloneRegions(this.projectId)
                .catch(error => this.cancel(error))
        });
    }
}

angular.module("managerApp").controller("CloudProjectOpenstackUsersRcloneModalCtrl", CloudProjectOpenstackUsersRcloneModalCtrl);
