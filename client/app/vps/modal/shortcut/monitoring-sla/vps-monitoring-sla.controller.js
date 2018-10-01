class VpsMonitoringSlaCtrl {
  constructor($translate, $uibModalInstance, ControllerHelper, CloudMessage, preview, serviceName,
    state, VpsService) {
    this.$translate = $translate;
    this.$uibModalInstance = $uibModalInstance;
    this.CloudMessage = CloudMessage;
    this.serviceName = serviceName;
    this.preview = preview;
    this.state = state;
    this.VpsService = VpsService;
    this.ControllerHelper = ControllerHelper;
    this.currentState = !this.state;
    this.title = this.$translate.instant('vps_configuration_sla_title_enable');
    this.vps = {};
  }

  $onInit() {
    if (this.currentState) {
      this.title = this.$translate.instant('vps_configuration_sla_title_disable');
    }
    if (this.preview) {
      this.title = this.$translate.instant('vps_dashboard_monitoring_sla_ips');
    }
    this.selectedVps = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.VpsService.getSelectedVps(this.serviceName)
        .then((vps) => { this.vps = vps; })
        .catch(err => this.CloudMessage.error(err)),
    });
    return this.selectedVps.load();
  }

  cancel() {
    this.$uibModalInstance.dismiss();
  }

  confirm() {
    this.save = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.VpsService.update(this.serviceName, { slaMonitoring: this.state })
        .then(() => this.CloudMessage.success(this.$translate.instant(`vps_configuration_monitoring_sla_ok_${this.state}`)))
        .catch(() => this.CloudMessage.error(this.$translate.instant(`vps_configuration_monitoring_sla_error_${this.state}`)))
        .finally(() => this.$uibModalInstance.close()),
    });
    return this.save.load();
  }
}

angular.module('managerApp').controller('VpsMonitoringSlaCtrl', VpsMonitoringSlaCtrl);
