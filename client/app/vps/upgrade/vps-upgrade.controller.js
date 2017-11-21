class VpsUpgradeCtrl {
    constructor ($filter, $translate, $q, VpsService) {
        this.$filter = $filter;
        this.$translate = $translate;
        this.$q = $q;
        this.Vps = VpsService;

        this.loaders = {
            init: false
        };

        this.step = 0;
        this.order = null;
        this.selectedModel = {};
        this.upgradesList = null;
        this.agree = {
            value: false
        };
    }

    $onInit () {
        this.loaders.init = true;
        this.loadNextStep();
    }

    canLoadNextStep (condition, step) {
        if (condition) {
            this.loadNextStep(step);
        }
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
            }).catch(data => {
                this.resetAction();
                return this.$q.reject(data);
            }).finally(() => {
                this.loaders.step1 = false;
            });
        }
    }

    upgradeVps () {
        this.loaders.step2 = true;
        this.order = null;
        const modelToUpgradeTo = $.grep(this.upgradesList, e => { return e.model === this.selectedModel.model; });
        if (modelToUpgradeTo.length) {
            this.selectedModelForUpgrade = modelToUpgradeTo[0];
            return this.Vps.upgrade(this.selectedModelForUpgrade.model, this.selectedModelForUpgrade.duration.duration).then(data => {
                this.agree.value = false;
                this.selectedModelForUpgrade.duration.dateFormatted = this.$filter("date")(this.selectedModelForUpgrade.duration.date, "dd/MM/yyyy");
                this.order = data;
                return data;
            }).catch(data => {
                this.resetAction();
                return this.$q.reject(data);
            }).finally(() => {
                this.loaders.step2 = false;
            });
        }
    }

    displayBC () {
        this.resetAction();
        window.open(
            this.order.url,
            "_blank"
        );
    }

}

angular.module("managerApp").controller("VpsUpgradeCtrl", VpsUpgradeCtrl);
