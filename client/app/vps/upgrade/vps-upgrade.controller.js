class VpsUpgradeCtrl {
    constructor ($filter, $translate, $q, VpsService, CloudMessage) {
        this.$filter = $filter;
        this.$translate = $translate;
        this.$q = $q;
        this.Vps = VpsService;
        this.CloudMessage = CloudMessage;

        this.loaders = {
            init: false
        };

        this.step = 0;
        this.order = null;
        this.selectedModel = {};
        this.upgradesList = null;
    }

    $onInit () {
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
            return this.Vps.upgradesList().then(data => {
                this.upgradesList = data.results;
                return data;
            }).catch(err => {
                this.CloudMessage.error([this.$translate.instant("vps_upgrade_alert_error"), err.data && err.data.message || ""].join(" "));
                return this.$q.reject(err);
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
            return this.Vps.upgrade(this.selectedModelForUpgrade.model, this.selectedModelForUpgrade.duration.duration).then(data => {
                this.conditionsAgree = false;
                this.selectedModelForUpgrade.duration.dateFormatted = this.$filter("date")(this.selectedModelForUpgrade.duration.date, "dd/MM/yyyy");
                this.order = data;
                return data;
            }).catch(err => {
                this.CloudMessage.error([this.$translate.instant("vps_upgrade_alert_error"), err.data && err.data.message || ""].join(" "));
                return this.$q.reject(err);
            }).finally(() => {
                this.loaders.step2 = false;
            });
        }
    }

    cancel () {
        history.back();
    }

    confirm () {
        // action to upgrade
    }

    displayBC () {
        window.open(
            this.order.url,
            "_blank"
        );
    }

}

angular.module("managerApp").controller("VpsUpgradeCtrl", VpsUpgradeCtrl);
