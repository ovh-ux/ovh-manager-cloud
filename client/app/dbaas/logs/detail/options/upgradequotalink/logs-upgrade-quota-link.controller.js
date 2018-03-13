class logsUpgradeQuotaLinkCtrl {
    constructor ($state, $stateParams, $translate, ControllerHelper, ControllerModalHelper, LogsOfferConstant, LogsOfferService) {
        this.$state = $state;
        this.$translate = $translate;
        this.serviceName = $stateParams.serviceName;
        this.ControllerHelper = ControllerHelper;
        this.ControllerModalHelper = ControllerModalHelper;
        this.LogsOfferConstant = LogsOfferConstant;
        this.LogsOfferService = LogsOfferService;
        this._initLoaders();
    }

    $onInit () {
        this.text = this.text || this.$translate.instant("options_upgradequotalink_increase_quota");
        this.selectedOffer.load();
    }

    /**
     * loads the current offer information
     *
     * @memberof logsUpgradeQuotaLinkCtrl
     */
    _initLoaders () {
        this.selectedOffer = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsOfferService.getOffer(this.serviceName)
        });
    }

    /**
     * Checks if the user has a basic offer
     *
     * @returns true if the user is subscribed to a basic offer
     * @memberof logsUpgradeQuotaLinkCtrl
     */
    _isBasicOffer (offerObj) {
        return offerObj.reference === this.LogsOfferConstant.basicOffer;
    }

    /**
     * Checks if the user has a basic offer and if he/she does,
     * pops up a modal dialog asking him/her to upgrade if
     * he/she wants to purchase more options
     *
     * @memberof logsUpgradeQuotaLinkCtrl
     */
    purchaseOptions () {
        if (this._isBasicOffer(this.selectedOffer.data)) {
            return this.ControllerModalHelper.showInfoModal({
                titleText: this.$translate.instant("options_upgradequotalink_increase_quota_title"),
                text: this.$translate.instant("options_upgradequotalink_increase_quota_message"),
                okButtonText: this.$translate.instant("options_upgradequotalink_increase_quota_upgrade")
            })
                .then(() => this.$state.go("dbaas.logs.detail.offer", { serveiceName: this.serviceName }));
        }
        return this.$state.go("dbaas.logs.detail.options", { serviceName: this.serviceName });
    }
}

angular.module("managerApp").controller("logsUpgradeQuotaLinkCtrl", logsUpgradeQuotaLinkCtrl);
