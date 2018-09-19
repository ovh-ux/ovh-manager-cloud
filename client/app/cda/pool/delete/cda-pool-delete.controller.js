angular.module('managerApp')
  .controller('CdaPoolDeleteCtrl', function ($uibModalInstance, $translate, $stateParams, $scope, CloudMessage, OvhApiDedicatedCeph) {
    const self = this;

    self.pool = {};

    self.saving = false;

    function init() {
      self.pool = $scope.$resolve.items.pool;
    }

    self.closeModal = function () {
      $uibModalInstance.dismiss();
    };

    self.deletePool = function () {
      self.saving = true;
      OvhApiDedicatedCeph.Pool().v6().delete({
        serviceName: $stateParams.serviceName,
        poolName: self.pool.name,
      }).$promise.then((result) => {
        $uibModalInstance.close({ taskId: result.data });
        CloudMessage.success($translate.instant('cda_pool_delete_success'));
      }).catch((error) => {
        CloudMessage.error([$translate.instant('ceph_common_error'), (error.data && error.data.message) || ''].join(' '));
      }).finally(() => {
        self.saving = false;
      });
    };

    init();
  });
