angular.module("managerApp")
  .controller("CdaPoolDeleteCtrl", function ($uibModalInstance, $translate, $stateParams, $scope, Toast, DedicatedCeph) {
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
          DedicatedCeph.Pool().Lexi()["delete"]({
              serviceName: $stateParams.serviceName,
              poolName: self.pool.name
          }).$promise.then(function (result) {
              $uibModalInstance.close({ taskId: result.data });
              Toast.success($translate.instant("cda_pool_delete_success"));
          }).catch(function (error) {
              Toast.error([$translate.instant("ceph_common_error"), error.data && error.data.message || ""].join(" "));
          }).finally(function () {
              self.saving = false;
          });
      };

      init();
  });