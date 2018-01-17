angular.module("managerApp")
    .controller("CdaPoolListCtrl", function ($q, $stateParams, $uibModal, $translate, OvhApiDedicatedCeph, CloudMessage) {
        "use strict";

        const self = this;

        self.loading = false;

        self.datas = {
            pools: undefined
        };

        self.modals = {
            add: {
                templateUrl: "app/cda/pool/add/cda-pool-add.html",
                controller: "CdaPoolAddCtrl"
            },
            remove: {
                templateUrl: "app/cda/pool/delete/cda-pool-delete.html",
                controller: "CdaPoolDeleteCtrl"
            }
        };

        function init () {
            self.loading = true;
            initPools()
                .catch(error => {
                    displayError(error);
                }).finally(() => {
                    self.loading = false;
                });
        }

        function initPools () {
            OvhApiDedicatedCeph.Pool().Lexi().resetAllCache();

            return OvhApiDedicatedCeph.Pool().Lexi().query({
                serviceName: $stateParams.serviceName
            }).$promise.then(pools => {
                self.datas.pools = pools;
                return pools;
            });
        }

        self.openAddModal = function () {
            self.openModal(self.modals.add.templateUrl, self.modals.add.controller);
        };

        self.openDeleteModal = function (pool) {
            self.openModal(self.modals.remove.templateUrl, self.modals.remove.controller, { pool });
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
                initPools();
            });
        };

        function displayError (error) {
            CloudMessage.error([$translate.instant("ceph_common_error"), error.data && error.data.message || ""].join(" "));
        }

        init();
    });
