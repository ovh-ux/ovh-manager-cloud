angular.module("managerApp").service("CloudProjectComputeSnapshotPriceService",
  function (CloudPrice) {
    "use strict";

    var self = this;

    self.getSnapshotPrice = function (snapshotSize) {
        return CloudPrice.Lexi().query().$promise.then(function (data) {
            return _.map(data.snapshots, function (snapshotPrice) {
                var total = angular.copy(snapshotPrice.monthlyPrice);
                total.value = _.ceil(total.value * snapshotSize, 2);
                total.text = total.text.replace(/\d+(?:[.,]\d+)?/, "" + total.value);

                snapshotPrice.totalPrice = total;
                return snapshotPrice;
            });
        });
    };
});