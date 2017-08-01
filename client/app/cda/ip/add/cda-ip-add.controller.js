angular.module("managerApp")
  .controller("CdaIpAddCtrl", function ($q, $scope, $uibModalInstance, $translate, $stateParams, Toast, DedicatedCeph) {
      "use strict";

      var self = this;
      self.model = {
          ip: ""
      };

      self.saving = false;

      self.createIp = function () {
          self.saving = true;
          return DedicatedCeph.Acl().Lexi().post({
              serviceName: $stateParams.serviceName
          }, {
              aclList: [self.model.ip]
          }).$promise.then(function (result) {
              $uibModalInstance.close({ taskId: result.data });
              Toast.success($translate.instant("cda_ip_add_success"));
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