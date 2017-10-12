class DeskaasUpgradeCtrl {
    constructor ($translate, $q, $state, $stateParams, ControllerHelper, DeskaasService, OvhApiDeskaasService) {
        this.$translate = $translate;
        this.$q = $q;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.ControllerHelper = ControllerHelper;
        this.DeskaasService = DeskaasService;
        this.OvhApiDeskaasService = OvhApiDeskaasService;
        this.choice = null;
        this.flags = {
            init: true
        };
    }

    $onInit () {
        this.serviceName = this.$stateParams.serviceName;
        this.references = this.$stateParams.references;

        if (this.references) {
            this.flags.init = false;
            return;
        }
        this.DeskaasService.getMe()
            .then(me => {
                this.me = me;
                return this.DeskaasService.fetchProductPlans(me);
            })
            .then(() => this.DeskaasService.getDetails(this.serviceName))
            .then(details => {
                this.details = details;
                this.references = this.DeskaasService.getUpgradeOptions(details.planCode);
            })
            .finally(() => {
                this.flags.init = false;
            });
    }

    confirmUpgrade () {
        this.saving = true;
        return this.ControllerHelper.modal.showConfirmationModal({
            titleText: this.$translate.instant("vdi_btn_popup_upgrade"),
            text: this.$translate.instant("vdi_confirm_upgrade", { plan: this.choice.name, price: this.choice.priceText })
        })
            .then(() => this.OvhApiDeskaasService.Lexi().upgradeService({
                serviceName: this.serviceName
            }, {
                planCode: this.choice.planCode
            }))
            .then(taskId => {
                this.$state.go("deskaas.details", { serviceName: this.serviceName, followTask: taskId });
            })
            .finally(() => {
                this.saving = false;
            });
    }

    selectChoice (value) {
        this.choice = JSON.parse(value);
    }
}

angular.module("managerApp").controller("DeskaasUpgradeCtrl", DeskaasUpgradeCtrl);
