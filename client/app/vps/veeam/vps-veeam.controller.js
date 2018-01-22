class VpsVeeamCtrl {
    constructor ($stateParams, $translate, CloudMessage, ControllerHelper, VpsActionService, VpsService) {
        this.serviceName = $stateParams.serviceName;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.ControllerHelper = ControllerHelper;
        this.serviceName = $stateParams.serviceName;
        this.VpsActionService = VpsActionService;
        this.VpsService = VpsService;

        this.loaders = {
            init: false,
            checkOrder: false,
            veeamTab: false
        };

        this.vps = {
            hasVeeam: false,
            canOrder: false
        };

    }

    initLoaders () {
        this.veeam = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.VpsService.getVeeam(this.serviceName)
        });
        this.veeamTab = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.VpsService.getTabVeeam(this.serviceName, "available", true)
        });
        this.vps = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.VpsService.getSelectedVps(this.serviceName)
        });
    }

    $onInit () {
        this.initLoaders();
        this.veeam.load().then(() => {
            if (this.veeam.data.state !== "disabled") {
                this.veeamTab.load();
                this.loadRestorePoint();
            } else {
                this.vps.load();
            }
        });
    }

    loadRestorePoint () {
        this.veeamTab.loading = true;
        this.VpsService.getTabVeeam(this.serviceName, "restoring", false)
            .then(data => {
                if (data.length) {
                    this.veeam.data.state = "MOUNTING";
                }
            })
            .catch(err => this.CloudMessage.error(err))
            .finally(() => { this.veeamTab.loading = false; });
    }

    restore (restorePoint) {
        this.VpsActionService.restore(this.serviceName, restorePoint);
    }

    mount (restorePoint) {
        this.VpsActionService.mount(this.serviceName, restorePoint);
    }

    unmount (restorePoint) {
        this.VpsActionService.unmount(this.serviceName, restorePoint);
    }

}

angular.module("managerApp").controller("VpsVeeamCtrl", VpsVeeamCtrl);
