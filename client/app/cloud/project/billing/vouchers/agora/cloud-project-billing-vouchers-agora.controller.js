angular.module('managerApp')
  .controller('CloudProjectBillingVouchersCtrl', class {
  /* @ngInject */
    constructor($state, $translate, $uibModal,
      CloudMessage, CloudVouchersAgoraService, ControllerHelper) {
      this.$state = $state;
      this.$translate = $translate;
      this.$uibModal = $uibModal;
      this.CloudMessage = CloudMessage;
      this.CloudVouchersAgoraService = CloudVouchersAgoraService;
      this.ControllerHelper = ControllerHelper;
    }

    $onInit() {
      return this.getBalances().load()
        .then((balances) => {
          this.balances = balances;
        });
    }

    getBalances() {
      return this.ControllerHelper.request.getArrayLoader({
        loaderFunction: () => this.CloudVouchersAgoraService.getBalances()
          .then(balances => balances.map(balanceName => ({ balanceName }))),
        errorHandler: error => this.CloudMessage.error({
          text: `${this.$translate.instant('cpb_credit_balance_load_error')} ${error.data.message}`,
        }),
      });
    }

    getBalance({ balanceName }) {
      return this.CloudVouchersAgoraService.getBalance(balanceName)
        .then(balance => ({
          ...balance,
          closestExpiringDetails: _.isEmpty(balance.expiring)
            ? {}
            : this.CloudVouchersAgoraService.constructor.getClosestExpiringDetails(balance),
        }));
    }

    addCredit() {
      return this.$uibModal.open({
        windowTopClass: 'cui-modal',
        templateUrl: 'app/cloud/project/billing/vouchers/agora/addCredit/cloud-project-billing-vouchers-add-credit-agora.html',
        controller: 'CloudProjectBillingVouchersAddcreditAgoraCtrl',
        controllerAs: '$ctrl',
      });
    }
  });
