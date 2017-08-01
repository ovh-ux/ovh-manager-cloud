angular.module("managerApp").service("VrackService", function () {
    "use strict";

    var self = this;

    self.getGroupedServiceTypes = function () {
        return ["dedicatedCloudDatacenter", "dedicatedCloud", "dedicatedServerInterface"];
    };

    self.isGroupedServiceType = function (serviceType) {
        return _.includes(self.getGroupedServiceTypes(), serviceType);
    };
});
