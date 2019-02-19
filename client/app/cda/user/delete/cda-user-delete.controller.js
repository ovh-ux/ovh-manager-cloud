angular.module('managerApp')
  .controller('CdaUserDeleteCtrl', function ($uibModalInstance, $translate, $stateParams, $scope, CucCloudMessage, OvhApiDedicatedCeph) {
    const self = this;

    self.user = {};

    self.saving = false;

    function init() {
      self.user = $scope.$resolve.items.user;
    }

    self.closeModal = function () {
      $uibModalInstance.dismiss();
    };

    self.deleteUser = function () {
      self.saving = true;
      OvhApiDedicatedCeph.User().v6().delete({
        serviceName: $stateParams.serviceName,
        userName: self.user.name,
      }).$promise.then((result) => {
        $uibModalInstance.close({ taskId: result.data });
        CucCloudMessage.success($translate.instant('cda_user_delete_success'));
      }).catch((error) => {
        CucCloudMessage.error([$translate.instant('ceph_common_error'), (error.data && error.data.message) || ''].join(' '));
      }).finally(() => {
        self.saving = false;
      });
    };

    init();
  });
