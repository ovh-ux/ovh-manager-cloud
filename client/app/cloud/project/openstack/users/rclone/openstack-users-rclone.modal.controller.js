class CloudProjectOpenstackUsersRcloneModalCtrl {
    constructor ($stateParams, $uibModalInstance, CloudProjectOpenstackUsersRcloneService, ControllerHelper, openstackUser) {
        this.$stateParams = $stateParams;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudProjectOpenstackUsersRcloneService = CloudProjectOpenstackUsersRcloneService;
        this.ControllerHelper = ControllerHelper;
        this.openstackUser = openstackUser;

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
        this.rCloneFileGuide.load();
    }

    confirm () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }

        return this.CloudProjectOpenstackUsersRcloneService.getRcloneFileInfo(this.projectId, this.openstackUser.id, this.model.region.value)
            .then(response => this.ControllerHelper.downloadContent({
                content: response.content,
                fileName: "rclone.sh"
            }))
            .finally(() => this.$uibModalInstance.close());
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    isModalLoading () {
        return this.regions.loading || this.rCloneFileGuide.loading;
    }

    _initLoaders () {
        this.regions = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.CloudProjectOpenstackUsersRcloneService.getValidRcloneRegions(this.projectId)
                .catch(error => this.cancel(error))
        });

        this.rCloneFileGuide = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.ControllerHelper.navigation.getConstant("guides.rCloneFile")
                .catch(error => this.cancel(error))
        });
    }
}

angular.module("managerApp").controller("CloudProjectOpenstackUsersRcloneModalCtrl", CloudProjectOpenstackUsersRcloneModalCtrl);
