angular.module("managerApp")
  .controller("CdaPoolDeleteCtrl", function ($uibModalInstance, $translate, $stateParams, $scope, CloudMessage, OvhApiDedicatedCeph) {
      "use strict";

      var self = this;

      self.pool = {};

      self.saving = false;

      function init () {
          self.pool = $scope.$resolve.items.pool;
      }

      self.closeModal = function () {
          $uibModalInstance.dismiss();
      };

      self.deletePool = function () {
          self.saving = true;
          OvhApiDedicatedCeph.Pool().Lexi()["delete"]({
              serviceName: $stateParams.serviceName,
              poolName: self.pool.name
          }).$promise.then(function (result) {
              $uibModalInstance.close({ taskId: result.data });
              CloudMessage.success($translate.instant("cda_pool_delete_success"));
          }).catch(function (error) {
              CloudMessage.error([$translate.instant("ceph_common_error"), error.data && error.data.message || ""].join(" "));
          }).finally(function () {
              self.saving = false;
          });
      };

      init();
  });