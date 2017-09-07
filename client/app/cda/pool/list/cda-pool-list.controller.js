angular.module("managerApp")
  .controller("CdaPoolListCtrl", function ($q, $stateParams, $uibModal, $translate, OvhApiDedicatedCeph, Toast) {
      "use strict";

      var self = this;

      self.loading = false;

      self.datas = {
          pools: []
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
          initPools().catch(function (error) {
              displayError(error);
          }).finally(function () {
              self.loading = false;
          });
      }

      function initPools () {
          OvhApiDedicatedCeph.Pool().Lexi().resetAllCache();

          return OvhApiDedicatedCeph.Pool().Lexi().query({
              serviceName: $stateParams.serviceName
          }).$promise.then(function (pools) {
              self.datas.pools = pools;
              return pools;
          });
      }

      self.openAddModal = function () {
          self.openModal(self.modals.add.templateUrl, self.modals.add.controller);
      };

      self.openDeleteModal = function (pool) {
          self.openModal(self.modals.remove.templateUrl, self.modals.remove.controller, { pool: pool });
      };

      self.openModal = function (template, controller, params) {
          var modal = $uibModal.open({
              templateUrl: template,
              controller: controller,
              controllerAs: controller,
              resolve: {
                  items: function () {
                      return params;
                  }
              }
          });

          modal.result.then(function () {
              initPools();
          });
      };

      function displayError (error) {
          Toast.error([$translate.instant("ceph_common_error"), error.data && error.data.message || ""].join(" "));
      }

      init();
  });