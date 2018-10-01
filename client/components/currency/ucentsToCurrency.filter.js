angular.module('managerApp').filter('ucentsToCurrency', ($filter, CurrencyService) => function (value, intervalParam) {
  let interval = intervalParam;
  if (!_.isNumber(interval)) {
    interval = 1;
  }

  const symbol = CurrencyService.getCurrentCurrency();
  return $filter('currency')((value / interval) / 100000000, symbol);
});
