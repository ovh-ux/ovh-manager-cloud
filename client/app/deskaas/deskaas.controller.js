"use strict";

angular.module("managerApp").controller("DeskaasCtrl", function (OvhApiDeskaasService, Toast, $translate, $q) {

    var self = this;

    self.flags = {
        initializing: true
    };

    function handleMethodCall (promise, success) {

        return promise
            .then(success)
            .catch(function (err) {
                Toast.error([$translate.instant("common_api_error"), err.data.message].join(" "));
            });
    }

    self.services = [];

    function registerService (details, serviceInfo, user) {

        self.services.push({
            details : details,
            serviceInfo : serviceInfo,
            user : user
        });

    }

    function loadService (serviceId) {
        var servicePromise = OvhApiDeskaasService.Lexi().serviceInfos({ serviceName: serviceId }).$promise;
        servicePromise.then(function (serviceInfo) {
            var detailsPromise = OvhApiDeskaasService.Lexi().getDetails({ serviceName: serviceId }).$promise;
            detailsPromise.then(function (details) {
                if (details.alias != 'noAlias') {
                    details.displayName = details.alias + ' (' + details.serviceName + ')';
                } else {
                    details.displayName = details.serviceName;
                }

                if (serviceInfo.status === "ok") {
                    var userPromise = OvhApiDeskaasService.Lexi().getUser({ serviceName: serviceId }).$promise;
                    userPromise.then(function (user) {
                        user.displayName = user.name + ' (' + user.email + ')';
                        registerService(details, serviceInfo, user);
                    });
                } else {
                    registerService(details, serviceInfo, { displayName: "-" });
                }
            });
        });
        return servicePromise;
    }

    self.getServices = function () {

        var promise = OvhApiDeskaasService.Lexi().getServices().$promise;

        return handleMethodCall(
            promise,
            function (serviceIds) {
                var promises = [];
                serviceIds.forEach(function (serviceId) {
                    promises.push(loadService(serviceId));
                });
                return $q.all(promises);
            }
        );

    };

    function init () {
        self.flags.initializing = true;

        $q.all([
            self.getServices()
        ])
            .then(function () {
                self.flags.initializing = false;
            });
    }

    init();

});
