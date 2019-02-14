import { PCI_LEGACY_PLANCODES } from './cloud-project-billing.constant';

export default class CloudProjectBillingAgoraService {
  /* @ngInject */
  constructor(
    OvhApiCloudProject,
    OvhApiMeConsumption,
    OvhApiServiceRenewForecast,
  ) {
    this.OvhApiCloudProject = OvhApiCloudProject;
    this.OvhApiMeConsumption = OvhApiMeConsumption;
    this.OvhApiServiceRenewForecast = OvhApiServiceRenewForecast;
  }

  getIfProjectUsesAgora(serviceName) {
    return this.OvhApiCloudProject.v6().get({ serviceName }).$promise
      .then(({ planCode }) => !PCI_LEGACY_PLANCODES.includes(planCode));
  }

  getProjectServiceInfos(serviceName) {
    return this.OvhApiCloudProject.ServiceInfos().v6().get({ serviceName }).$promise;
  }

  getCurrentForecast(serviceId) {
    return this.OvhApiMeConsumption.Usage().Forecast().v6().get().$promise
      .then(forecast => _.find(forecast, { serviceId }));
  }

  getCurrentConsumption(serviceId) {
    return this.OvhApiMeConsumption.Usage().Current().v6().get().$promise
      .then(consumption => _.find(consumption, { serviceId }));
  }

  getBillForecast(serviceId) {
    return this.OvhApiServiceRenewForecast.v6()
      .get({ serviceId, includeOptions: true }).$promise;
  }

  static formatPrice(value, currencyCode) {
    return ({
      value,
      text: `${value.toFixed(2)} ${currencyCode}`,
    });
  }

  formatEmptyPrice(currencyCode) {
    return this.constructor.formatPrice(0, currencyCode);
  }
}

angular.module('managerApp').service('CloudProjectBillingAgoraService', CloudProjectBillingAgoraService);
