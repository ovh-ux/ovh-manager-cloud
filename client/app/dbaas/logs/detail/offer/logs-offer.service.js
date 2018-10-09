class LogsOfferService {
  constructor($translate, ControllerHelper, OvhApiDbaas, ServiceHelper) {
    this.$translate = $translate;
    this.OvhApiDbaasLogsOffer = OvhApiDbaas.Logs().Offer().v6();
    this.ServiceHelper = ServiceHelper;
    this.ControllerHelper = ControllerHelper;
  }

  getOffer(serviceName) {
    return this.OvhApiDbaasLogsOffer.get({
      serviceName,
    }).$promise
      .catch(err => this.LogsHelperService.handleError('logs_offer_load_error', err, {}));
  }

  getOfferDetail(offerCode) {
    return this.OvhApiDbaasLogsOffer.offerDetail({
      offerCode,
    }).$promise;
  }

  showWarning() {
    this.ControllerHelper.modal.showWarningModal({
      title: this.$translate.instant('logs_offer_conflict_title'),
      message: this.$translate.instant('logs_offer_conflict_description'),
    });
  }
}

angular.module('managerApp').service('LogsOfferService', LogsOfferService);
