(() => {
    class VpsReinstallCtrl {
        constructor ($translate, $uibModalInstance, CloudMessage, SidebarMenu, VpsService) {
            this.$translate = $translate;
            this.$uibModalInstance = $uibModalInstance;
            this.CloudMessage = CloudMessage;
            this.SidebarMenu = SidebarMenu
            this.VpsService = VpsService;

            this.loaders = {
                save: false
            };
        }


        confirm () {
            this.loaders.save = true;
            this.VpsService.updateDisplayName()
                .then(() => {
                    this.$uibModalInstance.close();
                })
                .catch(err => this.$uibModalInstance.dismiss(err))
                .finally(() => {
                    this.loaders.save = false;
                    this.CloudMessage.success(this.$translate.instant("vps_setting_name_updated"));
                });

        }

        cancel () {
            this.$uibModalInstance.dismiss();
        }

    }

    angular.module("managerApp").controller("VpsReinstallCtrl", VpsReinstallCtrl);
})();
