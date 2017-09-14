angular.module("managerApp")
  .controller("CdaUserAddCtrl", function ($q, $scope, $uibModalInstance, $translate, $stateParams, Toast, OvhApiDedicatedCeph) {
      "use strict";

      var self = this;
      self.model = {
          userName: ""
      };

      self.options = {
          userName: {
              maxLength: 50,
              pattern: /^[!\S]*$/
          }
      };

      self.saving = false;

      self.createUser = function () {
          self.saving = true;
          return OvhApiDedicatedCeph.User().Lexi().post({
              serviceName: $stateParams.serviceName
          }, {
              userName: self.model.userName
          }).$promise.then(function (result) {
              $uibModalInstance.close({ userName: self.model.userName, taskId: result.data });
              Toast.success($translate.instant("cda_user_add_success"));
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