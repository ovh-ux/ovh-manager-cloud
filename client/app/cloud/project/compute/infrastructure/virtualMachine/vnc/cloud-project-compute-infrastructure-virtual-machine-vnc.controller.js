"use strict";

angular.module("managerApp").controller("CloudProjectComputeInfrastructureVirtualmachineVncCtrl", function ($uibModalInstance, params, $translate, Toast, CloudProjectInstance) {

    var self = this;
    this.loading = true;
    this.fullscreen = false;
    this.data = {
        vm: params
    };

    function init () {
        self.loading = true;
        return CloudProjectInstance.Lexi().vnc({
            serviceName: self.data.vm.serviceName,
            instanceId: self.data.vm.id
        }, {}).$promise.then(function (vncInfos) {
            self.data.url = vncInfos.url;
            self.loading = false;
        }, function (err) {
            Toast.error( [$translate.instant('cpcivm_vnc_error'), err.data && err.data.message || ''].join(' '));
            $uibModalInstance.dismiss();
        });
    }
    this.close = function () {
        $uibModalInstance.dismiss();
    };

    init();

});
