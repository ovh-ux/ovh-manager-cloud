angular.module('managerApp')
  .service('CloudVouchersAgoraService', class {
  /* @ngInject */
    constructor(OvhApiMe, OvhApiOrderCatalogFormatted, PCI_VOUCHER_PREFIX) {
      this.OvhApiMe = OvhApiMe;
      this.OvhApiOrderCatalogFormatted = OvhApiOrderCatalogFormatted;
      this.PCI_VOUCHER_PREFIX = PCI_VOUCHER_PREFIX;
    }

    getBalances() {
      return this.OvhApiMe.Credit().Balance().v6().query().$promise
        .then(balances => balances.filter(
          balanceName => balanceName.startsWith(this.PCI_VOUCHER_PREFIX),
        ));
    }

    getBalance(balanceName) {
      return this.OvhApiMe.Credit().Balance().v6().get({ balanceName }).$promise;
    }

    getMovements(balanceName) {
      return this.OvhApiMe.Credit().Balance().Movement().v6()
        .query({ balanceName }).$promise;
    }

    getMovement(balanceName, movementId) {
      return this.OvhApiMe.Credit().Balance().Movement().v6()
        .get({ balanceName, movementId }).$promise;
    }

    getCloudCatalog(subsidiary) {
      return this.OvhApiOrderCatalogFormatted.v6().get({ catalogName: 'cloud', ovhSubsidiary: subsidiary }).$promise;
    }

    activateCreditCode(code) {
      return this.OvhApiMe.Credit().Code().v6().save({ inputCode: code }).$promise;
    }

    static getClosestExpiringDetails(balance) {
      const [firstExpiringDetails, ...expiringDetails] = balance.expiring;
      return expiringDetails.reduce(
        (closestExpiringDetails, balanceDetails) => (
          moment(balanceDetails.expirationDate).isBefore(closestExpiringDetails.expirationDate)
            ? balanceDetails : closestExpiringDetails),
        firstExpiringDetails,
      );
    }
  });
