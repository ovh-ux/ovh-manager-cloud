export default class CloudProjectBillingConsumptionEstimateCtrl {
  /* @ngInject */
  constructor(
    $q,
    $stateParams,
    $translate,
    $uibModal,
    CucCloudMessage,
    CloudProjectBillingAgoraService,
    CloudProjectBillingService,
    OvhApiCloudProjectAlerting,
    OvhApiCloudProjectUsageCurrent,
    OvhApiCloudProjectUsageForecast,
  ) {
    this.$q = $q;
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.$uibModal = $uibModal;
    this.CucCloudMessage = CucCloudMessage;
    this.CloudProjectBillingAgoraService = CloudProjectBillingAgoraService;
    this.CloudProjectBillingService = CloudProjectBillingService;
    this.OvhApiCloudProjectAlerting = OvhApiCloudProjectAlerting;
    this.OvhApiCloudProjectUsageCurrent = OvhApiCloudProjectUsageCurrent;
    this.OvhApiCloudProjectUsageForecast = OvhApiCloudProjectUsageForecast;
  }

  $onInit() {
    this.serviceName = this.$stateParams.projectId;
    this.loading = false;
    this.forecast = {
      currencySymbol: null,
      alert: null,
      estimateTotals: null,
      currentTotals: null,
    };
    this.loaders = {
      alert: false,
      forecast: true,
      current: false,
      deleteAlert: false,
    };

    return this.CloudProjectBillingAgoraService.getIfProjectUsesAgora(this.serviceName)
      .then(projectUsesAgora => (projectUsesAgora
        ? this.getAgoraForecast()
        : this.getLegacyForecast()))
      .then(() => this.initAlert())
      .catch((err) => {
        this.CucCloudMessage.error([this.$translate.instant('cpbe_estimate_price_error_message'), (err.data && err.data.message) || ''].join(' '));
      })
      .finally(() => {
        this.loaders.forecast = false;
      });
  }

  static getCurrentMonth() {
    return moment();
  }

  static getNextMonth() {
    return moment().add(1, 'month');
  }

  getLegacyForecast() {
    return this.$q.all({
      current: this.initCurrent(),
      forecast: this.initForecast(),
    });
  }

  getAgoraForecast() {
    return this.CloudProjectBillingAgoraService.getProjectServiceInfos(this.serviceName)
      .then(({ serviceId }) => this.$q.all({
        billForecast: this.CloudProjectBillingAgoraService.getBillForecast(serviceId),
        hourlyForecast: this.CloudProjectBillingAgoraService.getCurrentForecast(serviceId),
        consumption: this.CloudProjectBillingAgoraService.getCurrentConsumption(serviceId),
      }))
      .then(({ billForecast, hourlyForecast, consumption }) => {
        this.forecast.currentTotals = {
          total: billForecast.price.value + consumption.price.value,
          hourly: {
            total: consumption.price.value,
          },
          monthly: {
            total: billForecast.price.value,
          },
        };
        this.forecast.estimateTotals = {
          total: billForecast.price.value + consumption.price.value,
          hourly: {
            total: hourlyForecast.price.value,
          },
          monthly: {
            total: billForecast.price.value,
          },
        };
        this.forecast.currencySymbol = hourlyForecast.price.currencyCode;
      });
  }

  initForecast() {
    return this.OvhApiCloudProjectUsageForecast.v6()
      .get({
        serviceName: this.$stateParams.projectId,
      }).$promise
      .then(billingInfo => this.CloudProjectBillingService
        .getConsumptionDetails(billingInfo, billingInfo)
        .then((data) => {
          this.forecast.estimateTotals = data.totals;
          this.forecast.currencySymbol = this.forecast.estimateTotals.currencySymbol;
        })
        .finally(() => {
          this.loaders.forecast = false;
        }));
  }

  initCurrent() {
    this.loaders.current = true;
    return this.OvhApiCloudProjectUsageCurrent.v6()
      .get({
        serviceName: this.$stateParams.projectId,
      }).$promise
      .then(billingInfo => this.CloudProjectBillingService.getConsumptionDetails(
        billingInfo,
        billingInfo,
      ))
      .then((data) => {
        this.forecast.currentTotals = data.totals;
      })
      .finally(() => {
        this.loaders.current = false;
      });
  }

  getAlertIds() {
    this.OvhApiCloudProjectAlerting.v6().resetCache();
    return this.OvhApiCloudProjectAlerting.v6().getIds({
      serviceName: this.$stateParams.projectId,
    }).$promise;
  }

  getAlert(id) {
    return this.OvhApiCloudProjectAlerting.v6().get({
      serviceName: this.$stateParams.projectId,
      alertId: id,
    }).$promise
      .catch(() => {
        // We dont rethrow or show a message to hide an API glitch.
        this.forecast.alert = null;
        return null;
      });
  }

  initConsumptionChart() {
    const labelNow = this.$translate.instant('cpbe_estimate_alert_chart_label_now');
    const labelFuture = this.$translate.instant('cpbe_estimate_alert_chart_label_future');
    const labelLimit = this.$translate.instant('cpbe_estimate_alert_chart_label_limit');

    this.consumptionChartData = {
      estimate: {
        now: {
          value: this.forecast.currentTotals.hourly.total,
          currencyCode: this.forecast.estimateTotals.currencySymbol,
          label: labelNow,
        },
        endOfMonth: {
          value: this.forecast.estimateTotals.hourly.total,
          currencyCode: this.forecast.estimateTotals.currencySymbol,
          label: labelFuture,
        },
      },
      threshold: {
        now: {
          value: this.forecast.alert.monthlyThreshold,
          currencyCode: this.forecast.estimateTotals.currencySymbol,
          label: labelLimit,
        },
        endOfMonth: {
          value: this.forecast.alert.monthlyThreshold,
          currencyCode: this.forecast.estimateTotals.currencySymbol,
          label: labelLimit,
        },
      },
    };
  }

  initAlert() {
    // list alerts ids
    return this.getAlertIds()
      .then((alertIds) => {
        if (_.isEmpty(alertIds)) {
          return null;
        }
        return this.getAlert(_.first(alertIds));
      })
      .then((alertObject) => {
        this.forecast.alert = alertObject;
        if (!_.isNull(alertObject)) {
          this.initConsumptionChart();
        }
      }).finally(() => {
        this.loaders.alert = false;
      });
  }

  openAlertAddModal() {
    const modal = this.$uibModal.open({
      windowTopClass: 'cui-modal',
      templateUrl: 'app/cloud/project/billing/consumption/estimate/alert/add/cloud-project-billing-consumption-estimate-alert-add.html',
      controller: 'CloudProjectBillingConsumptionEstimateAlertAddCtrl',
      controllerAs: 'CloudProjectBillingConsumptionEstimateAlertAddCtrl',
      resolve: {
        dataContext: () => this.forecast,
      },
    });

    modal.result.then(() => {
      this.initAlert();
    });
  }

  deleteAlert() {
    this.loaders.deleteAlert = true;
    // we query alerts to check if an alert already exists, in this case we delete it
    this.OvhApiCloudProjectAlerting.v6().getIds({
      serviceName: this.$stateParams.projectId,
    }).$promise.then((alertIds) => {
      if (!_.isEmpty(alertIds)) {
        return this.OvhApiCloudProjectAlerting.v6().delete({
          serviceName: this.$stateParams.projectId,
          alertId: _.first(alertIds),
        }).$promise.then(() => {
          this.CucCloudMessage.success(this.$translate.instant('cpbe_estimate_alert_delete_success'));
        });
      }
      return this.$q.reject({ data: { message: 'Alert not found' } });
    }).catch((err) => {
      this.CucCloudMessage.error([this.$translate.instant('cpbe_estimate_alert_delete_error'), (err.data && err.data.message) || ''].join(' '));
      return this.$q.reject(err);
    }).finally(() => {
      this.loaders.deleteAlert = false;
    });

    return this.initAlert();
  }
}

angular.module('managerApp').controller('CloudProjectBillingConsumptionEstimateCtrl', CloudProjectBillingConsumptionEstimateCtrl);
