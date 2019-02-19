class LogsAccountSetupCtrl {
  constructor($q, $state, $stateParams, ControllerHelper, CucCloudMessage, LogsAccountService,
    LogsHomeService, LogsDetailService) {
    this.$q = $q;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.serviceName = this.$stateParams.serviceName;
    this.ControllerHelper = ControllerHelper;
    this.CucCloudMessage = CucCloudMessage;
    this.LogsAccountService = LogsAccountService;
    this.LogsHomeService = LogsHomeService;
    this.LogsDetailService = LogsDetailService;
    this.passwordValid = false;
    this.passwordRules = this.LogsAccountService.getPasswordRules(false);

    this.initLoaders();
  }

  initLoaders() {
    this.service = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.LogsDetailService.getServiceDetails(this.serviceName)
        .then((service) => {
          this.userName = service.username;
          return service;
        }),
    }).load();
    this.accountDetails = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.LogsHomeService.getAccountDetails(this.serviceName)
        .then((account) => {
          this.fullName = `${account.me.firstname} ${account.me.name}`;
          return account;
        }),
    }).load();
  }

  resetPasswordRules() {
    this.passwordRules = this.LogsAccountService.getPasswordRules(true);
  }

  validatePassword() {
    let allValid = true;
    _.each(this.passwordRules, (rule) => {
      _.set(rule, 'isValid', rule.validator(this.newPassword));
      if (allValid) {
        allValid = rule.isValid;
      }
      _.set(rule, 'isValidated', true);
    });
    this.passwordValid = allValid;
  }

  changePassword() {
    if (this.form.$invalid || !this.passwordValid) {
      return this.$q.reject();
    }
    this.CucCloudMessage.flushChildMessage();
    this.saving = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.LogsAccountService
        .changePassword(
          this.serviceName,
          this.newPassword,
          true,
        )
        .then(() => {
          this.$state.go('dbaas.logs.detail.home', { serviceName: this.serviceName }, { reload: true });
        }),
    });
    return this.saving.load();
  }
}

angular.module('managerApp').controller('LogsAccountSetupCtrl', LogsAccountSetupCtrl);
