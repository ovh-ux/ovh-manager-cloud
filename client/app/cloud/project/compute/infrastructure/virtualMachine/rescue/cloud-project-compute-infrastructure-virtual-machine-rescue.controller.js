angular.module("managerApp").controller("CloudProjectComputeInfrastructureVirtualmachineRescueCtrl", function
    ($scope, $translate, params, $uibModalInstance, $stateParams, OvhApiCloudProjectImage, CloudMessage,
     CloudProjectComputeInfrastructureOrchestrator) {

    "use strict";
    var self = this;

    self.data = {
        vm: params,
        images: null,
        selectedImage: null
    };

    self.loaders = {
        images: false,
        action: false
    };

    function getImages () {
        self.loaders.images = true;

        OvhApiCloudProjectImage.Lexi().query({
            serviceName: $stateParams.projectId,
            flavorType: self.data.vm.type,
            region: self.data.vm.region
        }).$promise
        .then(function (result) {
            self.data.images = _.filter(result, {
                visibility: "public",
                type: self.data.vm.image ? self.data.vm.image.type : "linux"
            });
            if (self.isNonRescuableWithDefaultImage(self.data.vm)) {
                self.data.selectedImage = _.findLast(self.data.images, {
                    nameGeneric: self.data.vm.image.nameGeneric
                });
            }
        })
        .finally(function () {
            self.loaders.images = false;
        });
    }

    self.rescueMode = function (enable) {
        self.loaders.action = true;
        CloudProjectComputeInfrastructureOrchestrator.rescueVm(self.data.vm, enable, self.data.selectedImage)
            .then(function (result) {
                var typeKey = (!self.data.selectedImage || self.data.vm.image.type === "linux") ? "linux" : "windows";
                var pwdKey = self.data.selectedImage ? "" : "pwd_";
                var user = self.data.selectedImage ? self.data.selectedImage.user : "root";
                var messageName = "cpc_rescue_mode_success_" + pwdKey + typeKey;
                CloudMessage.success({textHtml : $translate.instant(messageName,
                    {
                        vmName: self.data.vm.name,
                        user: user,
                        ip: self.data.vm.ipAddresses[0].ip,
                        pwd: result.adminPassword || ""
                    })
                });
                $uibModalInstance.close();
            }, function (err) {
                CloudMessage.error([$translate.instant("cpc_rescue_mode_error"), err.data && err.data.message || ""].join(" "));
            })
            .finally(function () {
                self.loaders.action = false;
            });
    };

    self.cancel = function () {
          $uibModalInstance.dismiss(self.snapshot);
      };

    self.isNonRescuableWithDefaultImage = function (vm) {
        return vm.image && (vm.image.distribution === "freebsd" || vm.image.type === "windows");
    };

    getImages();
});
