angular.module("managerApp").controller("VrackMoveDialogCtrl", function ($scope, $q, $translate, $uibModalInstance, Toast, Vrack, VrackDedicatedCloudDatacenter) {
    "use strict";

    var self = this;

    self.form = null;

    self.service = $scope.$resolve.service;

    self.models = {
        vrack: null
    };

    self.collections = {
        allowedVracks: [],
        vracks: []
    };

    self.loaders = {
        allowedVrack: false,
        vrack: false,
        move: false
    };

    function init () {
        self.fetchAllowedVracks();
    }

    self.fetchAllowedVracks = function () {
        if (self.loaders.allowedVrack) {
            return;
        }

        self.loaders.allowedVrack = true;

        return VrackDedicatedCloudDatacenter.Lexi().allowedVrack({
            serviceName: self.service.vrack,
            datacenter: self.service.id
        }).$promise.then(function (allowedVracks) {
            if (!allowedVracks.length) {
                return;
            }
            self.collections.allowedVracks = allowedVracks;
            return self.fetchVracks();
        }).catch(function () {
            self.collections.allowedVracks = [];
        }).finally(function () {
            self.loaders.allowedVrack = false;
        });
    };

    self.fetchVracks = function () {
        if (self.loaders.vracks) {
            return;
        }

        self.loaders.vracks = true;

        Vrack.Aapi().query().$promise.then(function (vracks) {
            self.collections.vracks = vracks;
        }).catch(function () {
            self.collections.vracks = [];
        }).finally(function () {
            self.loaders.vracks = false;
        });
    };

    self.getDisplayName = function (vrackId) {
        var vrack = _.find(self.getVracks(), { id: vrackId });

        if (vrack && !_.isEmpty(vrack.name)) {
            return vrack.name;
        }

        return vrackId;
    };

    self.dismiss = function () {
        $uibModalInstance.dismiss();
    };

    self.getAllowedVracks = function () {
        return self.collections.allowedVracks;
    };

    self.getVracks = function () {
        return self.collections.vracks;
    };

    self.submit = function () {
        if (!self.form.$valid || self.loaders.move) {
            return;
        }

        self.loaders.move = true;

        VrackDedicatedCloudDatacenter.Lexi().move({
            serviceName: self.service.vrack,
            datacenter: self.service.id
        }, {
            targetServiceName: self.models.vrack
        }).$promise.then(function (task) {
            $scope.$emit("vrack:refresh-data");
            $uibModalInstance.close({ task: task });
        }).catch(function () {
            Toast.error($translate.instant("vrack_move_dialog_request_error"));
        }).finally(function () {
            self.loaders.move = false;
        });
    };

    self.hasPendingRequests = function () {
        return self.loaders.move;
    };

    init();
});
