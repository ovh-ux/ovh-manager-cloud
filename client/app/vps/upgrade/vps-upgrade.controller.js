class VpsUpgradeCtrl {
    constructor ($filter, $stateParams, $state, $translate, $q, $window, CloudMessage, CloudNavigation, VpsService) {
        this.$filter = $filter;
        this.$translate = $translate;
        this.$q = $q;
        this.$window = $window;
        this.CloudMessage = CloudMessage;
        this.CloudNavigation = CloudNavigation;
        this.serviceName = $stateParams.serviceName;
        this.Vps = VpsService;

        this.loaders = {
            init: false
        };

        this.step = 0;
        this.order = null;
        this.selectedModel = {};
        this.upgradesList = null;
    }

    $onInit () {
        this.previousState = this.CloudNavigation.getPreviousState();
        this.loaders.init = true;
        this.loadNextStep();
    }

    loadNextStep (step) {
        this.step = step || this.step + 1;
    }

    getCurrentModel () {
        return _.find(this.upgradesList, upgrade => upgrade.isCurrentModel === true);
    }

    loadUpgradesList () {
        this.loaders.step1 = true;
        if (!this.upgradesList) {
            return this.Vps.upgradesList(this.serviceName).then(data => {
                this.upgradesList = data.results;
                return data;
            }).catch(err => {
                if (err.message) {
                    this.CloudMessage.error(err.message);
                } else {
                    this.CloudMessage.error(this.$translate.instant("vps_configuration_upgradevps_fail"));
                }
                this.previousState.go();
            }).finally(() => {
                this.loaders.step1 = false;
            });
        }
    }

    initVpsConditions () {
        this.conditionsAgree = false;
        this.loaders.step2 = true;
        this.order = null;
        const modelToUpgradeTo = $.grep(this.upgradesList, e => { return e.model === this.selectedModel.model; });
        if (modelToUpgradeTo.length) {
            this.selectedModelForUpgrade = modelToUpgradeTo[0];
            return this.Vps.upgrade(this.serviceName, this.selectedModelForUpgrade.model, this.selectedModelForUpgrade.duration.duration).then(data => {
                this.conditionsAgree = false;
                this.selectedModelForUpgrade.duration.dateFormatted = this.$filter("date")(this.selectedModelForUpgrade.duration.date, "dd/MM/yyyy");
                this.order = data;
                return data;
            }).catch(err => {
                if (err.message) {
                    this.CloudMessage.error(err.message);
                } else {
                    this.CloudMessage.error(this.$translate.instant("vps_configuration_upgradevps_fail"));
                }
            }).finally(() => {
                this.loaders.step2 = false;
            });
        }
    }

    cancel () {
        this.previousState.go();
    }

    confirm () {
        this.displayBC();
    }

    displayBC () {
        this.$window.open(
            this.order.url,
            "_blank"
        );
    }

}

angular.module("managerApp").controller("VpsUpgradeCtrl", VpsUpgradeCtrl);
