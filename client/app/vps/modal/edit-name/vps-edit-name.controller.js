(() => {
    class VpsEditNameCtrl {
        constructor ($scope, $translate, $uibModalInstance, displayName, serviceName, CloudMessage, SidebarMenu, VpsService) {
            this.$scope = $scope;
            this.$translate = $translate;
            this.$uibModalInstance = $uibModalInstance;
            this.CloudMessage = CloudMessage;
            this.SidebarMenu = SidebarMenu;
            this.VpsService = VpsService;

            this.loaders = {
                save: false
            };
            this.serviceName = serviceName;
            this.value = {
                displayName: displayName
            };
        }


        confirm () {
            this.loaders.save = true;
            this.VpsService.updateDisplayName(this.value)
                .then(() => {
                    this.$scope.$emit("changeDescription", this.value.displayName);
                    this.$uibModalInstance.close();
                })
                .catch(err => this.$uibModalInstance.dismiss(err))
                .finally(() => {
                    const menuItem = this.SidebarMenu.getItemById(this.serviceName);
                    menuItem.title = this.value.displayName;
                    this.loaders.save = false;
                    this.CloudMessage.success(this.$translate.instant("vps_setting_name_updated"));
                });

        }

        cancel () {
            this.$uibModalInstance.dismiss();
        }

    }

    angular.module("managerApp").controller("VpsEditNameCtrl", VpsEditNameCtrl);
})();
