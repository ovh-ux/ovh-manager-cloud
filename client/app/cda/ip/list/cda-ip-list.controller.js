angular.module("managerApp")
    .controller("CdaIpListCtrl", function ($q, $stateParams, $uibModal, $translate, OvhApiDedicatedCeph, CloudMessage) {
        "use strict";

        const self = this;

        self.loading = false;

        self.datas = {
            ips: undefined
        };

        self.modals = {
            add: {
                templateUrl: "app/cda/ip/add/cda-ip-add.html",
                controller: "CdaIpAddCtrl"
            },
            remove: {
                templateUrl: "app/cda/ip/delete/cda-ip-delete.html",
                controller: "CdaIpDeleteCtrl"
            }
        };

        function init () {
            self.loading = true;
            initIps()
                .catch(error => {
                    displayError(error);
                })
                .finally(() => {
                    self.loading = false;
                });
        }

        function initIps () {
            OvhApiDedicatedCeph.Acl().v6().resetAllCache();
            return OvhApiDedicatedCeph.Acl().v6().query({
                serviceName: $stateParams.serviceName
            }).$promise.then(ips => {
                self.datas.ips = ips;
                return ips;
            });
        }

        self.openAddModal = function () {
            self.openModal(self.modals.add.templateUrl, self.modals.add.controller);
        };

        self.openDeleteModal = function (ip) {
            self.openModal(self.modals.remove.templateUrl, self.modals.remove.controller, { ip });
        };

        self.openModal = function (template, controller, params) {
            const modal = $uibModal.open({
                windowTopClass: "cui-modal",
                templateUrl: template,
                controller,
                controllerAs: controller,
                resolve: {
                    items: () => params
                }
            });

            modal.result.then(() => {
                initIps();
            });
        };

        function displayError (error) {
            CloudMessage.error([$translate.instant("ceph_common_error"), error.data && error.data.message || ""].join(" "));
        }

        init();
    });
