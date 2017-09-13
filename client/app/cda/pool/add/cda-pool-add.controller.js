angular.module("managerApp")
  .controller("CdaPoolAddCtrl", function ($q, $scope, $uibModalInstance, $translate, $stateParams, Toast, OvhApiDedicatedCeph) {
      "use strict";

      var self = this;
      self.model = {
          poolName: ""
      };

      self.options = {
          poolName: {
              maxLength: 50,
              pattern: /^[!\S]*$/
          }
      };

      self.saving = false;

      self.createPool = function () {
          self.saving = true;
          return OvhApiDedicatedCeph.Pool().Lexi().post({
              serviceName: $stateParams.serviceName
          }, {
              poolName: self.model.poolName
          }).$promise.then(function (result) {
              $uibModalInstance.close({ poolName: self.model.poolName, taskId: result.data });
              Toast.success($translate.instant("cda_pool_add_success"));
          }).catch(function (error) {
              Toast.error([$translate.instant("ceph_common_error"), error.data && error.data.message || ""].join(" "));
          }).finally(function () {
              self.saving = false;
          });
      };

      self.closeModal = function () {
          $uibModalInstance.dismiss();
      };
  });