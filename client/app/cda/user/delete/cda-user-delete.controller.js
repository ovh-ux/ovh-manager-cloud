angular.module("managerApp")
  .controller("CdaUserDeleteCtrl", function ($uibModalInstance, $translate, $stateParams, $scope, Toast, DedicatedCeph) {
      "use strict";
      var self = this;

      self.user = {};

      self.saving = false;

      function init () {
          self.user = $scope.$resolve.items.user;
      }

      self.closeModal = function () {
          $uibModalInstance.dismiss();
      };

      self.deleteUser = function () {
          self.saving = true;
          DedicatedCeph.User().Lexi()["delete"]({
              serviceName: $stateParams.serviceName,
              userName: self.user.name
          }).$promise.then(function (result) {
              $uibModalInstance.close({ taskId: result.data });
              Toast.success($translate.instant("cda_user_delete_success"));
          }).catch(function (error) {
              Toast.error([$translate.instant("ceph_common_error"), error.data && error.data.message || ""].join(" "));
          }).finally(function () {
              self.saving = false;
          });
      };

      init();
  });