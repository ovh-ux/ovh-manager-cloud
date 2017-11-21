angular.module("managerApp").run(CurrencyService => {
    CurrencyService.loadCurrency();
});
