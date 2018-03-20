class logsAddToolCtrl {
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
        const addTxt = this.$translate.instant("add_tool_add");
        this.text = this.text || `${addTxt} ${this.toolName}`;
        this.selectedOffer.load();
    }

    /**
     * loads the current offer information
     *
     * @memberof logsAddToolCtrl
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
     * @memberof logsAddToolCtrl
     */
    _isBasicOffer (offerObj) {
        return offerObj.reference === this.LogsOfferConstant.basicOffer;
    }

    /**
     * Checks if the quota has been reached. If no, it calls the callback.
     * Else if the user has a basic offer, pops up a modal dialog asking
     * him/her to upgrade. Else, pop-ups asking whether he/she wants to
     * purchase more options
     *
     * @memberof logsAddToolCtrl
     */
    addTool () {
        if (this.currentUsage < this.maxUsage) {
            return this.callback();
        } else if (this._isBasicOffer(this.selectedOffer.data)) {
            return this.ControllerModalHelper.showInfoModal({
                titleText: this.$translate.instant("options_upgradequotalink_increase_quota_title"),
                text: this.$translate.instant("options_upgradequotalink_increase_quota_message"),
                okButtonText: this.$translate.instant("options_upgradequotalink_increase_quota_upgrade")
            })
                .then(() => this.$state.go("dbaas.logs.detail.offer", { serviceName: this.serviceName }));
        }
        return this.ControllerModalHelper.showInfoModal({
            titleText: this.$translate.instant("add_tool_title"),
            text: this.$translate.instant("add_tool_quota_reached", { toolname: this.toolName }),
            okButtonText: this.$translate.instant("add_tool_options_purchase")
        })
            .then(() => this.$state.go("dbaas.logs.detail.options", { serviceName: this.serviceName }));
    }
}

angular.module("managerApp").controller("logsAddToolCtrl", logsAddToolCtrl);
