angular.module("managerApp").filter("ucentsToCurrency", function ($filter, CurrencyService) {
    "use strict";

    return function (value, interval) {

        if (!_.isNumber(interval)) {
            interval = 1;
        }

        const symbol = CurrencyService.getCurrentCurrency();
        return $filter("currency")((value / interval) / 100000000, symbol);
    };
});
