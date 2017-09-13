"use strict";

angular.module("managerApp")
  .controller("CloudProjectComputeInfrastructureIpFailoverImportCtrl", function ($scope, $uibModalInstance, OvhApiIp, $translate, Toast, OvhApiCloudProjectInstance, $stateParams, $q, OvhApiMe, CLOUD_GEOLOCALISATION, pendingImportIps) {

    var self = this;

    $scope.projectId = $stateParams.projectId;

    self.datas = {
        autoSelected : [],
        ipsFo : [],
        ipsFoDetail : [],
        ipsFoDetailIds : [],
        vms : [],
        user : null,

        selected : {},
        selectedvm : null
    };

    self.loaders = {
        table : {
            ipsFo : false,
            importIpsFo : false
        },
        vms : false
    };

    //---------INIT---------

    function init () {
        return OvhApiMe.Lexi().get().$promise.then(function (user) {
            self.datas.user = user;
            return getIpsFo(true);
        }, function (err) {
            Toast.error( [$translate.instant('cpciif_import_ips_error'), err.data && err.data.message || ''].join(' '));
        });
    }

    function getIpsFo (clearCache) {
        if (!self.loaders.table.ipsFo) {
            self.loaders.table.ipsFo = true;
            if (clearCache){
                OvhApiIp.Lexi().resetQueryCache();
                OvhApiIp.Lexi().resetCache();
            }
            return OvhApiIp.Lexi().query({
                type: 'failover'
            }).$promise.then(function (ips) {
                ips = _.filter(ips, function (ip) {
                    return _.indexOf(pendingImportIps, ip) < 0;
                });
                return self.initIps(ips);
            }, function (err) {
                Toast.error( [$translate.instant('cpciif_import_ips_error'), err.data && err.data.message || ''].join(' '));
                self.datas.ipsFo = null;
            })['finally'](function () {
                self.loaders.table.ipsFo = false;
            });
        }
    }

    /**
     * Fetch informations for every IPFO (we need to check if ipfo is already linked
     * to current project and if his region is compatible)
     */
    self.initIps = function (ips) {
        var queries = [];
        self.datas.ipsFo = [];

        angular.forEach(ips, function (ip) {
            queries.push(OvhApiIp.Lexi().get({
                ip: ip
            }).$promise.then(function (ip) {
                if (!(ip.routedTo && ip.routedTo.serviceName === $scope.projectId)) {
                    self.datas.ipsFo.push(ip);
                }
            }));
        });

        return $q.all(queries);
    };

    //---------TOOLS---------

    $scope.$watch('CPCIIpFailoverImportCtrl.datas.selected', function () {
        //if some line were not move => recheck
        if (self.datas.autoSelected.length) {
            angular.forEach(self.datas.autoSelected, function (ip) {
                self.datas.selected[ip] = true;
            });
            self.datas.autoSelected = [];
        }
    }, true);

    self.refreshIpsFo = function () {
        getIpsFo(true);
    };

    self.getSelectedCount = function () {
        return Object.keys(self.datas.selected).length;
    };

    self.getInfoSelect = function () {
        if (Object.keys(self.datas.selected).length === 1) {
            return Object.keys(self.datas.selected)[0];
        }
        if (Object.keys(self.datas.selected).length > 1) {
            return Object.keys(self.datas.selected).length;
        }
        return null;
    };

    //---------MODAL---------

    self.confirm = function () {
        if (!self.loaders.table.importIpsFo){
            var listPromise = [],
                listIpsWithTasks = [],
                nbSelected  = self.getSelectedCount(),
                lastIp = "";

            self.loaders.table.importIpsFo = true;

            angular.forEach(self.datas.selected, function (value, ip) {
                lastIp = ip;

                listPromise.push(OvhApiIp.Lexi().move(
                    { ip : ip },
                    { to : $scope.projectId }
                ).$promise.then(function (task) {
                    listIpsWithTasks.push({            // à revoir
                        ip   : ip,
                        task : task
                    });
                }, function (error) {
                    return $q.reject({
                        ip : ip,
                        error : error
                    });
                }));
            });

            $q.allSettled(listPromise).then(function () {
                if (nbSelected > 1) {
                    Toast.success($translate.instant('cpciif_import_vms_route_of_success_plural', {nbIps : nbSelected}));
                }else {
                    Toast.success($translate.instant('cpciif_import_vms_route_of_success', {ip : lastIp}));
                }
                $uibModalInstance.close(listIpsWithTasks);
            }, function (error) {
                var tabError = error.filter(function (val) {
                    return !!val.error;
                });

                var ipError = _.pluck(tabError, 'ip');

                self.datas.autoSelected = angular.copy(ipError);

                if (tabError.length > 1) {
                    Toast.error($translate.instant('cpciif_import_vms_route_of_error_plural', {ips: ipError.toString()}));
                } else {
                    var errorIp  = tabError[0].error;
                    Toast.error( [$translate.instant('cpciif_import_vms_route_of_error', {ip: tabError[0].ip}), errorIp.data && errorIp.data.message || ''].join(' '));
                }

            })['finally'](function(){
                self.datas.selected = {};

                self.loaders.table.importIpsFo = false;
            });

        }
    };

    self.cancel = function () {
        $uibModalInstance.dismiss();
    };

    init();
});
