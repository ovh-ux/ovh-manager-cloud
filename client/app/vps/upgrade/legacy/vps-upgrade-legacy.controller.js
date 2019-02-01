export default class VpsUpgradeLegacyCtrl {
  constructor($filter, $stateParams, $state, $translate, $q, $window, CloudMessage, CloudNavigation,
    ControllerHelper, VpsService) {
    this.$filter = $filter;
    this.$translate = $translate;
    this.$q = $q;
    this.$window = $window;
    this.CloudMessage = CloudMessage;
    this.CloudNavigation = CloudNavigation;
    this.ControllerHelper = ControllerHelper;
    this.serviceName = $stateParams.serviceName;
    this.Vps = VpsService;

    this.loaders = {
      step1: false,
      step2: false,
    };

    this.completed = {
      step1: false,
      step2: false,
    };
    this.order = null;
    this.selectedModel = {};
    this.upgradesList = null;
  }

  gotoPreviousState() {
    return this.CloudNavigation.getPreviousState().go();
  }

  getCurrentModel() {
    return _.find(this.upgradesList, upgrade => upgrade.isCurrentModel === true);
  }

  validateStep1() {
    if (this.selectedModel.model === this.getCurrentModel().model) {
      const title = this.$translate.instant('vps_warning_title');
      const message = this.$translate.instant('vps_configuration_upgradevps_step1_warning');

      this.ControllerHelper.modal.showWarningModal({ title, message });
      throw new Error(message);
    } else {
      this.completed.step1 = true;
    }
  }

  loadUpgradesList() {
    if (!this.upgradesList) {
      this.loaders.step1 = true;
      return this.Vps.upgradesList(this.serviceName).then((data) => {
        this.upgradesList = data.results;
        this.selectedModel.model = this.getCurrentModel().model;
        return data;
      }).catch((err) => {
        this.$q.reject(err);
        if (err.message) {
          this.CloudMessage.error(err.message);
        } else {
          this.CloudMessage.error(this.$translate.instant('vps_configuration_upgradevps_fail'));
        }
        this.gotoPreviousState();
      }).finally(() => {
        this.loaders.step1 = false;
      });
    }
    return this.$q.when();
  }

  initVpsConditions() {
    this.conditionsAgree = false;
    this.loaders.step2 = true;
    this.order = null;
    const modelToUpgradeTo = _.find(this.upgradesList, e => e.model === _.first(this.selectedModel.model.split(':')) && e.name === this.selectedModel.model.split(':')[1]);

    if (_.isEmpty(modelToUpgradeTo)) {
      return this.$q.when(true);
    }

    this.selectedModelForUpgrade = modelToUpgradeTo;

    return this.Vps
      .upgrade(
        this.serviceName,
        this.selectedModelForUpgrade.model,
        this.selectedModelForUpgrade.duration.duration,
      )
      .then((data) => {
        this.conditionsAgree = false;
        this.selectedModelForUpgrade.duration.dateFormatted = this.$filter('date')(this.selectedModelForUpgrade.duration.date, 'dd/MM/yyyy');
        this.order = data;
        return data;
      })
      .catch((err) => {
        this.$q.reject(err);
        if (err.message) {
          this.CloudMessage.error(err.message);
        } else {
          this.CloudMessage.error(this.$translate.instant('vps_configuration_upgradevps_fail'));
        }
      })
      .finally(() => {
        this.loaders.step2 = false;
      });
  }

  cancel() {
    this.gotoPreviousState();
  }

  confirm() {
    this.displayBC();
  }

  displayBC() {
    this.$window.open(
      this.order.url,
      '_blank',
    );
  }
}
