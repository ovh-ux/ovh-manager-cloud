class VpsOrderBackupStorageCtrl {
    constructor ($stateParams, $translate, $window, CloudMessage, CloudNavigation, ServiceHelper, VpsService) {
        "use strict";
        this.$translate = $translate;
        this.$window = $window;
        this.CloudMessage = CloudMessage;
        this.CloudNavigation = CloudNavigation;
        this.serviceName = $stateParams.serviceName;
        this.ServiceHelper = ServiceHelper;
        this.VpsService = VpsService;


        this.model = {
            optionDetails: undefined,
            url: undefined
        };
    }

    $onInit () {
        this.VpsService.getOptionDetails(this.serviceName, "ftpbackup")
            .then(option => {
                this.model.optionDetails = option.results[0];
            })
            .catch(error => {
                this.CloudMessage.error(this.$translate.instant("vps_dashboard_loading_error") + " " + error.data);
            });

        this.previousState = this.CloudNavigation.getPreviousState();
        this.VpsService.canOrderOption(this.serviceName, "ftpbackup").catch(() => {
            this.CloudMessage.error(this.$translate.instant("vps_tab_BACKUP_STORAGE_dashboard_ftpbackup_unavailable"));
        });
    }

    orderOption () {
        this.ServiceHelper.loadOnNewPage(this.VpsService.orderOption(this.serviceName, "ftpbackup", this.model.optionDetails.duration.duration))
            .then(({ url }) => {
                this.model.url = url;
            });
    }

    cancel () {
        this.previousState.go();
    }
}

angular.module("managerApp").controller("VpsOrderBackupStorageCtrl", VpsOrderBackupStorageCtrl);
