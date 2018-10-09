class CdaDetailEditCtrl {
  constructor($uibModalInstance, $translate, $stateParams, CloudMessage, CdaService, items) {
    this.$uibModalInstance = $uibModalInstance;
    this.$translate = $translate;
    this.serviceName = $stateParams.serviceName;
    this.CloudMessage = CloudMessage;
    this.CdaService = CdaService;
    this.items = items;
    this.messageContainerName = 'paas.cda.detail.edit';

    this.model = {
      label: items.details.label,
      crushTunable: items.details.crushTunables,
    };
    this.options = {
      label: {
        maxLength: 25,
      },
    };
    this.crushTunableValues = items.crushTunablesOptions;
    this.saving = false;
    this.messages = [];
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

  editCluster() {
    this.CloudMessage.flushMessages(this.messageContainerName);
    this.saving = true;
    return this.CdaService
      .updateDetails(this.serviceName, this.model.label, this.model.crushTunable)
      .then(() => {
        this.CloudMessage.success(this.$translate.instant('cda_detail_edit_success'));
        this.$uibModalInstance.close();
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

angular.module('managerApp').controller('CdaDetailEditCtrl', CdaDetailEditCtrl);
