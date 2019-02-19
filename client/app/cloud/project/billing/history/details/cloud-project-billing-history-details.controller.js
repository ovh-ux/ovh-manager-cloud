angular.module('managerApp').controller('CloudProjectBillingHistoryDetailsCtrl',
  function CloudProjectBillingHistoryDetailsCtrl($state, $q, $translate, $stateParams, validParams,
    CucCloudMessage, CloudProjectBillingService, OvhApiCloudProjectUsageHistory,
    OvhApiCloudProjectUsageCurrent, OvhApiCloudProject, OvhApiMe, REDIRECT_URLS) {
    const self = this;
    self.year = null;
    self.month = null;
    self.data = {};
    self.monthBilling = null;
    self.billingUrl = REDIRECT_URLS.billing;

    self.getHourlyBillingDateInfo = function () {
      const prev = moment(self.monthBilling).subtract(1, 'month');
      return {
        month: prev.format('MMMM'),
        year: prev.year(),
      };
    };

    self.getBillingDateInfo = function () {
      return {
        month: self.monthBilling.format('MMMM'),
        year: self.monthBilling.year(),
      };
    };

    function getConsumptionDetails(periods) {
      const detailPromises = _.map(periods, period => OvhApiCloudProjectUsageHistory.v6().get({
        serviceName: $stateParams.projectId,
        usageId: period.id,
      }).$promise);

      return $q.all(detailPromises)
        .then((periodDetails) => {
          let monthlyDetails;

          if (moment.utc().isSame(self.monthBilling, 'month')) {
            monthlyDetails = OvhApiCloudProjectUsageCurrent.v6()
              .get({ serviceName: $stateParams.projectId }).$promise;
          } else {
            monthlyDetails = _.find(periodDetails, detail => moment.utc(detail.period.from).isSame(self.monthBilling, 'month'));
          }

          const hourlyDetails = _.find(
            periodDetails,
            detail => moment.utc(detail.period.from).isSame(self.previousMonth, 'month'),
          );

          return {
            hourly: hourlyDetails,
            monthly: monthlyDetails,
          };
        })
        .then(details => $q.all(details)
          .then(allDetails => CloudProjectBillingService.getConsumptionDetails(
            allDetails.hourly, allDetails.monthly,
          )));
    }

    function initConsumptionHistory() {
      return OvhApiCloudProjectUsageHistory.v6().query({
        serviceName: $stateParams.projectId,
        from: self.previousMonth.format(),
        to: self.monthBilling.format(),
      }).$promise
        .then(historyPeriods => getConsumptionDetails(historyPeriods))
        .then((details) => {
          self.data = details;
        });
    }

    function init() {
      self.loading = true;

      self.year = validParams.year;
      self.month = validParams.month;

      self.monthBilling = moment.utc({ y: validParams.year, M: validParams.month - 1, d: 1 });
      self.previousMonth = moment.utc(self.monthBilling).subtract(1, 'month');

      initConsumptionHistory()
        .catch((err) => {
          CucCloudMessage.error([$translate.instant('cpb_error_message'), (err.data && err.data.message) || ''].join(' '));
          return $q.reject(err);
        })
        .finally(() => {
          self.loading = false;
        });
    }

    init();
  });
