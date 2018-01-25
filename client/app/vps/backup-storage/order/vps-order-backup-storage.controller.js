class VpsOrderBackupStorageCtrl {
    constructor ($stateParams, $translate, $window, CloudMessage, CloudNavigation, VpsService) {
        "use strict";
        this.$translate = $translate;
        this.$window = $window;
        this.CloudMessage = CloudMessage;
        this.CloudNavigation = CloudNavigation;
        this.serviceName = $stateParams.serviceName;
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
        this.VpsService.orderOption(this.serviceName, "ftpbackup", this.model.optionDetails.duration.duration).then(order => {
            this.model.url = order.url;
            this.$window.open(order.url, "_blank");
            this.previousState.go();
        }).catch(error => {
            this.CloudMessage.error(this.$translate.instant("vps_configuration_activate_ftpbackup_fail") + " " + error.data);
        });
    }

    cancel () {
        this.previousState.go();
    }
}

angular.module("managerApp").controller("VpsOrderBackupStorageCtrl", VpsOrderBackupStorageCtrl);
