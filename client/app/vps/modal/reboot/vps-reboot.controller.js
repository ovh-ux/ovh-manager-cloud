class VpsRebootCtrl {
    constructor ($translate, $uibModalInstance, CloudMessage, VpsService) {
        this.$translate = $translate;
        this.$uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.VpsService = VpsService;

        this.loader = {
            init: false,
            save: false
        };
        this.model = {};
        this.selected = {
            rescue: false
        };
    }

    $onInit () {
        this.loader.init = true;
        this.VpsService.getTaskInError()
            .then (tasks => { this.loadVpsRescueMode(tasks) });
    }

    loadVpsRescueMode (tasks) {
        if (!tasks || !tasks.length) {
            this.VpsService.getSelected()
                .then(data => { this.model = data })
                .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_reboot_fail")))
                .finally(() => { this.loader.init = false });
        } else {
            this.CloudMessage.error(this.$translate.instant("vps_configuration_polling_fail"));
            this.loader.init = false;
        }
    }

    cancel () {
        this.$uibModalInstance.dismiss();

    }

    confirm () {
        this.loader.save = true;
        this.VpsService.reboot(this.selected.rescue)
            .then(() => this.CloudMessage.success(this.$translate.instant("vps_configuration_reboot_success")))
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_reboot_fail")))
            .finally(() => {
                this.loader.save = false;
                this.$uibModalInstance.close();
            })

    }


}

angular.module("managerApp").controller("VpsRebootCtrl", VpsRebootCtrl);
// angular.module("managerApp").controller("VpsRebootCtrl", [
//     "$scope",
//     "Module.vps.services.Vps",
//     "CloudMessage",

//     function ($scope,Vps,CloudMessage){
//         "use strict";

//         $scope.model = null;
//         $scope.loader = {
//             loading: false,
//             task : false
//         };
//         $scope.selected = {
//             rescue: false
//         };

//         $scope.loadCheck = function () {
//             $scope.loader.task = true;
//             Vps.getTaskInError().then(function (tasks){
//                 loadVpsRescueMode(tasks);
//             }, function (tasks){
//                 loadVpsRescueMode(tasks);
//             });
//         };

//         function loadVpsRescueMode(tasks) {
//             if (!tasks || !tasks.length){
//                 Vps.getSelected().then(function (data) {
//                     $scope.model = data;
//                     $scope.loader.task = false;
//                 }, function () {
//                     $scope.resetAction();
//                     $scope.loader.task = false;
//                     CloudMessage.error($scope.tr("vps_configuration_reboot_fail"), "ERROR", $scope.alertId);
//                 });
//             } else {
//                 $scope.resetAction();
//                 $scope.loader.task = false;
//                 CloudMessage.error($scope.tr("vps_configuration_polling_fail"), "ERROR", $scope.alertId);
//             }
//         }


//         $scope.rebootVps = function () {
//             $scope.loader.loading = true;
//             Vps.reboot($scope.selected.rescue).then(function () {
//                 $scope.resetAction();
//                 $scope.loader.loading = false;
//                 CloudMessage.success($scope.tr("vps_configuration_reboot_success", $scope.vps.name), true, $scope.alertId);
//             }, function (data) {
//                 $scope.resetAction();
//                 $scope.loader.loading = false;
//                 CloudMessage.error($scope.tr("vps_configuration_reboot_fail"), data, $scope.alertId);
//             });
//         };

//     }

// ]);
