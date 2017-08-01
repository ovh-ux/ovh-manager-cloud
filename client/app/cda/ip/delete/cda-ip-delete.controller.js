angular.module("managerApp")
  .controller("CdaIpDeleteCtrl", function ($uibModalInstance, $translate, $stateParams, $scope, Toast, DedicatedCeph) {
      "use strict";

      var self = this;

      self.ip = {};

      self.saving = false;

      function init () {
          self.ip = $scope.$resolve.items.ip;
      }

      self.closeModal = function () {
          $uibModalInstance.dismiss();
      };

      self.deleteIp = function () {
          self.saving = true;
          DedicatedCeph.Acl().Lexi()["delete"]({
              serviceName: $stateParams.serviceName,
              aclId: self.ip.id
          }).$promise.then(function (result) {
              $uibModalInstance.close({ taskId: result.data });
              Toast.success($translate.instant("cda_ip_delete_success"));
          }).catch(function (error) {
              Toast.error([$translate.instant("ceph_common_error"), error.data && error.data.message || ""].join(" "));
          }).finally(function () {
              self.saving = false;
          });
      };

      init();
  });