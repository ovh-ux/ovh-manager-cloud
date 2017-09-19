"use strict";

angular.module("managerApp")
  .controller("CloudProjectComputeVolumeSnapshotAddCtrl", function ($scope, $stateParams, $uibModalInstance, params, CloudMessage, $translate, $filter, $q, OvhApiCloudPrice, CloudProjectComputeVolumesOrchestrator, OvhApiCloudProjectVolume, OvhApiMe) {

        var self = this;
        var serviceName = $stateParams.projectId;

        self.snapshot = {
            volume : params,
            name : null,
            price : null,
            priceText : null
        };

        self.loaders = {
            init : false,
            snapshot : false
        };

        function init () {
            self.loaders.init = true;
            OvhApiCloudPrice.Lexi().query().$promise.then(function (prices) {
                var price = _.find(prices.snapshots, function (price) {
                    return price.region === self.snapshot.volume.region;
                });
                if (price && price.monthlyPrice) {
                    self.snapshot.price = price.monthlyPrice.value * self.snapshot.volume.size;
                    self.snapshot.priceText = price.monthlyPrice.text;
                }
                self.snapshot.name = self.snapshot.volume.name + " " + $filter("date")(new Date(), "short");
            })["finally"](function () {
                self.loaders.init = false;
            });
        }

        self.confirmSnapshot = function () {
            self.loaders.snapshot = true;
            CloudProjectComputeVolumesOrchestrator.snapshotVolume(self.snapshot.volume, self.snapshot.name).then(function () {
                $uibModalInstance.close(self.snapshot);
                CloudMessage.info($translate.instant("cpcv_snapshot_creation_info"), { hideAfter: 3 });
            }, function (err) {
                CloudMessage.error([$translate.instant("cpcv_snapshot_creation_error"), err.data && err.data.message || ""].join(" "));
            })["finally"](function () {
                self.loaders.snapshot = false;
            });
        };

        self.cancel = function () {
            $uibModalInstance.dismiss(self.snapshot);
        };

        init();
  });

