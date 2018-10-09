class CurrencyService {
  constructor(OvhApiMe, CURRENCY_SUBSIDIARY, TARGET) {
    this.OvhApiMe = OvhApiMe;
    this.CURRENCY_SUBSIDIARY = CURRENCY_SUBSIDIARY;
    this.TARGET = TARGET;
    this.currency = this.CURRENCY_SUBSIDIARY[this.TARGET];
  }

  getSubsidiary() {
    return this.OvhApiMe.v6().get().$promise
      .then(user => user.ovhSubsidiary);
  }

  loadCurrency() {
    return this.getSubsidiary()
      .then((sub) => {
        const symbol = this.CURRENCY_SUBSIDIARY[sub];
        if (symbol) {
          this.currency = symbol;
        } else {
          this.currency = this.CURRENCY_SUBSIDIARY[this.TARGET];
        }
      });
  }

  getCurrentCurrency() {
    return this.currency;
  }
}

angular.module('managerApp').service('CurrencyService', CurrencyService);
