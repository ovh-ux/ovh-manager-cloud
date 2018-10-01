class CdaIpAddCtrl {
  constructor($q, $translate, $uibModalInstance, $stateParams, CloudMessage, OvhApiDedicatedCeph) {
    this.$q = $q;
    this.$translate = $translate;
    this.$uibModalInstance = $uibModalInstance;
    this.serviceName = $stateParams.serviceName;
    this.CloudMessage = CloudMessage;
    this.OvhApiDedicatedCeph = OvhApiDedicatedCeph;

    this.model = {
      ip: null,
    };
    this.saving = false;
    this.messages = [];
    this.messageContainerName = 'paas.cda.ip.add';
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

  createIp() {
    this.saving = true;
    return this.OvhApiDedicatedCeph.Acl().v6().post({
      serviceName: this.serviceName,
    }, {
      aclList: [this.model.ip],
    }).$promise
      .then((result) => {
        this.$uibModalInstance.close({ taskId: result.data });
        this.CloudMessage.success(this.$translate.instant('cda_ip_add_success'));
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

angular.module('managerApp').controller('CdaIpAddCtrl', CdaIpAddCtrl);
