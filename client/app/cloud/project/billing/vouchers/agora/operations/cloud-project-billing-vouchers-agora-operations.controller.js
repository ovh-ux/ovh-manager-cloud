export default class CloudProjectBillingVouchersOperationsCtrl {
  /* @ngInject */
  constructor($q, $stateParams, $translate, CloudMessage, $uibModal, OvhApiMeBill,
    ControllerHelper, CloudVouchersAgoraService, ServiceHelper, OvhApiOrderCloudProjectCredit) {
    this.$q = $q;
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.CloudMessage = CloudMessage;
    this.$uibModal = $uibModal;
    this.OvhApiMeBill = OvhApiMeBill;
    this.ControllerHelper = ControllerHelper;
    this.CloudVouchersAgoraService = CloudVouchersAgoraService;
    this.ServiceHelper = ServiceHelper;
    this.OvhApiOrderCloudProjectCredit = OvhApiOrderCloudProjectCredit;
  }

  $onInit() {
    this.balanceName = this.$stateParams.balanceName;
    return this.getMovements().load()
      .then((movements) => {
        this.movements = movements;
      });
  }

  getMovements() {
    return this.ControllerHelper.request.getArrayLoader({
      loaderFunction: () => this.CloudVouchersAgoraService.getMovements(this.balanceName)
        .then(movements => movements.map(movementId => ({ movementId }))),
      errorHandler: error => this.CloudMessage.error({
        text: `${this.$translate.instant('cpb_vouchers_get_error')} ${error.data.message}`,
      }),
    });
  }

  getMovement({ movementId }) {
    return this.CloudVouchersAgoraService.getMovement(this.balanceName, movementId);
  }
}

angular.module('managerApp').controller('CloudProjectBillingVouchersOperationsCtrl', CloudProjectBillingVouchersOperationsCtrl);
