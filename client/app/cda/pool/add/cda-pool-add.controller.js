class CdaPoolAddCtrl {
  constructor($q, $translate, $uibModalInstance, $stateParams, CloudMessage, OvhApiDedicatedCeph) {
    this.$q = $q;
    this.$translate = $translate;
    this.$uibModalInstance = $uibModalInstance;
    this.serviceName = $stateParams.serviceName;
    this.CloudMessage = CloudMessage;
    this.OvhApiDedicatedCeph = OvhApiDedicatedCeph;

    this.model = {
      poolName: null,
    };
    this.options = {
      poolName: {
        maxLength: 50,
        pattern: /^[\w]+$/,
      },
    };
    this.saving = false;
    this.messages = [];
    this.messageContainerName = 'paas.cda.pool.add';
  }

  $onInit() {
    this.loadMessage();
  }

  loadMessage() {
    this.CloudMessage.unSubscribe(this.messageContainerName);
    this.messageHandler = this.CloudMessage.subscribe(
      this.messageContainerName,
      { onMessage: () => this.refreshMessage() },
    );
  }

  refreshMessage() {
    this.messages = this.messageHandler.getMessages();
  }

  createPool() {
    this.saving = true;
    return this.OvhApiDedicatedCeph.Pool().v6().post({
      serviceName: this.serviceName,
    }, {
      poolName: this.model.poolName,
    }).$promise
      .then((result) => {
        this.$uibModalInstance.close({ poolName: this.model.poolName, taskId: result.data });
        this.CloudMessage.success(this.$translate.instant('cda_pool_add_success'));
      })
      .catch((error) => {
        this.CloudMessage.error(`${this.$translate.instant('ceph_common_error')} ${(error.data && error.data.message) || ''}`, this.messageContainerName);
      })
      .finally(() => { this.saving = false; });
  }

  closeModal() {
    this.$uibModalInstance.dismiss();
  }
}

angular.module('managerApp').controller('CdaPoolAddCtrl', CdaPoolAddCtrl);
