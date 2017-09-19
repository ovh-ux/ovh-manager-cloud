"use strict";

angular.module("managerApp")
  .controller("CloudProjectComputeInfrastructureIpFailoverBuyCtrl", function ($scope, $uibModalInstance, OvhApiIp, $translate, CloudMessage, OvhApiCloudProjectInstance, $stateParams, OvhApiOrderCloudProjectIp, OvhApiCloudProjectFlavor, OvhApiCloudProjectIpFailover, $window, $q, atInternet, OvhApiMe, CLOUD_GEOLOCALISATION, CLOUD_IPFO_ORDER_LIMIT) {

    var self = this;
    var projectId = $stateParams.projectId;

    self.datas = {
        me: null,
        billingInfo: null
    };

    self.form = {
        instances : [],
        flavors : [],
        failoverIps : [],
        instance  : null,
        maxIp : 0,
        quantity : 1,
        quantityChanged : function () {
            self.datas.billingInfo = null;
            getBuyIpsInfo();
        },
        instanceChanged : function () {
            var instanceLoc = _.first(_.keys(_.pick(CLOUD_GEOLOCALISATION.instance, function (region) {
                return _.indexOf(region, self.form.instance.region) >= 0;
            })));
            self.form.countryEnum = _.defaults(CLOUD_GEOLOCALISATION.ipfo, {
                instanceLoc : []
            })[instanceLoc];
            self.datas.billingInfo = null;
            self.form.country = null;
        },
        country : null,
        countryEnum : null,
        countryChanged : function () {
            self.datas.billingInfo = null;
            getBuyIpsInfo();
        },
        contractsAccepted : false
    };

    self.loaders = {
        init: false,
        billingInfo: false,
        buying : false
    };

    $scope.countryTranslated = function (code) {
        return $translate.instant("country_" + code.toUpperCase());
    };

    //---------INIT---------

    function init () {
        var promises = [initInstance(), initFlavors(), initIp()];
        self.loaders.init = true;
        return $q.allSettled(promises).then(function () {

            // compute the max limit of IP Failovers
            angular.forEach(self.form.instances, function (instance) {
                var flavor = _.first(_.filter(self.form.flavors, { id : instance.flavorId }));
                if (flavor) {
                    var limit = +CLOUD_IPFO_ORDER_LIMIT[flavor.type];
                    if (_.isNumber(limit) && !isNaN(limit)) {
                        self.form.maxIp += limit;
                    }
                }
            });

            // subtract current IP from limit
            var currentIps = _.filter(self.form.failoverIps, function (ip) {
                // only count the IP if it's not routed or if it is linked to a compatible instance
                return !ip.routedTo || _.find(self.form.instances, function (instance) {
                    return instance.id === ip.routedTo;
                });
            });
            self.form.maxIp -= currentIps.length;

            // IP Failover must be attached to an ACTIVE instance
            self.form.instances = _.filter(self.form.instances, { status : "ACTIVE" });

            // If no instance are available, disable buy IP
            if (self.form.instances.length === 0) {
                self.form.maxIp = 0;
            }

        })["finally"](function () {
            self.loaders.init = false;
        });
    }

    function initInstance(){
        OvhApiCloudProjectInstance.Lexi().resetQueryCache();
        return OvhApiCloudProjectInstance.Lexi().query({
            serviceName : projectId
        }).$promise.then(function (result) {
            self.form.instances = result;
        }, function (err) {
            self.form.instances = [];
            CloudMessage.error( [$translate.instant('cpciif_buy_init_error'), err.data && err.data.message || ''].join(' '));
            return $q.reject(err);
        });
    }

    function initFlavors(){
        return OvhApiCloudProjectFlavor.Lexi().query({
            serviceName : projectId
        }).$promise.then(function (result) {
            self.form.flavors = result;
        }, function (err) {
            self.form.flavors = [];
            CloudMessage.error( [$translate.instant('cpciif_buy_init_error'), err.data && err.data.message || ''].join(' '));
            return $q.reject(err);
        });
    }

    function initIp () {
        OvhApiCloudProjectIpFailover.Lexi().resetQueryCache();
        return OvhApiCloudProjectIpFailover.Lexi().query({
            serviceName : projectId
        }).$promise.then(function (result) {
            self.form.failoverIps = result;
        }, function (err) {
            self.form.failoverIps = [];
            CloudMessage.error( [$translate.instant('cpciif_buy_init_error'), err.data && err.data.message || ''].join(' '));
            return $q.reject(err);
        });
    }

    //---------MODAL---------

    self.confirm = function () {
        buyIps();
    };

    self.cancel = $uibModalInstance.dismiss;

    //---------API CALLS---------

    function getBuyIpsInfo () {
        if (self.form.instance && self.form.country && self.form.quantity) {
            self.loaders.billingInfo = true;
            self.form.contractsAccepted = false;
            OvhApiOrderCloudProjectIp.Lexi().get({
                serviceName: projectId
            }, {
                country : self.form.country.toLowerCase(),
                instanceId : self.form.instance.id,
                quantity : self.form.quantity
            }).$promise.then(function (result) {
                self.datas.billingInfo = result;
            }, function (err) {
                self.datas.billingInfo = null;
                CloudMessage.error([$translate.instant("cpciif_buy_init_error"), err.data && err.data.message || ''].join(' '));
            })['finally'](function () {
                self.loaders.billingInfo = false;
            });
        }
    }

    function buyIps () {
        self.loaders.buying = true;

        OvhApiOrderCloudProjectIp.Lexi().buy({
            serviceName: projectId
        }, {
            country : self.form.country.toLowerCase(),
            instanceId : self.form.instance.id,
            quantity : self.form.quantity
        }).$promise.then(function (result) {
            $window.open(result.url, "_blank");
            CloudMessage.success($translate.instant('cpciif_buy_success', {'url': result.url }), { hideAfter : false });
            $uibModalInstance.dismiss();
            atInternet.trackOrder({
                name : "[IP]ipfailover[ip-failover-" + self.form.country + "]",
                page : "cloud-project::cloud-project-compute::cloud-project-compute-infrastructure-order",
                priceTaxFree : self.datas.billingInfo.prices.withoutTax.value / self.form.quantity,
                quantity : self.form.quantity
            });
        }, function (err){
            CloudMessage.error( [$translate.instant('cpciif_buy_error'), err.data && err.data.message || ''].join(' '));
            return $q.reject(err);
        })['finally'](function () {
            self.loaders.buying = false;
        });
    }

    init();

});
